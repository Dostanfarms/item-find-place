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

const MATCH_THRESHOLD = 0.6;

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

async function azureVerify(faceId1: string, faceId2: string) {
  const url = `${AZURE_ENDPOINT}/face/v1.0/verify`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ faceId1, faceId2 }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Azure /verify failed [${res.status}]: ${JSON.stringify(json)}`);
  return json as { isIdentical: boolean; confidence: number };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!AZURE_KEY || !AZURE_ENDPOINT) throw new Error("Azure Face credentials not configured");

    const { subjectType, subjectId, imageDataUrl } = await req.json();
    if (!subjectType || !subjectId || !imageDataUrl) throw new Error("Missing required fields");
    const table = TABLE_BY_TYPE[subjectType];
    if (!table) throw new Error("Invalid subjectType");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Fetch reference path
    const { data: row, error: rowErr } = await admin
      .from(table)
      .select("face_reference_url")
      .eq("id", subjectId)
      .maybeSingle();
    if (rowErr) throw new Error(`DB lookup failed: ${rowErr.message}`);
    if (!row?.face_reference_url) {
      return new Response(JSON.stringify({ ok: false, error: "Face not enrolled. Contact admin." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download reference image
    const { data: refBlob, error: dlErr } = await admin.storage
      .from("face-references")
      .download(row.face_reference_url);
    if (dlErr || !refBlob) throw new Error(`Reference image download failed: ${dlErr?.message}`);
    const refBytes = new Uint8Array(await refBlob.arrayBuffer());

    // Detect both faces
    const liveBytes = dataUrlToBytes(imageDataUrl);
    const [liveFaces, refFaces] = await Promise.all([
      azureDetect(liveBytes),
      azureDetect(refBytes),
    ]);

    if (liveFaces.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "No live face detected." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (liveFaces.length > 1) {
      return new Response(JSON.stringify({ ok: false, error: "Multiple faces detected." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (liveFaces[0].faceAttributes?.qualityForRecognition === "low") {
      return new Response(JSON.stringify({ ok: false, error: "Face quality too low. Improve lighting." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (refFaces.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Enrolled reference invalid. Please re-enroll." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verify = await azureVerify(liveFaces[0].faceId, refFaces[0].faceId);
    if (!verify.isIdentical || verify.confidence < MATCH_THRESHOLD) {
      return new Response(JSON.stringify({
        ok: false,
        error: `Face does not match the enrolled profile (confidence ${(verify.confidence * 100).toFixed(0)}%).`,
        confidence: verify.confidence,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, confidence: verify.confidence }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("azure-face-verify error:", err);
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
