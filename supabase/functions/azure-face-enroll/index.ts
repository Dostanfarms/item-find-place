// @ts-nocheck
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const AZURE_KEY = Deno.env.get("AZURE_FACE_KEY")!;
const AZURE_ENDPOINT = (Deno.env.get("AZURE_FACE_ENDPOINT") || "").replace(/\/+$/, "");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TABLE_BY_TYPE: Record<string, string> = {
  employee: "admin_employees",
  partner: "delivery_partners",
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function azureDetect(bytes: Uint8Array) {
  const url = `${AZURE_ENDPOINT}/face/v1.0/detect?returnFaceId=true&detectionModel=detection_03&recognitionModel=recognition_04&returnFaceAttributes=qualityForRecognition`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY,
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Azure /detect failed [${res.status}]: ${JSON.stringify(json)}`);
  return json as Array<{ faceId: string; faceAttributes?: { qualityForRecognition?: string } }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!AZURE_KEY || !AZURE_ENDPOINT) throw new Error("Azure Face credentials not configured");

    const { subjectType, subjectId, imageDataUrl } = await req.json();
    if (!subjectType || !subjectId || !imageDataUrl) throw new Error("Missing required fields");
    const table = TABLE_BY_TYPE[subjectType];
    if (!table) throw new Error("Invalid subjectType");

    const bytes = dataUrlToBytes(imageDataUrl);

    // 1. Validate image quality via Azure
    const faces = await azureDetect(bytes);
    if (faces.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "No face detected. Please face the camera clearly." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (faces.length > 1) {
      return new Response(JSON.stringify({ ok: false, error: "Multiple faces detected. Only one person allowed." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const quality = faces[0].faceAttributes?.qualityForRecognition;
    if (quality === "low") {
      return new Response(JSON.stringify({ ok: false, error: "Face image quality too low. Improve lighting and try again." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Upload to storage
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const path = `${subjectType}/${subjectId}.jpg`;
    const { error: upErr } = await admin.storage
      .from("face-references")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
    if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

    // 3. Update DB
    const { error: dbErr } = await admin
      .from(table)
      .update({ face_reference_url: path, face_enrolled_at: new Date().toISOString() })
      .eq("id", subjectId);
    if (dbErr) throw new Error(`DB update failed: ${dbErr.message}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("azure-face-enroll error:", err);
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
