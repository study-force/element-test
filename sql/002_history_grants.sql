-- =========================================================
-- history 테이블에 service_role 접근 권한 부여
-- (SQL로 만든 테이블은 기본적으로 service_role 권한이 없음)
-- prod + dev 각각 1회 실행
-- =========================================================

GRANT ALL ON element_statements_history TO service_role;
GRANT ALL ON element_frames_history     TO service_role;
GRANT ALL ON element_types_history      TO service_role;

GRANT USAGE, SELECT ON SEQUENCE element_statements_history_history_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE element_frames_history_history_id_seq     TO service_role;
GRANT USAGE, SELECT ON SEQUENCE element_types_history_history_id_seq      TO service_role;
