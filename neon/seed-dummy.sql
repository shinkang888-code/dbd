-- Dummy seed for KSAC boards (is_dummy = true). Cleared when switching to live mode.

DELETE FROM notices WHERE is_dummy = true;
DELETE FROM resources WHERE is_dummy = true;
DELETE FROM gallery WHERE is_dummy = true;
DELETE FROM banners WHERE is_dummy = true;

INSERT INTO notices (author_name, category, title, content, views, pinned, published, thumbnail_url, is_dummy, created_at) VALUES
(
  '사무국', '공지',
  '2026년 대한학술융합학회 정기총회 안내',
  E'회원 여러분께 알립니다.\n\n2026년 정기총회를 아래와 같이 개최합니다.\n\n일시: 2026년 3월 20일(금) 14:00\n장소: 서울특별시 서초구 서초중앙로22길 47 문화빌딩\n안건: 사업보고, 예산·결산, 임원 선출 관련 논의\n\n많은 참석 부탁드립니다.',
  128, true, true, '/media/conference-ceremony.jpg', true, now() - interval '12 days'
),
(
  '사무국', '학술대회',
  '제1회 KSAC 융합학술대회 논문 모집',
  E'융합 주제의 연구성과를 공유하는 제1회 KSAC 융합학술대회 논문을 모집합니다.\n\n모집 분야: AI·인문사회 융합, 산업·정책 융합, 교육·기술 융합 등\n투고 기한: 추후 공지\n투고 방법: 홈페이지 「논문투고」 메뉴의 투고시스템을 이용해 주세요.\n\n우수 논문은 학술지 게재 및 시상이 예정되어 있습니다.',
  96, true, true, '/media/about-conference.jpg', true, now() - interval '10 days'
),
(
  '사무국', '학술대회',
  '2026 학술대회 참가 등록 오픈',
  E'제1회 대한학술융합학회 학술대회 참가 등록이 시작되었습니다.\n\n사전등록 기간 중 신청하시면 자료집과 기념품을 우선 제공합니다.\n현장등록도 가능하나 좌석이 제한될 수 있습니다.\n\n문의: shinkang88@daum.net / 010-8482-8545',
  74, false, true, '/media/hero-conference.jpg', true, now() - interval '7 days'
),
(
  '사무국', '회원동정',
  '신임 회원 가입 환영 — 2026년 1분기',
  E'최근 학회에 가입해 주신 회원 여러분을 진심으로 환영합니다.\n\n학문과 산업, 연구와 현장을 잇는 개방형 학술공동체에서 함께 교류해 주시길 바랍니다.\n회원 혜택과 학술대회 안내는 「회원마당」과 「학술대회 안내」에서 확인하실 수 있습니다.',
  41, false, true, '/media/conference-networking.jpg', true, now() - interval '5 days'
),
(
  '사무국', '회원동정',
  '편집위원 위촉 및 활동 소식',
  E'학술지 편집위원회가 구성·확대되었습니다.\n수석 편집위원 및 편집위원진이 논문 심사·편집 체계를 정비하고 있으며, 창간호 준비를 진행 중입니다.',
  33, false, true, '/media/conference-panel.jpg', true, now() - interval '3 days'
),
(
  '사무국', '행사',
  '신진연구자 세미나 참가 안내',
  E'신진연구자를 위한 융합연구 세미나를 개최합니다.\n\n주제: 학제 간 연구설계와 성과확산\n형식: 발표·토론·네트워킹\n사전 신청 후 참가해 주세요.',
  52, false, true, '/media/page-news.jpg', true, now() - interval '2 days'
),
(
  '사무국', '기타',
  '홈페이지·투고시스템 오픈 안내',
  E'대한학술융합학회 공식 홈페이지와 논문 투고시스템이 오픈되었습니다.\n공지, 자료실, 갤러리, 회원 안내를 한곳에서 확인하실 수 있습니다.',
  61, false, true, '/media/page-journal.jpg', true, now() - interval '1 day'
);

