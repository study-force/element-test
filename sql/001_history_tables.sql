-- =========================================================
-- 변경 이력 추적: element_statements / element_frames / element_types
-- prod + dev 양쪽 Supabase SQL Editor 에서 1회씩 실행
-- =========================================================

-- 1) 이력 테이블 -------------------------------------------------
CREATE TABLE IF NOT EXISTS element_statements_history (
  history_id   BIGSERIAL PRIMARY KEY,
  statement_id BIGINT,
  frame_id     TEXT,
  key          TEXT,
  pole         TEXT,
  text         TEXT,
  sort_order   INT,
  op           TEXT NOT NULL,          -- INSERT | UPDATE | DELETE
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_esh_frame_key
  ON element_statements_history(frame_id, key, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_esh_changed_at
  ON element_statements_history(changed_at DESC);

CREATE TABLE IF NOT EXISTS element_frames_history (
  history_id  BIGSERIAL PRIMARY KEY,
  frame_pk    BIGINT,
  frame_id    TEXT,
  theme       TEXT,
  dimension   TEXT,
  axis_type   TEXT,
  sort_order  INT,
  op          TEXT NOT NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_efh_changed_at
  ON element_frames_history(changed_at DESC);

CREATE TABLE IF NOT EXISTS element_types_history (
  history_id          BIGSERIAL PRIMARY KEY,
  type_pk             BIGINT,
  key                 TEXT,
  emoji               TEXT,
  char_name           TEXT,
  type_name           TEXT,
  body_question       TEXT,
  slogan              TEXT,
  subtitle            TEXT,
  strengths           TEXT[],
  weaknesses          TEXT[],
  color               TEXT,
  bg                  TEXT,
  accent              TEXT,
  description_what    TEXT,
  description_how     TEXT,
  description_caution TEXT,
  tq_desc             TEXT,
  tq_detail           TEXT,
  sort_order          INT,
  op                  TEXT NOT NULL,
  changed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eth_changed_at
  ON element_types_history(changed_at DESC);

-- 이전 실행에서 잘못된 타입으로 만들어졌을 경우 보정
ALTER TABLE element_types_history
  ALTER COLUMN strengths  TYPE text[] USING NULL,
  ALTER COLUMN weaknesses TYPE text[] USING NULL;
ALTER TABLE element_types_history
  ALTER COLUMN tq_detail  TYPE text   USING NULL;

-- 2) 트리거 함수 -------------------------------------------------
CREATE OR REPLACE FUNCTION log_element_statements_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO element_statements_history
      (statement_id, frame_id, key, pole, text, sort_order, op)
    VALUES
      (OLD.id, OLD.frame_id, OLD.key, OLD.pole, OLD.text, OLD.sort_order, 'DELETE');
    RETURN OLD;
  ELSE
    INSERT INTO element_statements_history
      (statement_id, frame_id, key, pole, text, sort_order, op)
    VALUES
      (NEW.id, NEW.frame_id, NEW.key, NEW.pole, NEW.text, NEW.sort_order, TG_OP);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_element_frames_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO element_frames_history
      (frame_pk, frame_id, theme, dimension, axis_type, sort_order, op)
    VALUES
      (OLD.id, OLD.frame_id, OLD.theme, OLD.dimension, OLD.axis_type, OLD.sort_order, 'DELETE');
    RETURN OLD;
  ELSE
    INSERT INTO element_frames_history
      (frame_pk, frame_id, theme, dimension, axis_type, sort_order, op)
    VALUES
      (NEW.id, NEW.frame_id, NEW.theme, NEW.dimension, NEW.axis_type, NEW.sort_order, TG_OP);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

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

-- 3) 트리거 ------------------------------------------------------
DROP TRIGGER IF EXISTS trg_element_statements_history ON element_statements;
CREATE TRIGGER trg_element_statements_history
AFTER INSERT OR UPDATE OR DELETE ON element_statements
FOR EACH ROW EXECUTE FUNCTION log_element_statements_change();

DROP TRIGGER IF EXISTS trg_element_frames_history ON element_frames;
CREATE TRIGGER trg_element_frames_history
AFTER INSERT OR UPDATE OR DELETE ON element_frames
FOR EACH ROW EXECUTE FUNCTION log_element_frames_change();

DROP TRIGGER IF EXISTS trg_element_types_history ON element_types;
CREATE TRIGGER trg_element_types_history
AFTER INSERT OR UPDATE OR DELETE ON element_types
FOR EACH ROW EXECUTE FUNCTION log_element_types_change();

-- 4) RLS: 서비스롤만 접근 (anon/authenticated 정책 없음 = 접근 불가) -
ALTER TABLE element_statements_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_frames_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_types_history      ENABLE ROW LEVEL SECURITY;

-- 5) (옵션) 현재 상태를 "초기 스냅샷"으로 한 줄씩 기록해두기 -------
--    심은 이후의 변경분만 쌓이지만, 현재 값을 "시작점"으로 남겨두면
--    나중에 어떤 내용이 기준이었는지 알기 쉬움.
INSERT INTO element_statements_history
  (statement_id, frame_id, key, pole, text, sort_order, op)
SELECT id, frame_id, key, pole, text, sort_order, 'INSERT'
FROM element_statements
WHERE NOT EXISTS (SELECT 1 FROM element_statements_history);

INSERT INTO element_frames_history
  (frame_pk, frame_id, theme, dimension, axis_type, sort_order, op)
SELECT id, frame_id, theme, dimension, axis_type, sort_order, 'INSERT'
FROM element_frames
WHERE NOT EXISTS (SELECT 1 FROM element_frames_history);

INSERT INTO element_types_history
  (type_pk, key, emoji, char_name, type_name, body_question, slogan, subtitle,
   strengths, weaknesses, color, bg, accent,
   description_what, description_how, description_caution, tq_desc, tq_detail, sort_order, op)
SELECT id, key, emoji, char_name, type_name, body_question, slogan, subtitle,
       strengths, weaknesses, color, bg, accent,
       description_what, description_how, description_caution, tq_desc, tq_detail, sort_order, 'INSERT'
FROM element_types
WHERE NOT EXISTS (SELECT 1 FROM element_types_history);
