function createTQApplicationForm() {
  var form = FormApp.create('TQ 컨설턴트 도입 신청서');

  form.setDescription(
    'TQ 컨설턴트 도입을 신청해주셔서 감사합니다.\n' +
    '아래 정보를 입력해주시면 빠르게 안내드리겠습니다.\n\n' +
    '* 오픈 기념 1개월 무료 체험 후 도입 여부를 결정하실 수 있습니다.'
  );

  form.setConfirmationMessage(
    '신청이 완료되었습니다!\n' +
    '빠른 시일 내에 연락드리겠습니다.\n' +
    '감사합니다. - 스터디포스'
  );

  // 1. 학원명 (필수)
  form.addTextItem()
    .setTitle('학원명')
    .setHelpText('예: 스터디포스 분당센터')
    .setRequired(true);

  // 2. 원장님 성함 (필수)
  form.addTextItem()
    .setTitle('원장님 성함')
    .setRequired(true);

  // 3. 연락처 (필수)
  form.addTextItem()
    .setTitle('연락처 (전화번호)')
    .setHelpText('예: 010-1234-5678')
    .setRequired(true);

  // 4. 희망 학원 ID (선택)
  form.addTextItem()
    .setTitle('희망 학원 ID (영문)')
    .setHelpText('학원 전용 검사 링크에 사용됩니다. 예: bundang, gangnam (미입력 시 자동 배정)')
    .setRequired(false);

  // 5. 도입 이유 (복수 선택, 필수)
  form.addCheckboxItem()
    .setTitle('도입 이유 (복수 선택 가능)')
    .setChoiceValues([
      '학부모 상담 자료가 필요해서',
      '신규 학생 유치 / 마케팅 활용',
      '학생 학습 역량을 정밀 진단하고 싶어서',
      'TQ 독해력 훈련 프로그램 도입 목적',
      '경쟁 학원과의 차별화',
      '기존 TQ 테스트를 이미 사용 중이라서'
    ])
    .setRequired(true);

  // 6. 기타 문의사항 (선택)
  form.addParagraphTextItem()
    .setTitle('기타 문의사항')
    .setHelpText('추가로 궁금하신 점이 있으시면 자유롭게 작성해주세요.')
    .setRequired(false);

  // 완성된 폼 URL 출력
  Logger.log('=== 폼 생성 완료 ===');
  Logger.log('편집 URL: ' + form.getEditUrl());
  Logger.log('응답 URL: ' + form.getPublishedUrl());
  Logger.log('==================');
}
