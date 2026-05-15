-- Supabase Security Advisor: "Function Search Path Mutable" 경고 해결
-- 트리거 함수에 search_path를 고정해서 search_path 하이재킹을 차단
-- 적용: element-test (PROD) + element-test-dev 양쪽 모두 1회 실행

ALTER FUNCTION public.log_element_statements_change() SET search_path = public, pg_catalog;
ALTER FUNCTION public.log_element_frames_change()     SET search_path = public, pg_catalog;
ALTER FUNCTION public.log_element_types_change()      SET search_path = public, pg_catalog;
