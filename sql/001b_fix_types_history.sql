-- =========================================================
-- 001_history_tables.sql 실행 중 element_types_history 에서
-- strengths/weaknesses 타입 불일치로 실패한 경우 복구용
-- prod + dev 각각 1회 실행
-- =========================================================

-- 1) element_types 의 실제 타입에 맞춰 이력 테이블 컬럼 타입 변경
--    (strengths/weaknesses 는 text[], tq_detail 은 jsonb 유지)
ALTER TABLE element_types_history
  ALTER COLUMN strengths  TYPE text[] USING NULL,
  ALTER COLUMN weaknesses TYPE text[] USING NULL;

-- 2) 트리거 함수 재생성 (동일 정의, 타입 일치)
CREATE OR REPLACE FUNCTION log_element_types_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO element_types_history
      (type_pk, key, emoji, char_name, type_name, body_question, slogan, subtitle,
       strengths, weaknesses, color, bg, accent,
       description_what, description_how, description_caution, tq_desc, tq_detail, sort_order, op)
    VALUES
      (OLD.id, OLD.key, OLD.emoji, OLD.char_name, OLD.type_name, OLD.body_question, OLD.slogan, OLD.subtitle,
       OLD.strengths, OLD.weaknesses, OLD.color, OLD.bg, OLD.accent,
       OLD.description_what, OLD.description_how, OLD.description_caution, OLD.tq_desc, OLD.tq_detail, OLD.sort_order, 'DELETE');
    RETURN OLD;
  ELSE
    INSERT INTO element_types_history
      (type_pk, key, emoji, char_name, type_name, body_question, slogan, subtitle,
       strengths, weaknesses, color, bg, accent,
       description_what, description_how, description_caution, tq_desc, tq_detail, sort_order, op)
    VALUES
      (NEW.id, NEW.key, NEW.emoji, NEW.char_name, NEW.type_name, NEW.body_question, NEW.slogan, NEW.subtitle,
       NEW.strengths, NEW.weaknesses, NEW.color, NEW.bg, NEW.accent,
       NEW.description_what, NEW.description_how, NEW.description_caution, NEW.tq_desc, NEW.tq_detail, NEW.sort_order, TG_OP);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_element_types_history ON element_types;
CREATE TRIGGER trg_element_types_history
AFTER INSERT OR UPDATE OR DELETE ON element_types
FOR EACH ROW EXECUTE FUNCTION log_element_types_change();

-- 3) element_types 초기 스냅샷 (처음 실행이 실패해서 안 들어갔을 가능성)
INSERT INTO element_types_history
  (type_pk, key, emoji, char_name, type_name, body_question, slogan, subtitle,
   strengths, weaknesses, color, bg, accent,
   description_what, description_how, description_caution, tq_desc, tq_detail, sort_order, op)
SELECT id, key, emoji, char_name, type_name, body_question, slogan, subtitle,
       strengths, weaknesses, color, bg, accent,
       description_what, description_how, description_caution, tq_desc, tq_detail, sort_order, 'INSERT'
FROM element_types
WHERE NOT EXISTS (SELECT 1 FROM element_types_history);
