// filepath: src/lib/page-baselines.ts
/**
 * 공개 사이트의 현재(기본) 콘텐츠를 HTML로 고정한 기준본.
 * DB baseline_html 시드·초기화 복원에 사용.
 */

export const PAGE_BASELINES: Record<string, string> = {
  home: `<section class="ksac-home-baseline">
  <p class="eyebrow">About the Society</p>
  <h2>학문 간 경계를 허물고<br/>융합의 미래를 그립니다</h2>
  <p>대한학술융합학회는 다양한 학문 분야의 연구자와 전문가, 산업 현장의 실무자가 함께 참여하여 새로운 융합 학술영역을 개척하고, 연구성과가 실제 사회 발전과 산업 혁신으로 이어질 수 있는 학술공동체를 구축하기 위해 설립되었습니다.</p>
  <p><a href="/about">학회 소개 보기</a></p>
  <h3>주요 메뉴</h3>
  <ul>
    <li><a href="/members">회원가입 안내</a></li>
    <li><a href="/submission">논문투고</a></li>
    <li><a href="/journal">학술지 · 자료실</a></li>
    <li><a href="/conference">학술대회 안내</a></li>
  </ul>
</section>`,

  about: `<article class="ksac-about-baseline">
  <h2>인사말</h2>
  <blockquote>학문을 연결하고, 지식을 확장하며, 미래 사회의 해법을 함께 만들어가는 대한학술융합학회에 오신 것을 진심으로 환영합니다.</blockquote>
  <p>대한학술융합학회 홈페이지를 방문해 주신 여러분께 진심으로 감사드립니다. 오늘날 우리는 인공지능과 디지털 기술의 급속한 발전 속에서 학문, 산업, 사회 전반의 구조가 빠르게 재편되는 시대를 살아가고 있습니다.</p>
  <p>특히 AI 기술의 확산은 언어와 학문의 전통적 경계를 허물고 있으며, 기존의 단일 학문 체계만으로는 해결하기 어려운 복합적 사회문제와 새로운 연구영역을 끊임없이 만들어 내고 있습니다.</p>
  <p>이러한 변화 속에서 학문 간 협력과 융합 연구는 더 이상 선택이 아닌, 미래 사회 발전을 위한 필수 과제가 되었습니다.</p>
  <h2>학회 연혁</h2>
  <ul>
    <li><strong>2026</strong> — 대한학술융합학회 설립 · 공식 학술지 창간 준비</li>
  </ul>
  <h2>오시는 길</h2>
  <p>서울특별시 서초구 서초중앙로22길 47, 인스161호 (서초동, 문화빌딩)</p>
  <p>Email: <a href="mailto:shinkang88@daum.net">shinkang88@daum.net</a></p>
  <p>지하철 2·3호선 교대역 (2·4·5·7·13번 출구)</p>
</article>`,

  submission: `<article class="ksac-submission-baseline">
  <h2>투고안내</h2>
  <p>대한학술융합학회는 융합학문 분야의 우수한 연구성과를 폭넓게 수렴하고자 합니다.</p>
  <p><a href="https://ksac.smop.hakjisa.site/admin/login.php" target="_blank" rel="noopener noreferrer">논문투고 시스템 바로가기</a></p>
  <h2>투고 전 확인사항</h2>
  <ul>
    <li>투고규정 · 심사규정 · 연구윤리규정을 확인하세요.</li>
    <li>원고는 학회가 정한 양식에 맞게 작성해 주세요.</li>
    <li>심사 결과는 투고 시스템을 통해 안내됩니다.</li>
  </ul>
</article>`,

  members: `<article class="ksac-members-baseline">
  <h2>회원가입 안내</h2>
  <p>대한학술융합학회는 학문과 산업, 연구와 현장을 연결하는 개방형 학술공동체입니다.</p>
  <h3>회원 혜택</h3>
  <ul>
    <li>학술대회 · 세미나 참가 및 교류</li>
    <li>학술지 투고 · 열람 안내</li>
    <li>융합 연구 네트워크 참여</li>
  </ul>
  <p><a href="/register">지금 회원가입</a></p>
</article>`,

  "journal-intro": `<section>
  <h2>학술지 · 자료실</h2>
  <p>대한학술융합학회의 학술지 논문검색과 자료실 안내입니다.</p>
</section>`,

  "conference-intro": `<section>
  <h2>학술대회 안내</h2>
  <p>학술대회 일정, 논문 모집, 행사 안내를 확인하세요.</p>
</section>`,
};

export function getPageBaseline(slug: string): string {
  return PAGE_BASELINES[slug] ?? `<section><h2>${slug}</h2><p>기본 콘텐츠</p></section>`;
}
