/* =============================================
   개발자 웹 이력서 — main.js
   기능 모듈: 다크모드, 타이핑, 진행률바, Observer, 네비, 햄버거, 필터, 폼, 맨위로
   ============================================= */

/* ─── 1. 다크모드 초기화 ─── */
function initTheme() {
  const html = document.getElementById('html-root');
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'dark' || (!saved && prefersDark)) {
    html.classList.add('dark');
    updateThemeIcon(true);
  } else {
    html.classList.remove('dark');
    updateThemeIcon(false);
  }
}

function updateThemeIcon(isDark) {
  const sunIcon  = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  if (!sunIcon || !moonIcon) return;

  if (isDark) {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

/* ─── 2. 다크모드 토글 ─── */
function toggleTheme() {
  const html  = document.getElementById('html-root');
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

/* ─── 3. 타이핑 애니메이터 클래스 ─── */
class TypingAnimator {
  constructor(elementId, texts, options = {}) {
    this.el            = document.getElementById(elementId);
    this.texts         = texts;
    this.typeSpeed     = options.typeSpeed     || 60;
    this.deleteSpeed   = options.deleteSpeed   || 40;
    this.pauseDuration = options.pauseDuration || 2000;
    this.currentIndex  = 0;
    this.currentText   = '';
    this.isDeleting    = false;

    if (this.el) this.tick();
  }

  tick() {
    const fullText = this.texts[this.currentIndex];

    if (this.isDeleting) {
      this.currentText = fullText.substring(0, this.currentText.length - 1);
    } else {
      this.currentText = fullText.substring(0, this.currentText.length + 1);
    }

    this.el.textContent = this.currentText;

    let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.currentText === fullText) {
      delay = this.pauseDuration;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentText === '') {
      this.isDeleting = false;
      this.currentIndex = (this.currentIndex + 1) % this.texts.length;
      delay = 400;
    }

    setTimeout(() => this.tick(), delay);
  }
}

/* ─── 4. 스크롤 진행률 바 ─── */
function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
  const percent    = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width  = percent + '%';
}

/* ─── 5. Intersection Observer (reveal 페이드인업) ─── */
function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
}

/* ─── 6. 네비게이션 활성 섹션 하이라이트 ─── */
function initNavHighlight() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(
          `.nav-link[data-section="${entry.target.id}"]`
        );
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0.4, rootMargin: '-10% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ─── 7. 햄버거 메뉴 ─── */
function initHamburgerMenu() {
  const btn  = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  /* 열기/닫기 토글 */
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  /* 외부 클릭 시 닫기 */
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* 메뉴 링크 클릭 시 닫기 */
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ─── 8. 프로젝트 필터링 ─── */
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      /* 활성 버튼 교체 */
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const isVisible = filter === 'all' || card.dataset.category === filter;

        if (isVisible) {
          card.classList.remove('hidden-card');
          requestAnimationFrame(() => {
            card.classList.add('appearing');
            setTimeout(() => card.classList.remove('appearing'), 400);
          });
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });
}

/* ─── 9. 연락처 폼 유효성 검사 ─── */
function initContactForm() {
  const form         = document.getElementById('contact-form');
  if (!form) return;

  const nameInput    = document.getElementById('form-name');
  const emailInput   = document.getElementById('form-email');
  const messageInput = document.getElementById('form-message');
  const nameError    = document.getElementById('name-error');
  const emailError   = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const successMsg   = document.getElementById('form-success');

  function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('visible');
  }

  function clearError(el) {
    el.textContent = '';
    el.classList.remove('visible');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    /* 이름 검사 */
    if (!nameInput.value.trim()) {
      showError(nameError, '이름을 입력해주세요.');
      isValid = false;
    } else {
      clearError(nameError);
    }

    /* 이메일 검사 */
    if (!emailInput.value.trim()) {
      showError(emailError, '이메일을 입력해주세요.');
      isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      showError(emailError, '올바른 이메일 형식을 입력해주세요.');
      isValid = false;
    } else {
      clearError(emailError);
    }

    /* 메시지 검사 */
    if (!messageInput.value.trim()) {
      showError(messageError, '메시지를 입력해주세요.');
      isValid = false;
    } else if (messageInput.value.trim().length < 10) {
      showError(messageError, '메시지를 10자 이상 입력해주세요.');
      isValid = false;
    } else {
      clearError(messageError);
    }

    if (isValid) {
      form.reset();
      successMsg.classList.remove('hidden');
      setTimeout(() => successMsg.classList.add('hidden'), 5000);
    }
  });
}

/* ─── 10. 맨 위로 버튼 ─── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('hidden', window.scrollY <= 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── 초기화 진입점 ─── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRevealObserver();
  initNavHighlight();
  initHamburgerMenu();
  initProjectFilter();
  initContactForm();
  initBackToTop();

  /* 타이핑 애니메이터 시작 */
  new TypingAnimator('typing-text', [
    'Frontend Developer',
    'UI/UX Enthusiast',
    'Problem Solver',
    'Web Performance Engineer',
  ]);

  /* 스크롤 이벤트 등록 */
  window.addEventListener('scroll', updateProgressBar, { passive: true });
  updateProgressBar(); /* 초기 실행 */

  /* 다크모드 토글 버튼 연결 */
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});
