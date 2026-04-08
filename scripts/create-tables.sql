-- element_frames: 프레임(질문 그룹) 테이블
CREATE TABLE IF NOT EXISTS element_frames (
  id SERIAL PRIMARY KEY,
  frame_id INT NOT NULL UNIQUE,
  theme TEXT NOT NULL,
  dimension TEXT,
  axis_type TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- element_statements: 개별 문항 테이블
CREATE TABLE IF NOT EXISTS element_statements (
  id SERIAL PRIMARY KEY,
  frame_id INT NOT NULL REFERENCES element_frames(frame_id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  pole TEXT,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- element_types: 4가지 원소 유형 테이블
CREATE TABLE IF NOT EXISTS element_types (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  emoji TEXT,
  char_name TEXT,
  type_name TEXT,
  slogan TEXT,
  subtitle TEXT,
  body_question TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  color TEXT,
  bg TEXT,
  accent TEXT,
  description_what TEXT,
  description_how TEXT,
  description_caution TEXT,
  tq_desc TEXT,
  tq_detail TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE element_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_types ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 허용 (퀴즈에서 사용)
CREATE POLICY "public_read_frames" ON element_frames FOR SELECT USING (true);
CREATE POLICY "public_read_statements" ON element_statements FOR SELECT USING (true);
CREATE POLICY "public_read_types" ON element_types FOR SELECT USING (true);

-- 서비스 역할 전체 접근 (어드민 API)
CREATE POLICY "service_all_frames" ON element_frames FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_statements" ON element_statements FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_types" ON element_types FOR ALL USING (auth.role() = 'service_role');

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_frames_updated_at BEFORE UPDATE ON element_frames
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_statements_updated_at BEFORE UPDATE ON element_statements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_types_updated_at BEFORE UPDATE ON element_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
