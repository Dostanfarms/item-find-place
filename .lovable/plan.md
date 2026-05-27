# Azure Face Liveness + Verify Integration

Replace the current `face-api.js` descriptor matching with Microsoft Azure Face API **Liveness with Verify**. Every enrollment and every login will run through Azure's session-based liveness flow, which rejects photos, video replays, and masks server-side.

## Prerequisites (user action)

1. Azure Face resource at `https://zippy.cognitiveservices.azure.com/` must have **Limited Access** approval for the *Face Liveness Detection / Verify* feature (request form: aka.ms/facerecognition). Without approval the `/detectLivenessWithVerify` endpoints return 403.
2. Add two secrets via the secrets tool: `AZURE_FACE_KEY` (subscription key) and `AZURE_FACE_ENDPOINT` (`https://zippy.cognitiveservices.azure.com`).

## 1. Database (one migration)

Add to `admin_employees` and `delivery_partners`:
- `face_reference_url text` – signed/public URL of the enrolled reference image in Supabase Storage.
- `face_enrolled_at timestamptz`.

Keep the existing `face_descriptor` column for now (used only as legacy fallback flag; not read after migration).

Create private storage bucket `face-references` (not public). Policies: only service role can read/write; edge functions use service role.

## 2. Edge Functions (3 new, all `verify_jwt = false`, CORS enabled)

a. **`azure-face-enroll`** – POST `{ subjectType: 'employee'|'partner', subjectId, imageBase64 }`
   - Calls Azure `POST /face/v1.2/detect?returnFaceId=true&detectionModel=detection_03&recognitionModel=recognition_04` to validate the reference image has exactly one face of acceptable quality. Rejects on `noFace`, `multipleFaces`, low quality.
   - Uploads the image to `face-references/{subjectType}/{subjectId}.jpg`.
   - Writes `face_reference_url` + `face_enrolled_at` on the row.

b. **`azure-liveness-session`** – POST `{ subjectType, subjectId, mode: 'enroll'|'login' }`
   - For `login`: fetches the row's `face_reference_url`, downloads the bytes, and calls Azure `POST /face/v1.2-preview/detectLivenessWithVerify/singleModal/sessions` as a multipart body with the reference image, `livenessOperationMode=Passive`, `sendResultsToClient=false`, `deviceCorrelationId=<subjectId>`.
   - For `enroll`: same endpoint without the reference image (`detectLiveness/singleModal/sessions`) – the captured frame becomes the reference.
   - Returns `{ sessionId, authToken }` to the browser. The `authToken` is short-lived and scoped to one session.

c. **`azure-liveness-result`** – POST `{ sessionId, subjectType, subjectId, mode }`
   - Calls Azure `GET /face/v1.2-preview/detectLivenessWithVerify/singleModal/sessions/{sessionId}` using the subscription key.
   - Reads `results.attempts[last].result.livenessDecision` (must be `realface`) and, for login mode, `verifyResult.isIdentical === true` with `confidence >= 0.7`.
   - If enroll: downloads the captured face image from the session, stores in `face-references/...`, updates DB.
   - If login: returns `{ ok: true }` only when both liveness and verify pass.

All Azure calls use `Ocp-Apim-Subscription-Key: AZURE_FACE_KEY` with `AZURE_FACE_ENDPOINT` as base.

## 3. Frontend SDK

Add `@azure/ai-vision-face-ui` (official Web client) via `bun add`. It exposes a Web Component `<azure-ai-vision-face-ui>` that handles camera, motion cues, and POSTs frames straight to Azure using the `authToken` issued by our edge function. Source is never on our server.

## 4. New component: `AzureFaceModal.tsx`

Replaces `FaceCaptureModal` usage in the four target screens. Props:
```
{ open, onClose, mode: 'enroll' | 'login',
  subjectType: 'employee' | 'partner', subjectId,
  onSuccess: () => void }
```

Flow inside the modal:
1. Call `azure-liveness-session` → get `{ sessionId, authToken }`.
2. Mount `<azure-ai-vision-face-ui>` with the token. The component drives the user through the live capture and signals completion.
3. On completion, call `azure-liveness-result`. Show pass / fail UI accordingly.
4. On hard failure (timeout, spoof detected, low confidence) show **Retry** + **Cancel**. No fallback to local face-api.js – hard fail per your choice.

Remove `requireLiveness` and EAR blink logic from the old modal; delete `FaceCaptureModal` references after migration.

## 5. Screen wiring (4 files)

| File | Change |
|------|--------|
| `src/pages/dashboard/EmployeeForm.tsx` | Replace `FaceCaptureModal` enroll trigger with `AzureFaceModal mode="enroll"` after the row is created (need subjectId; create row first with `face_enrolled_at=null`, then enroll). |
| `src/contexts/AdminAuthContext.tsx` + `src/pages/AdminLogin.tsx` | `login()` now: lookup employee by mobile → open `AzureFaceModal mode="login" subjectId=employee.id` → on `onSuccess` mark session and proceed. Remove descriptor math + 0.55 threshold. Superadmin bypass kept (no Azure call). |
| `src/components/CreateDeliveryPartnerForm.tsx` and `src/pages/dashboard/DeliveryPartners.tsx` edit form | Same enroll pattern as employee form. |
| `src/pages/DeliveryPartnerLogin.tsx` | Replace face-api.js verify with `AzureFaceModal mode="login"`. Drop `faceDistance` import. |

Block login when `face_enrolled_at IS NULL` with toast "Face not enrolled. Contact admin."

## 6. Cleanup

- Delete `faceDistance` exports from `FaceCaptureModal.tsx` once the four screens are migrated.
- Keep the `/public/face-models` folder for now (small) – can be removed later.

## Failure UX (hard fail mode)

| Cause | Message |
|------|---------|
| Liveness `spoof` | "Live face not detected. Please remove photo / video and retry." |
| `verifyResult.isIdentical=false` | "Face does not match the enrolled profile." |
| Azure 4xx/5xx / network | "Face verification service unavailable. Try again." (no fallback) |
| Camera denied | "Camera permission is required to log in." |

## Files touched

- New migration (columns + storage bucket + policies)
- New: `supabase/functions/azure-face-enroll/index.ts`
- New: `supabase/functions/azure-liveness-session/index.ts`
- New: `supabase/functions/azure-liveness-result/index.ts`
- New: `src/components/AzureFaceModal.tsx`
- Edit: `src/contexts/AdminAuthContext.tsx`, `src/pages/AdminLogin.tsx`
- Edit: `src/pages/dashboard/EmployeeForm.tsx`
- Edit: `src/components/CreateDeliveryPartnerForm.tsx`
- Edit: `src/pages/dashboard/DeliveryPartners.tsx`
- Edit: `src/pages/DeliveryPartnerLogin.tsx`
- `package.json` (+ `@azure/ai-vision-face-ui`)
- `supabase/config.toml` (add 3 functions with `verify_jwt = false`)

## Notes / limits

- Azure Face Liveness is gated behind Microsoft's Limited Access review. If approval is not yet granted, the session endpoints will 403 and nothing on the client side can fix that.
- The Web UI SDK requires HTTPS and a real camera; it will not work in some embedded WebViews on older Android. The native Capacitor Android app would need the Android Liveness SDK later (out of scope here – flag for a follow-up if needed).
- One subscription key is shared by enroll + login; rotating it requires updating only the `AZURE_FACE_KEY` secret.
