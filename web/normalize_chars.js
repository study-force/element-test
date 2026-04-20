// 캐릭터 PNG 정규화 — 알파 트리밍 후 1024×1024 정사각 캔버스에
// 캐릭터 높이가 항상 동일(targetH)하도록 배치. 가로는 비율 유지하며 가운데 정렬.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FILES = [
  'char_fire.png','char_wind.png','char_earth.png','char_water.png',
  'char_fire_white.png','char_wind_white.png','char_earth_white.png','char_water_white.png',
];

const CANVAS = 1024;       // 출력 정사각 캔버스
const TARGET_PIXELS = 700; // 실제 채워진 픽셀 기준 √(opaquePixels) 목표값
const MAX_SIDE_RATIO = 0.96; // 캔버스 대비 최대 변 비율 (1024*0.96≈983)
const ALPHA_THR = 16;

// 캐릭터별 미세 조정 배율 (정규화 후 추가 곱)
const PER_CHAR_SCALE = {
  fire: 1.0,
  wind: 1.0,
  earth: 1.0,
  water: 0.95,
};

async function bbox(file){
  const img = sharp(file);
  const meta = await img.metadata();
  const w = meta.width, h = meta.height;
  const raw = await img.ensureAlpha().raw().toBuffer();
  let minX=w, minY=h, maxX=-1, maxY=-1;
  let opaquePixels = 0;
  for (let y=0; y<h; y++){
    for (let x=0; x<w; x++){
      const a = raw[(y*w+x)*4+3];
      if (a > ALPHA_THR){
        opaquePixels++;
        if (x<minX) minX=x;
        if (x>maxX) maxX=x;
        if (y<minY) minY=y;
        if (y>maxY) maxY=y;
      }
    }
  }
  return {w, h, minX, minY, maxX, maxY, bw: maxX-minX+1, bh: maxY-minY+1, opaquePixels};
}

async function processOne(file){
  const bb = await bbox(file);
  const visualMass = Math.sqrt(bb.opaquePixels); // 실제 불투명 픽셀의 √(개수)

  // 1. 트리밍
  const trimmed = await sharp(file)
    .extract({left: bb.minX, top: bb.minY, width: bb.bw, height: bb.bh})
    .toBuffer();

  // 2. 픽셀 질량 기준 scale — 실제 채워진 픽셀 수가 동일해지도록
  let scale = TARGET_PIXELS / visualMass;

  // 3. 캔버스 한계 체크 — 최대 변이 캔버스를 넘지 않도록 자동 클램프
  const maxSide = Math.max(bb.bw, bb.bh) * scale;
  const limit = CANVAS * MAX_SIDE_RATIO;
  if (maxSide > limit) scale *= (limit / maxSide);

  // 3-1. 캐릭터별 미세 조정
  const key = path.basename(file).match(/char_(fire|wind|earth|water)/);
  if (key && PER_CHAR_SCALE[key[1]] != null){
    scale *= PER_CHAR_SCALE[key[1]];
  }

  const newW = Math.round(bb.bw * scale);
  const newH = Math.round(bb.bh * scale);

  console.log(file,
    'src=', bb.w+'x'+bb.h,
    'bbox=', bb.bw+'x'+bb.bh,
    'fill=', (bb.opaquePixels/(bb.bw*bb.bh)*100).toFixed(0)+'%',
    '√mass=', visualMass.toFixed(0),
    'scale=', scale.toFixed(2),
    '→', newW+'x'+newH
  );

  const resized = await sharp(trimmed).resize({width: newW, height: newH}).toBuffer();

  // 4. 캔버스 가운데 배치
  const out = await sharp({
    create: {
      width: CANVAS, height: CANVAS, channels: 4,
      background: {r:0, g:0, b:0, alpha:0}
    }
  })
    .composite([{
      input: resized,
      left: Math.round((CANVAS - newW)/2),
      top:  Math.round((CANVAS - newH)/2),
    }])
    .png({compressionLevel: 9})
    .toBuffer();

  fs.writeFileSync(file, out);
}

(async () => {
  for (const f of FILES){
    if (!fs.existsSync(f)){ console.log('skip (missing):', f); continue; }
    await processOne(f);
  }
  console.log('\n--- done. originals backed up in _bak_chars/ ---');
})();