INSERT INTO resources (author_name, category, title, content, views, pinned, published, thumbnail_url, is_dummy, created_at) VALUES
(
  '사무국', '정관',
  '대한학술융합학회 정관 (요약)',
  E'학회 운영의 근간이 되는 정관의 주요 구성입니다.\n\n제1장 총칙 · 제2장 회원 · 제3장 임원 및 기구 · 제4장 재정 및 회계\n\n정관 전문 문의: shinkang88@daum.net',
  88, true, true, '/media/page-journal.jpg', true, now() - interval '14 days'
),
(
  '사무국', '양식',
  '논문 투고 양식 안내',
  E'논문 투고 시 사용하는 기본 양식과 작성 요령을 안내합니다.\n국문 초록, 영문 초록, 키워드, 본문 구성, 참고문헌 표기를 확인해 주세요.\n상세 규정은 「논문투고 > 투고규정」을 참고하십시오.',
  67, false, true, '/media/page-journal.jpg', true, now() - interval '9 days'
),
(
  '사무국', '자료실',
  '회원 가입 안내 자료',
  E'회원가입 절차, 회원 구분(정회원·학생회원·기관회원), 혜택을 정리한 안내 자료입니다.\n가입 신청은 홈페이지 「회원가입」에서 진행할 수 있습니다.',
  55, false, true, '/media/conference-networking.jpg', true, now() - interval '6 days'
),
(
  '사무국', '논문',
  '창간호 투고·심사 일정(초안)',
  E'학술지 창간호 투고·심사·편집 일정 초안입니다.\n확정 일정은 공지사항과 학술대회 안내를 통해 업데이트됩니다.',
  49, false, true, '/media/about-conference.jpg', true, now() - interval '4 days'
);

INSERT INTO gallery (author_name, category, title, content, views, pinned, published, thumbnail_url, image_urls, event_date, is_dummy, created_at) VALUES
(
  '사무국', '학술대회',
  '창립 기념 학술행사 현장',
  E'학회 창립을 기념하는 학술행사 현장입니다. 기조연설과 포스터 세션이 함께 진행되었습니다.',
  120, true, true,
  '/media/about-conference.jpg',
  '["/media/about-conference.jpg","/media/hero-conference.jpg","/media/conference-networking.jpg"]'::jsonb,
  '2026-03-15', true, now() - interval '11 days'
),
(
  '사무국', '학술대회',
  '포스터세션 · 연구자 교류',
  E'융합 주제 포스터 발표와 연구자 네트워킹 장면입니다.',
  84, false, true,
  '/media/hero-conference.jpg',
  '["/media/hero-conference.jpg","/media/conference-ceremony.jpg"]'::jsonb,
  '2026-03-15', true, now() - interval '11 days'
),
(
  '사무국', '이사회·총회',
  '이사회 워크숍',
  E'이사회 워크숍에서 학회 운영 방향과 학술지 창간 계획을 논의했습니다.',
  63, false, true,
  '/media/conference-panel.jpg',
  '["/media/conference-panel.jpg","/media/page-news.jpg"]'::jsonb,
  '2026-02-10', true, now() - interval '8 days'
),
(
  '사무국', '이사회·총회',
  '창립총회 기념사진',
  E'창립총회 후 임원진과 참석 회원들의 기념 촬영입니다.',
  71, false, true,
  '/media/conference-ceremony.jpg',
  '["/media/conference-ceremony.jpg","/media/conference-networking.jpg"]'::jsonb,
  '2026-02-20', true, now() - interval '8 days'
),
(
  '사무국', '기타',
  '세미나·네트워킹 하이라이트',
  E'신진연구자 세미나 및 교류 프로그램의 하이라이트 컷입니다.',
  45, false, true,
  '/media/conference-networking.jpg',
  '["/media/conference-networking.jpg","/media/about-conference.jpg"]'::jsonb,
  '2026-04-02', true, now() - interval '2 days'
);

INSERT INTO banners (title, subtitle, cta_label, cta_href, image_url, sort_order, published, is_dummy) VALUES
(
  '학문을 연결하고, 미래를 함께',
  '대한학술융합학회 KSAC — 개방형 융합학술 공동체',
  '학회소개', '/about',
  '/media/hero-conference.jpg', 0, true, true
),
(
  '제1회 융합학술대회',
  '논문 모집과 참가 등록 안내를 확인하세요',
  '학술대회 안내', '/conference',
  '/media/about-conference.jpg', 1, true, true
),
(
  '지금 회원으로 함께하세요',
  '연구 네트워크와 학술 교류의 장에 초대합니다',
  '회원가입', '/register',
  '/media/conference-networking.jpg', 2, true, true
);

UPDATE site_settings SET value = 'dummy', updated_at = now() WHERE key = 'board_data_mode';
