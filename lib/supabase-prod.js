import { createClient } from "@supabase/supabase-js";

// Publish (dev → prod 반영) 전용.
// dev 배포에만 PROD_SUPABASE_URL / PROD_SUPABASE_SERVICE_ROLE_KEY 를 설정.
// prod 배포에는 설정하지 않음 → isProdPublishEnabled() === false

let _client = null;

export function isProdPublishEnabled() {
  return !!(process.env.PROD_SUPABASE_URL && process.env.PROD_SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseProd() {
  if (!isProdPublishEnabled()) {
    throw new Error("PROD_SUPABASE_URL / PROD_SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다 (dev 전용 기능)");
  }
  if (!_client) {
    // URL 정규화: trailing slash, /rest/v1 경로 등을 제거
    let url = (process.env.PROD_SUPABASE_URL || "").trim();
    url = url.replace(/\/rest\/v1\/?$/, "");
    url = url.replace(/\/+$/, "");
    _client = createClient(url, process.env.PROD_SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}
