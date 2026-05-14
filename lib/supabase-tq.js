import { createClient } from "@supabase/supabase-js";

// TQ Supabase (element-test와 별개 프로젝트)
// 환경변수: TQ_SUPABASE_URL / TQ_SUPABASE_SERVICE_ROLE_KEY

let _client = null;

export function isTqEnabled() {
  return !!(process.env.TQ_SUPABASE_URL && process.env.TQ_SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseTq() {
  if (!isTqEnabled()) {
    throw new Error("TQ_SUPABASE_URL / TQ_SUPABASE_SERVICE_ROLE_KEY 환경변수 필요");
  }
  if (!_client) {
    let url = (process.env.TQ_SUPABASE_URL || "").trim();
    url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
    _client = createClient(url, process.env.TQ_SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}
