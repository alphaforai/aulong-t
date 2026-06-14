import { request } from "@/lib/api/request";



// GET /api/platform-config/{key}

export async function getPlatformConfig(key) {
  if (key == null || String(key).trim() === "") {
    throw new Error("key is required");
  }
  const result = await request(
    `/api/platform-config/${encodeURIComponent(String(key).trim())}`,
    { method: "GET", auth: false }, 
  );
  return result.data;
}