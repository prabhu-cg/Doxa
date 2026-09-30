import "server-only";
import { createSupabaseAdminClient } from "@/server/supabase/admin-client";
import { LOGO_MAX_BYTES, LOGO_TYPES } from "./schema";

const BUCKET = "org-logos";

let bucketReady = false;

/** Creates the public logo bucket the first time it's needed. Logos are shown
 * to anyone who opens a public board, so the bucket is public-read; writes
 * only ever happen here, through the service role. */
async function ensureBucket() {
  if (bucketReady) return;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: LOGO_MAX_BYTES,
    allowedMimeTypes: Object.keys(LOGO_TYPES),
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Could not prepare logo storage: ${error.message}`);
  }
  bucketReady = true;
}

/** Stores the file under the organisation's folder and returns its public URL.
 * Every upload gets a new name, so a replaced logo is never served from cache. */
export async function uploadLogo(
  organizationId: string,
  file: File,
): Promise<string> {
  await ensureBucket();
  const extension = LOGO_TYPES[file.type as keyof typeof LOGO_TYPES];
  const path = `${organizationId}/logo-${Date.now()}.${extension}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Could not upload the logo: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Removes a logo we stored. A URL that isn't in our bucket (one pasted in
 * before uploads existed) is left alone. Failing to delete never fails the
 * caller: a leftover file is harmless, a blocked save isn't. */
export async function deleteLogo(
  organizationId: string,
  logoUrl: string | null,
) {
  if (!logoUrl) return;
  const marker = `/${BUCKET}/`;
  const at = logoUrl.indexOf(marker);
  if (at === -1) return;
  const path = logoUrl.slice(at + marker.length).split("?")[0];
  if (!path.startsWith(`${organizationId}/`)) return;
  try {
    await createSupabaseAdminClient().storage.from(BUCKET).remove([path]);
  } catch {
    // see above
  }
}
