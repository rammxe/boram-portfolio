(function () {
  var wl = document.querySelector('.wave-letters');
  var ws = document.querySelector('.wave-svg');
  if (wl) { wl.style.opacity = '0'; wl.style.visibility = 'hidden'; }
  if (ws) { ws.style.opacity = '0'; ws.style.visibility = 'hidden'; }
})();

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
document.documentElement.classList.add('js');

const heroIntro      = document.getElementById('hero-intro');
const heroContent    = document.querySelector('.hero-content');
const blurItems      = document.querySelectorAll('.blurtext .blur-item');
const blurtext       = document.querySelector('.blurtext');
const expandingCircle= document.querySelector('.expanding-circle');
const waveSvg        = document.querySelector('.wave-svg');
const waveLetters    = document.querySelector('.wave-letters');
const scrollHint     = document.querySelector('.scroll-hint');
const projectsSection= document.getElementById('projects');

let waveStarted = false;

var cw = window.innerWidth,
    ch = window.innerHeight,
    nWaves = 5,
    waves  = [],
    amp    = 10,
    speed  = 0.4,
    detail = window.innerWidth <= 768 ? 50 : 30, // ✅ 모바일은 포인트 수 줄이기
    waveY  = 0;
var waveStartScrollY = 0, maxWaveY = ch;
var waveInitTarget   = 0;

/* ───────────────────────────────
   WAVE
─────────────────────────────── */
function drawWave(t) {
  var rel    = Math.min(window.scrollY - waveStartScrollY, maxWaveY);
  var target = Math.max(rel, waveInitTarget);
  waveY += (target - waveY) * 0.06;
  for (var k = 0; k < nWaves; k++) {
    var p = waves[k]; if (!p) continue;
    var offset = ((1 - k / nWaves) * nWaves) / 6;
    var pts = '-20,-20 -20,' + (ch / 2).toFixed(0) + ' ';
    for (var i = -1; i < cw + detail; i += detail) {
      var y = ch + 150 - waveY;
      y += Math.sin(i * 0.003 - t / speed + offset) * amp;
      y += Math.sin(i * 0.004 - t / speed + offset) * amp;
      y += Math.sin(i * -0.011 - t / speed + 20 + offset) * amp;
      pts += i.toFixed(0) + ',' + y.toFixed(0) + ' ';
    }
    pts += cw + ',-20';
    p.setAttribute('points', pts);
  }
}

function startTyping() {
  const el = document.querySelector('.txt1');
  if (!el) return;
  const txt = 'PARK BO RAM';
  let idx = 0, blink = null;
  el.textContent = '';
  function type() {
    if (idx < txt.length) {
      el.textContent = txt.slice(0, idx + 1) + '|';
      idx++;
      setTimeout(type, 200 + Math.random() * 300);
    } else {
      el.textContent = txt + '|';
      let v = true;
      if (blink) clearInterval(blink);
      blink = setInterval(() => { el.textContent = txt + (v ? '|' : ' '); v = !v; }, 500);
    }
  }
  setTimeout(type, 300);
}

function hideWave() {
  var ww = document.querySelector('.wave-wrap');
  if (ww) { ww.style.visibility = 'hidden'; ww.style.pointerEvents = 'none'; }
  if (waveSvg)    { waveSvg.style.transition = 'none'; waveSvg.style.opacity = '0'; waveSvg.style.visibility = 'hidden'; }
  if (waveLetters){ waveLetters.style.transition = 'none'; waveLetters.style.opacity = '0'; waveLetters.style.visibility = 'hidden'; }
  if (heroContent){ heroContent.style.opacity = '0'; heroContent.style.visibility = 'hidden'; }
  gsap.ticker.remove(drawWave);
}

function showWaveWrap() {
  var ww = document.querySelector('.wave-wrap');
  if (ww) { ww.style.visibility = 'visible'; ww.style.pointerEvents = ''; }
}

function startWaveAnimation() {
  if (waveStarted) return;
  waveStarted = true;
  waveStartScrollY = window.scrollY;
  waveY = 0; waveInitTarget = 0;

  if (blurItems[1]) { blurItems[1].classList.remove('active'); blurItems[1].classList.add('past'); }
  if (blurItems[2]) blurItems[2].classList.add('active');

  var mEl = document.getElementById('m');
  if (mEl) mEl.querySelectorAll('polygon').forEach(p => p.remove());
  waves = [];
  for (var w = 0; w < nWaves; w++) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    waves.push(p);
    if (mEl) mEl.appendChild(p);
    if (w === 0) { p.setAttribute('fill', '#fff'); }
    else {
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#fff');
      p.setAttribute('stroke-dasharray', '2 4');
      p.setAttribute('stroke-width', String(3 - (w / nWaves) * 3));
    }
  }
  if (waveSvg) gsap.to(waveSvg, { opacity: 1, duration: 0.8 });
  gsap.fromTo('.txt1', { opacity: 0 }, { opacity: 1, duration: 0.8 });
  startTyping();
  gsap.ticker.add(drawWave);
  gsap.to({ val: 0 }, {
    val: ch * 0.3, duration: 2.5, ease: 'power1.out',
    onUpdate: function () { waveInitTarget = this.targets()[0].val; },
  });
}

function resetWaveState() {
  var mEl = document.getElementById('m');
  if (mEl) mEl.querySelectorAll('polygon').forEach(p => p.remove());
  waveStarted = false; waves = [];
  gsap.ticker.remove(drawWave);
}

/* ───────────────────────────────
   BLUR INTRO
─────────────────────────────── */
function initHeroIntro() {
  setTimeout(() => { if (blurItems[0]) blurItems[0].classList.add('active'); }, 300);
  setTimeout(() => {
    if (blurItems[0]) { blurItems[0].classList.remove('active'); blurItems[0].classList.add('past'); }
    if (blurItems[1]) blurItems[1].classList.add('active');
  }, 2000);
}

/* ───────────────────────────────
   SCROLL ANIMATION
─────────────────────────────── */
function initScrollAnimation() {
  if (!heroIntro || !heroContent) return;

  const isMobile = window.innerWidth <= 768;
  const blurHideProgress = isMobile ? 0.18 : 0.3;
  let autoTriggered    = false;
  let heroTl           = null;
  let mobileCircleScale= 0;
  const introNew       = document.getElementById('intro-new');

  /* ─ 위로 스크롤 시 hero 복구 감지 ─
     hideWave 이후 위로 올리면 heroContent 즉시 복구
     → onEnterBack 보다 먼저 감지해서 검은화면 완전 방지
  ─────────────────── */
  function watchForHeroReturn() {
    let rafPend = false;
    function onScrollBack() {
      if (!autoTriggered) {
        window.removeEventListener('scroll', throttled);
        return;
      }
      const rect = heroIntro.getBoundingClientRect();
      // hero 섹션이 화면에 조금이라도 걸리면 즉시 heroContent 복구
      if (rect.bottom > 0) {
        heroContent.style.opacity = '1';
        heroContent.style.visibility = 'visible';
      }
      // hero 최상단 근처까지 올라왔으면 전체 초기화
      if (rect.top > -100) {
        autoTriggered = false;
        gsap.killTweensOf(expandingCircle);
        gsap.set(expandingCircle, { scale: 0, force3D: true });
        expandingCircle.classList.remove('show');
        resetWaveState();
        if (blurtext) { blurtext.style.opacity = '1'; blurtext.style.visibility = 'visible'; }
        blurItems.forEach(item => item.classList.remove('active', 'past'));
        // desktop: heroTl 스크럽 재연결
        if (!isMobile && heroTl) {
          heroTl.clear();
          heroTl.to(expandingCircle, { scale: 50, duration: 1.5, ease: 'power1.inOut', force3D: true }, 0);
          const prog = (heroTl.scrollTrigger) ? heroTl.scrollTrigger.progress : 0;
          heroTl.progress(prog);
        }
        window.removeEventListener('scroll', throttled);
        setTimeout(() => { if (blurItems[0]) blurItems[0].classList.add('active'); }, 300);
        setTimeout(() => {
          if (blurItems[0]) { blurItems[0].classList.remove('active'); blurItems[0].classList.add('past'); }
          if (blurItems[1]) blurItems[1].classList.add('active');
        }, 2000);
      }
    }
    function throttled() {
      if (rafPend) return; rafPend = true;
      requestAnimationFrame(() => { rafPend = false; onScrollBack(); });
    }
    window.addEventListener('scroll', throttled, { passive: true });
  }

  /* ─ 원 자동확장 ─
     heroST 살려두고 overwrite:true 로 circle만 탈취
     onComplete 후 intro-new로 이동 후 watchForHeroReturn 등록
  ─────────────────── */
  function triggerAutoExpand() {
    if (autoTriggered) return;
    autoTriggered = true;

    // ✅ heroST 살림 → onEnterBack 정상 작동
    // ✅ overwrite:true 로 heroTl의 circle 트윈만 탈취
    if (blurtext) { blurtext.style.opacity = '0'; blurtext.style.visibility = 'hidden'; }

    const currentScale = parseFloat(gsap.getProperty(expandingCircle, 'scale')) || 0;

    gsap.fromTo(expandingCircle,
      { scale: isMobile ? mobileCircleScale : currentScale },
      {
        scale: isMobile ? 22 : 90,
        duration: isMobile ? 1.2 : 1.8,
        ease: 'power1.inOut',
        force3D: true,
        overwrite: true,
        onComplete: () => {
          showWaveWrap();
          if (!waveStarted) startWaveAnimation();
          if (waveSvg) { waveSvg.style.opacity = '1'; waveSvg.style.visibility = 'visible'; }
          setTimeout(() => {
            if (waveLetters) { waveLetters.style.opacity = '1'; waveLetters.style.visibility = 'visible'; }
          }, 400);
          setTimeout(() => {
            if (introNew) {
              gsap.to(window, {
                duration: 1.5,
                scrollTo: { y: introNew, offsetY: 0 },
                ease: 'power2.inOut',
                onComplete: () => {
                  hideWave();
                  // ✅ 위로 스크롤 감지 등록 (검은화면 방지)
                  watchForHeroReturn();
                },
              });
            }
          }, isMobile ? 2000 : 2500);
        },
      },
    );
  }

  /* ──────── 모바일 ──────── */
  if (isMobile) {
    heroContent.style.opacity = '1';
    heroContent.style.visibility = 'visible';

    // ✅ rAF 스로틀 → 모바일 스크롤 이벤트 폭발 방지
    let rafPending = false;
    let cachedHeroHeight = heroIntro.offsetHeight; // ✅ 매번 reflow 안 하게 캐싱

    function _doScroll() {
      const progress = Math.min(Math.max(-heroIntro.getBoundingClientRect().top / cachedHeroHeight, 0), 1);

      if (progress >= 1) { hideWave(); return; }

      if (progress > 0.01 && expandingCircle) expandingCircle.classList.add('show');
      if (scrollHint) scrollHint.classList.toggle('hide', progress > 0.02);

      if (!autoTriggered && blurtext) {
        const hide = progress > blurHideProgress;
        blurtext.style.opacity    = hide ? '0' : '1';
        blurtext.style.visibility = hide ? 'hidden' : 'visible';
      }

      if (!autoTriggered && expandingCircle) {
        mobileCircleScale = Math.min((progress / 0.6) * 12, 12);
        gsap.set(expandingCircle, { scale: mobileCircleScale, force3D: true });
      }

      if (progress >= 0.45 && !autoTriggered) { triggerAutoExpand(); return; }

      if (!autoTriggered) {
        const wsp = 0.3, lsp = 0.42;
        if (progress > wsp && !waveStarted) startWaveAnimation();
        if (waveSvg) {
          waveSvg.style.opacity    = progress > wsp ? '1' : '0';
          waveSvg.style.visibility = progress > wsp ? 'visible' : 'hidden';
        }
        if (waveLetters) {
          waveLetters.style.opacity    = progress > lsp ? '1' : '0';
          waveLetters.style.visibility = progress > lsp ? 'visible' : 'hidden';
        }
      }
    }

    function onMobileScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => { rafPending = false; _doScroll(); });
    }

    window.addEventListener('scroll',    onMobileScroll, { passive: true });
    window.addEventListener('touchmove', onMobileScroll, { passive: true });

    // resize 시 높이 다시 캐싱
    window.addEventListener('resize', () => { cachedHeroHeight = heroIntro.offsetHeight; }, { passive: true });

    ScrollTrigger.create({
      trigger: heroIntro, start: 'top 10%',
      onEnterBack: () => {
        autoTriggered = false; mobileCircleScale = 0;
        resetWaveState();
        cachedHeroHeight = heroIntro.offsetHeight;
        if (expandingCircle) { gsap.set(expandingCircle, { scale: 0, force3D: true }); expandingCircle.classList.remove('show'); }
        if (blurtext) { blurtext.style.opacity = '1'; blurtext.style.visibility = 'visible'; }
        blurItems.forEach(item => item.classList.remove('active', 'past'));
        var ww = document.querySelector('.wave-wrap');
        if (ww) { ww.style.visibility = 'hidden'; ww.style.pointerEvents = 'none'; }
        heroContent.style.opacity = '1'; heroContent.style.visibility = 'visible';
        setTimeout(() => { if (blurItems[0]) blurItems[0].classList.add('active'); }, 300);
        setTimeout(() => {
          if (blurItems[0]) { blurItems[0].classList.remove('active'); blurItems[0].classList.add('past'); }
          if (blurItems[1]) blurItems[1].classList.add('active');
        }, 2000);
      },
    });

  /* ──────── 데스크톱 ──────── */
  } else {
    heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroIntro,
        start: 'top top',
        end: 'bottom bottom',
        pin: heroContent,
        pinSpacing: false,
        scrub: 0.5,
        onLeave: () => { if (!autoTriggered) hideWave(); },
        onEnterBack: () => {
          autoTriggered = false;
          resetWaveState();
          if (expandingCircle) { gsap.set(expandingCircle, { scale: 0, force3D: true }); expandingCircle.classList.remove('show'); }
          if (blurtext) { blurtext.style.opacity = '1'; blurtext.style.visibility = 'visible'; }
          blurItems.forEach(item => item.classList.remove('active', 'past'));
          var ww = document.querySelector('.wave-wrap');
          if (ww) { ww.style.visibility = 'visible'; ww.style.pointerEvents = ''; }
          if (heroContent) { heroContent.style.opacity = '1'; heroContent.style.visibility = 'visible'; }
        },
        onUpdate: (self) => {
          const p = self.progress;
          if (expandingCircle && p > 0.01) expandingCircle.classList.add('show');
          if (scrollHint) scrollHint.classList.toggle('hide', p > 0.02);
          if (!autoTriggered && blurtext) {
            blurtext.style.opacity    = p > blurHideProgress ? '0' : '1';
            blurtext.style.visibility = p > blurHideProgress ? 'hidden' : 'visible';
          }
          if (p >= 0.45 && !autoTriggered) { triggerAutoExpand(); return; }
          if (!autoTriggered) {
            const wsp = 0.4, lsp = 0.65;
            if (p > wsp && !waveStarted) startWaveAnimation();
            if (waveSvg) {
              waveSvg.style.opacity    = p > wsp ? '1' : '0';
              waveSvg.style.visibility = p > wsp ? 'visible' : 'hidden';
            }
            if (waveLetters) {
              waveLetters.style.opacity    = p > lsp ? '1' : '0';
              waveLetters.style.visibility = p > lsp ? 'visible' : 'hidden';
            }
          }
        },
      },
    });

    if (expandingCircle) {
      heroTl.to(expandingCircle, { scale: 50, duration: 1.5, ease: 'power1.inOut', force3D: true }, 0);
    }
  }
}

/* ───────────────────────────────
   ABOUT ANIMATION
─────────────────────────────── */
function initAboutAnimation() {
  function splitToChars(el) {
    const text = el.textContent;
    el.innerHTML = '';
    [...text].forEach(char => {
      const s = document.createElement('span');
      s.textContent = char === ' ' ? '\u00A0' : char;
      s.style.cssText = 'display:inline-block; color:rgba(255,255,255,0.05); white-space:pre;';
      el.appendChild(s);
    });
    return el.querySelectorAll('span');
  }

  function splitDescWords(el) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3 && node.textContent.trim()) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(w => {
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); }
          else if (w) {
            const s = document.createElement('span');
            s.className = 'dw'; s.textContent = w;
            s.style.cssText = 'display:inline-block; color:rgba(255,255,255,0.05); font-weight:400;';
            frag.appendChild(s);
          }
        });
        node.replaceWith(frag);
      } else if (node.nodeName === 'B') {
        const inner = node.textContent; node.innerHTML = '';
        inner.split(/(\s+)/).forEach(w => {
          if (/^\s+$/.test(w)) { node.appendChild(document.createTextNode(w)); }
          else if (w) {
            const s = document.createElement('span');
            s.className = 'dw dw--bold'; s.textContent = w;
            s.style.cssText = 'display:inline-block; color:rgba(255,255,255,0.05); font-weight:700;';
            node.appendChild(s);
          }
        });
      }
    });
    return el.querySelectorAll('.dw');
  }

  const FP = [
    { y: 20, x: 8,   rot: 4,  dur: 2.4 },
    { y: 16, x: -10, rot: -3, dur: 3.0 },
    { y: 22, x: 6,   rot: 3,  dur: 2.0 },
    { y: 18, x: -8,  rot: -4, dur: 2.7 },
  ];

  function createFloat(img, p) {
    return [
      gsap.to(img, { y: '-='+p.y, duration: p.dur,       ease: 'sine.inOut', yoyo: true, repeat: -1 }),
      gsap.to(img, { x: p.x,     duration: p.dur*1.4,    ease: 'sine.inOut', yoyo: true, repeat: -1 }),
      gsap.to(img, { rotation: p.rot, duration: p.dur*1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
    ];
  }
  function killFloat(img) {
    if (img._ft) { img._ft.forEach(t => t.kill()); img._ft = null; }
  }

  document.querySelectorAll('.about-panel').forEach(panel => {
    const floatImgs = Array.from(panel.querySelectorAll('.float-img'));
    let allChars = [];
    panel.querySelectorAll('.word').forEach(w => allChars.push(...splitToChars(w)));
    const descWords = splitDescWords(panel.querySelector('.panel-desc'));

    const tl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 60%', end: 'bottom 52%', scrub: 0.5 } });
    allChars.forEach((c, i) => tl.to(c, { color: '#fff', duration: 0.2, ease: 'power2.inOut' }, i * 0.03));
    descWords.forEach((w, i) => tl.to(w, { color: w.classList.contains('dw--bold') ? '#fff' : 'rgba(255,255,255,0.8)', duration: 0.25, ease: 'power1.inOut' }, i * 0.05));

    floatImgs.forEach(img => gsap.set(img, { opacity: 0, y: 80 }));

    ScrollTrigger.create({
      trigger: panel, start: 'top 75%', end: 'bottom 20%',
      onEnter: () => floatImgs.forEach((img, i) => {
        killFloat(img);
        gsap.to(img, { opacity: 1, y: 0, duration: 1.0, delay: i * 0.12, ease: 'power3.out',
          onComplete: () => { img._ft = createFloat(img, FP[i] || FP[0]); } });
      }),
      onLeave: () => floatImgs.forEach(img => { killFloat(img); gsap.to(img, { opacity: 0, y: -60, duration: 0.5, ease: 'power2.in' }); }),
      onEnterBack: () => floatImgs.forEach((img, i) => {
        killFloat(img);
        gsap.to(img, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          onComplete: () => { img._ft = createFloat(img, FP[i] || FP[0]); } });
      }),
      onLeaveBack: () => floatImgs.forEach(img => { killFloat(img); gsap.to(img, { opacity: 0, y: 80, duration: 0.5, ease: 'power2.in' }); }),
    });
  });
}

/* ───────────────────────────────
   SLIDESHOW
─────────────────────────────── */
var getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
var lineEq = (y2, y1, x2, x1, v) => { var m = (y2-y1)/(x2-x1); return m*v+(y1-m*x1); };
var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','.',':',' ','^'];
var charsTotal = chars.length;

var charming = (el) => {
  var t = el.textContent; el.innerHTML = '';
  t.split('').forEach((c, i) => { var s = document.createElement('span'); s.className='char'+(i+1); s.textContent=c; el.appendChild(s); });
};

/* ✅ rAF 단일 루프 (N개 setTimeout → 1개 rAF) */
var randomizeLetters = (letters) => new Promise(resolve => {
  if (!letters.length) { resolve(); return; }
  var total = letters.length, cnt = 0, start = null;
  var times = letters.map((_, i) => i * lineEq(40, 0, 8, 200, total));
  var done  = new Array(total).fill(false);
  function tick(ts) {
    if (!start) start = ts;
    var elapsed = ts - start;
    letters.forEach((l, i) => {
      if (done[i]) return;
      l.innerHTML = chars[getRandomInt(0, charsTotal - 1)];
      if (elapsed >= times[i]) {
        done[i] = true; l.style.opacity = 1; l.innerHTML = l.dataset.initial;
        if (++cnt === total) resolve();
      }
    });
    if (cnt < total) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});

var disassembleLetters = (letters) => new Promise(resolve => {
  var total = letters.length, cnt = 0;
  letters.forEach((l, i) => setTimeout(() => { l.style.opacity = 0; if (++cnt === total) resolve(); }, i * 30));
});

class Slide {
  constructor(el) {
    this.DOM = { el };
    this.DOM.imgWrap = el.querySelector('.slide__img-wrap');
    this.DOM.img     = this.DOM.imgWrap.querySelector('.slide__img');
    this.DOM.texts   = {
      wrap: el.querySelector('.slide__title-wrap'), title: el.querySelector('.slide__title'),
      number: el.querySelector('.slide__number'),   side:  el.querySelector('.slide__side'),
    };
    charming(this.DOM.texts.title); charming(this.DOM.texts.side);
    this.DOM.titleLetters = Array.from(this.DOM.texts.title.querySelectorAll('span')).sort(() => 0.5 - Math.random());
    this.DOM.sideLetters  = Array.from(this.DOM.texts.side.querySelectorAll('span')).sort(() => 0.5 - Math.random());
    this.DOM.titleLetters.forEach(l => l.dataset.initial = l.innerHTML);
    this.DOM.sideLetters.forEach(l  => l.dataset.initial = l.innerHTML);
    this.calcSizes(); this.calcTransforms(); this.initEvents();
  }
  calcSizes() { this.width = this.DOM.imgWrap.offsetWidth; this.height = this.DOM.imgWrap.offsetHeight; }
  calcTransforms() {
    const m = winsize.width <= 768;
    this.transforms = m ? [
      { x: -winsize.width * 1.2, y: 0, rotation: 0 },
      { x: -winsize.width * 0.6, y: 0, rotation: 0 },
      { x: 0, y: 0, rotation: 0 },
      { x:  winsize.width * 0.6, y: 0, rotation: 0 },
      { x:  winsize.width * 1.2, y: 0, rotation: 0 },
      { x: 0, y: 0, rotation: 0 },
    ] : [
      { x: -(winsize.width/2+this.width),   y: -(winsize.height/2+this.height),   rotation: -30 },
      { x: -(winsize.width/2-this.width/3), y: -(winsize.height/2-this.height/3), rotation: 0 },
      { x: 0, y: 0, rotation: 0 },
      { x:   winsize.width/2-this.width/3,  y:   winsize.height/2-this.height/3,  rotation: 0 },
      { x:   winsize.width/2+this.width,    y:   winsize.height/2+this.height,     rotation: 30 },
      { x: -(winsize.width/2-this.width/2-winsize.width*0.075), y: 0, rotation: 0 },
    ];
  }
  initEvents() {
    this.DOM.imgWrap.addEventListener('mouseenter', () => {
      if (!this.isPositionedCenter()) return;
      clearTimeout(this.mt);
      this.mt = setTimeout(() => gsap.to(this.DOM.img, { duration: 0.5, ease: 'power2.out', scale: 1.08 }), 40);
    });
    this.DOM.imgWrap.addEventListener('mouseleave', () => {
      if (!this.isPositionedCenter()) return;
      clearTimeout(this.mt);
      gsap.to(this.DOM.img, { duration: 0.5, ease: 'power2.out', scale: 1 });
    });
  }
  position(pos) {
    gsap.set(this.DOM.imgWrap, { x: this.transforms[pos].x, y: this.transforms[pos].y, rotationX: 0, rotationY: 0, opacity: 1, rotationZ: this.transforms[pos].rotation });
  }
  setCurrent(c)  { this.isCurrent = true; this.DOM.el.classList.add('slide--current','slide--visible'); this.position(c ? 5 : 2); }
  setLeft(c)     { this.isRight = this.isCurrent = false; this.isLeft = true; this.DOM.el.classList.add('slide--visible'); this.position(c ? 0 : 1); }
  setRight(c)    { this.isLeft = this.isCurrent = false; this.isRight = true; this.DOM.el.classList.add('slide--visible'); this.position(c ? 4 : 3); }
  isPositionedRight()  { return this.isRight; }
  isPositionedLeft()   { return this.isLeft; }
  isPositionedCenter() { return this.isCurrent; }
  reset() { this.isRight = this.isLeft = this.isCurrent = false; this.DOM.el.className = 'slide'; }
  hide()  { gsap.set(this.DOM.imgWrap, { x:0, y:0, rotationX:0, rotationY:0, rotationZ:0, opacity:0 }); }

  moveToPosition(s) {
    const mob = winsize.width <= 768;
    const dur  = mob ? 0.3 : 0.8;
    return new Promise(resolve => {
      gsap.to(this.DOM.imgWrap, {
        duration: dur, force3D: true,
        ease:   mob ? 'power2.out' : 'power4.inOut',
        delay:  s.delay || 0,
        startAt: s.from !== undefined ? {
          x: this.transforms[s.from+2].x, y: this.transforms[s.from+2].y,
          rotationX: 0, rotationY: 0, rotationZ: this.transforms[s.from+2].rotation,
        } : {},
        x: this.transforms[s.position+2].x, y: this.transforms[s.position+2].y,
        rotationX: 0, rotationY: 0, rotationZ: this.transforms[s.position+2].rotation,
        onStart: s.from !== undefined ? () => gsap.set(this.DOM.imgWrap, { opacity: 1 }) : null,
        onComplete: resolve,
      });
      if (s.resetImageScale) gsap.to(this.DOM.img, { duration: dur, ease: 'power4.inOut', scale: 1 });
    });
  }
  hideTexts(anim) {
    if (anim) {
      disassembleLetters(this.DOM.titleLetters).then(() => gsap.set(this.DOM.texts.wrap, { opacity: 0 }));
      disassembleLetters(this.DOM.sideLetters).then(()  => gsap.set(this.DOM.texts.side, { opacity: 0 }));
    } else {
      gsap.set(this.DOM.texts.wrap, { opacity: 0 });
      gsap.set(this.DOM.texts.side, { opacity: 0 });
    }
  }
  showTexts(anim) {
    anim = anim !== false;
    gsap.set(this.DOM.texts.wrap, { opacity: 1 });
    gsap.set(this.DOM.texts.side, { opacity: 1 });
    if (anim) {
      /* ✅ 모바일: 글자 즉시 표시 (randomize 생략 → 렉 제거 핵심) */
      if (winsize.width <= 768) {
        this.DOM.titleLetters.forEach(l => { l.style.opacity = 1; l.innerHTML = l.dataset.initial; });
        this.DOM.sideLetters.forEach(l  => { l.style.opacity = 1; l.innerHTML = l.dataset.initial; });
      } else {
        randomizeLetters(this.DOM.titleLetters);
        randomizeLetters(this.DOM.sideLetters);
      }
      gsap.to(this.DOM.texts.number, { duration: 0.6, ease: 'elastic.out(1,0.5)', startAt: { x:'-50%', opacity:0 }, x:'0%', opacity:1 });
    }
  }
}

class Content {
  constructor(el) {
    this.DOM = { el };
    this.DOM.image    = el.querySelector('.content__item-image');
    this.DOM.number   = el.querySelector('.content__number');
    this.DOM.title    = el.querySelector('.content__title');
    this.DOM.subtitle = el.querySelector('.content__subtitle');
    this.DOM.info     = el.querySelector('.content__info');
    this.DOM.buttons  = el.querySelector('.content__buttons');
  }
  show() {
    var vid = this.DOM.image && this.DOM.image.querySelector('video');
    if (vid) vid.play().catch(() => {});
    this.DOM.el.classList.add('content__item--current');
    gsap.to(this.DOM.image, { duration: 0.8, ease: 'power4.out', opacity: 1, x: 0, startAt: { opacity: 0, x: -50 } });
    gsap.to([this.DOM.number, this.DOM.title, this.DOM.subtitle, this.DOM.info, this.DOM.buttons], {
      duration: 0.8, ease: 'power4.out', opacity: 1, startAt: { y: 40, opacity: 0 }, y: 0, stagger: 0.05,
    });
    var name = this.DOM.title.textContent;
    document.querySelectorAll('.content .marquee-track--left, .content .marquee-track--right').forEach(t => {
      t.innerHTML = Array(20).fill('<span>' + name + '</span>').join('');
    });
    var mq = document.querySelector('.content .marquee-wrap');
    if (mq) mq.style.opacity = '1';
  }
  hide() {
    var vid = this.DOM.image && this.DOM.image.querySelector('video');
    if (vid) { vid.pause(); vid.currentTime = 0; }
    this.DOM.el.classList.remove('content__item--current');
    gsap.to([this.DOM.image, this.DOM.number, this.DOM.title, this.DOM.subtitle, this.DOM.info, this.DOM.buttons].reverse(),
      { duration: 0.3, ease: 'power3.in', opacity: 0, stagger: 0.01 });
    var mq = document.querySelector('.content .marquee-wrap');
    if (mq) mq.style.opacity = '0';
  }
}

class Slideshow {
  constructor(el) {
    this.DOM = { el };
    this.slides = Array.from(el.querySelectorAll('.slide')).map(s => new Slide(s));
    this.slidesTotal = this.slides.length;
    if (this.slidesTotal < 3) return;
    this.current       = 0;
    this.DOM.deco      = el.querySelector('.slideshow__deco');
    this.DOM.navPrev   = el.querySelector('.nav--prev');
    this.DOM.navNext   = el.querySelector('.nav--next');
    this.DOM.closeCtrl = document.querySelector('.content__back');
    this.contents = Array.from(document.querySelectorAll('.content > .content__item')).map(c => new Content(c));
    this.render();
    this.currentSlide.showTexts(false);
    this.initEvents();
  }
  render() {
    this.currentSlide = this.slides[this.current];
    this.nextSlide    = this.slides[this.current + 1 <= this.slidesTotal - 1 ? this.current + 1 : 0];
    this.prevSlide    = this.slides[this.current - 1 >= 0 ? this.current - 1 : this.slidesTotal - 1];
    this.currentSlide.setCurrent();
    this.nextSlide.setRight();
    this.prevSlide.setLeft();
  }
  initEvents() {
    this.slides.forEach(s => s.DOM.imgWrap.addEventListener('click', () => {
      if (s.isPositionedRight()) this.navigate('next');
      else if (s.isPositionedLeft()) this.navigate('prev');
      else this.showContent();
    }));
    this.DOM.navNext && this.DOM.navNext.addEventListener('click', e => { e.preventDefault(); this.navigate('next'); });
    this.DOM.navPrev && this.DOM.navPrev.addEventListener('click', e => { e.preventDefault(); this.navigate('prev'); });
    this.DOM.closeCtrl && this.DOM.closeCtrl.addEventListener('click', e => { e.preventDefault(); this.hideContent(); });
    window.addEventListener('resize', () => {
      this.slides.forEach(s => { s.calcSizes(); s.calcTransforms(); });
      this.nextSlide.setRight(this.isContentOpen);
      this.prevSlide.setLeft(this.isContentOpen);
      this.currentSlide.setCurrent(this.isContentOpen);
      if (this.isContentOpen && this.DOM.deco) {
        gsap.set(this.DOM.deco, { scaleX: winsize.width/this.DOM.deco.offsetWidth, scaleY: winsize.height/this.DOM.deco.offsetHeight, x:-20, y:20 });
      }
    }, { passive: true });
  }
  showContent() {
    if (this.isContentOpen || this.isAnimating) return;
    allowTilt = false; this.isContentOpen = true;
    this.DOM.el.classList.add('slideshow--previewopen');
    if (winsize.width > 768 && this.DOM.deco) {
      gsap.to(this.DOM.deco, { duration: 0.8, ease: 'power4.inOut', scaleX: winsize.width/this.DOM.deco.offsetWidth, scaleY: winsize.height/this.DOM.deco.offsetHeight, x:-20, y:20 });
    }
    gsap.to(this.DOM.closeCtrl, { duration: 0.8, ease: 'power4.out', delay: 0.4, opacity: 1 });
    this.DOM.closeCtrl.style.pointerEvents = 'auto';
    this.prevSlide.moveToPosition({ position: -2 });
    this.nextSlide.moveToPosition({ position: 2 });
    this.currentSlide.moveToPosition({ position: 3, resetImageScale: true });
    this.contents[this.current].show();
    this.currentSlide.hideTexts(true);
  }
  hideContent() {
    if (!this.isContentOpen || this.isAnimating) return;
    this.DOM.el.classList.remove('slideshow--previewopen');
    this.contents[this.current].hide();
    gsap.to(this.DOM.closeCtrl, { duration: 0.3, ease: 'power3.in', opacity: 0 });
    this.DOM.closeCtrl.style.pointerEvents = 'none';
    if (winsize.width > 768 && this.DOM.deco) {
      gsap.to(this.DOM.deco, { duration: 0.8, ease: 'power4.inOut', scaleX: 1, scaleY: 1, x: 0, y: 0 });
    }
    this.prevSlide.moveToPosition({ position: -1 });
    this.nextSlide.moveToPosition({ position: 1 });
    this.currentSlide.moveToPosition({ position: 0 }).then(() => { allowTilt = true; this.isContentOpen = false; });
    this.currentSlide.showTexts();
  }
  bounceDeco(dir, delay) {
    if (winsize.width <= 768 || !this.DOM.deco) return;
    gsap.to(this.DOM.deco, {
      duration: 0.4, ease: 'power2.in', delay: delay * 1.2,
      x: dir === 'next' ? -40 : 40, y: dir === 'next' ? -40 : 40,
      onComplete: () => gsap.to(this.DOM.deco, { duration: 0.6, ease: 'power2.out', x: 0, y: 0 }),
    });
  }
  navigate(dir) {
    if (this.isAnimating) return;
    this.isAnimating = true; allowTilt = false;
    const mob = winsize.width <= 768;
    /* ✅ 모바일 딜레이 최소 → 즉각 반응 */
    const d1=0, d2=mob?0.01:0.07, d3=mob?0.02:0.14, d4=mob?0.03:0.21;

    const uPos = dir==='next'
      ? (this.current < this.slidesTotal-2 ? this.current+2 : Math.abs(this.slidesTotal-2-this.current))
      : (this.current >= 2 ? this.current-2 : Math.abs(this.slidesTotal-2+this.current));
    this.upcomingSlide = this.slides[uPos];
    this.current = dir==='next'
      ? (this.current < this.slidesTotal-1 ? this.current+1 : 0)
      : (this.current > 0 ? this.current-1 : this.slidesTotal-1);

    this.prevSlide.moveToPosition({ position: dir==='next'?-2:0, delay: dir==='next'?d1:d3 })
      .then(() => { if (dir==='next') this.prevSlide.hide(); });
    this.currentSlide.moveToPosition({ position: dir==='next'?-1:1, delay: d2 });
    this.currentSlide.hideTexts();
    this.bounceDeco(dir, d2);
    this.nextSlide.moveToPosition({ position: dir==='next'?0:2, delay: dir==='next'?d3:d1 })
      .then(() => { if (dir==='prev') this.nextSlide.hide(); });
    if (dir==='next') this.nextSlide.showTexts();
    else this.prevSlide.showTexts();
    this.upcomingSlide.moveToPosition({ position: dir==='next'?1:-1, from: dir==='next'?2:-2, delay: d4 })
      .then(() => {
        [this.nextSlide, this.currentSlide, this.prevSlide].forEach(s => s.reset());
        this.render(); allowTilt = true; this.isAnimating = false;
      });
  }
}

function createSlideshowWithVideoEvents() {
  document.querySelectorAll('.content__item-image video').forEach(v => {
    var src = v.querySelector('source');
    if (src && src.dataset.src && !src.src) { src.src = src.dataset.src; v.load(); }
  });
  slideshow = new Slideshow(document.querySelector('.slideshow'));
}

/* ───────────────────────────────
   ILLUSTRATION
─────────────────────────────── */
function initIllustrationScroll() {
  var gs = document.querySelector('.gallery-section');
  var items = document.querySelectorAll('.gallery-item');
  var tl = document.querySelector('.gallery-title-left');
  var tr = document.querySelector('.gallery-title-right');
  if (!gs || !items.length) return;
  gsap.set(tl, { x: '-50vw' }); gsap.set(tr, { x: '50vw' });
  var cfg = { trigger: gs, start: 'top 95%', end: 'top 10%', scrub: 3 };
  gsap.to(tl, { x:0, ease:'power3.out', scrollTrigger: cfg });
  gsap.to(tr, { x:0, ease:'power3.out', scrollTrigger: cfg });
  ScrollTrigger.create({ trigger:gs, start:'top 80%', end:'bottom top',
    onEnter:() => gs.classList.add('active'), onLeave:() => gs.classList.remove('active'),
    onEnterBack:() => gs.classList.add('active'), onLeaveBack:() => gs.classList.remove('active') });
  if (window.innerWidth <= 768) {
    gsap.set(items, { clearProps: 'all' });
    items.forEach(item => {
      var img = item.querySelector('img');
      gsap.set(img, { filter: 'grayscale(100%)' });
      item.addEventListener('click', () => {
        if (item.classList.contains('active')) { item.classList.remove('active'); gsap.to(img, { filter:'grayscale(100%)', duration:0.4, ease:'power2.out' }); }
        else { item.classList.add('active'); gsap.to(img, { filter:'grayscale(0%)', duration:0.4, ease:'power2.out' }); }
      });
    }); return;
  }
  gsap.set(items[0], { x:'-25vw', y:0, scale:1, zIndex:1 });
  gsap.set(items[1], { x:'0vw',   y:0, scale:1, zIndex:2 });
  gsap.set(items[2], { x:'25vw',  y:0, scale:1, zIndex:1 });
  gsap.timeline({ scrollTrigger: { trigger:gs, start:'top top', end:'+=300', scrub:0.3, pin:true } })
    .to(items[0], { x:'-34vw', y:0, scale:1 }, 0)
    .to(items[1], { x:'0vw',   y:0, scale:1 }, 0)
    .to(items[2], { x:'34vw',  y:0, scale:1 }, 0);
  items.forEach(item => {
    item.addEventListener('mouseenter', () => gsap.to(item, { scale:1.1, rotationY:5, rotationX:-3, duration:0.4, ease:'power2.out', zIndex:10, overwrite:'auto' }));
    item.addEventListener('mouseleave', () => gsap.to(item, { scale:1, rotationY:0, rotationX:0, duration:0.4, ease:'power2.out', zIndex:1, overwrite:'auto' }));
  });
}

/* ───────────────────────────────
   CONTACT
─────────────────────────────── */
function initContactAnimation() {
  var cs = document.getElementById('contact'); if (!cs) return;
  var gi  = cs.querySelector('.gradient-img');
  var img = cs.querySelector('.gradient-img img');
  var ttl = cs.querySelector('.contact-title');
  var dsc = cs.querySelector('.contact-desc');
  var btn = cs.querySelector('.contact-btn');
  if (!gi) return;
  gsap.set(gi, { scale: 0.25 });
  gsap.to(gi,  { scale:3, ease:'none', scrollTrigger:{ trigger:cs, start:'top bottom', end:'center center', scrub:1.2 } });
  if (img) gsap.to(img, { scale:1.25, ease:'none', scrollTrigger:{ trigger:cs, start:'top bottom', end:'bottom top', scrub:2 } });
  ScrollTrigger.create({ trigger:cs, start:'top 60%',
    onEnter:()    => { if(ttl) ttl.classList.add('revealed'); if(dsc) dsc.classList.add('revealed'); if(btn) btn.classList.add('revealed'); },
    onLeaveBack:() => { if(ttl) ttl.classList.remove('revealed'); if(dsc) dsc.classList.remove('revealed'); if(btn) btn.classList.remove('revealed'); },
  });
}

/* ───────────────────────────────
   INTRO-NEW
─────────────────────────────── */
function initNewIntroAnimation() {
  var sec = document.getElementById('intro-new'); if (!sec) return;
  var img  = document.querySelector('.intro-new-image');
  var lines= document.querySelectorAll('.intro-new-title-line');
  var div  = document.querySelector('.intro-new-divider');
  var txt  = document.querySelector('.intro-new-text');
  var vl   = document.querySelector('.intro-new-vertical-line');
  var orb  = document.querySelector('.about-right');
  ScrollTrigger.create({ trigger:sec, start:'top 75%', once:true,
    onEnter: () => {
      if (img) setTimeout(() => img.classList.add('revealed'), 100);
      if (orb) setTimeout(() => orb.classList.add('revealed'), 300);
      if (vl)  setTimeout(() => { vl.classList.add('revealed'); gsap.to(vl, { height:'60%', duration:0.8, ease:'power2.out' }); }, 500);
      setTimeout(() => { lines.forEach(l => l.classList.add('revealed')); if(div) div.classList.add('revealed'); if(txt) txt.classList.add('revealed'); }, 800);
    },
  });
}

function initProjectsTitleAnimation() {
  var tl = document.querySelector('.title-left');
  var tr = document.querySelector('.title-right');
  if (!tl || !tr || !projectsSection) return;
  gsap.set(tl, { x:'-50vw' }); gsap.set(tr, { x:'50vw' });
  var cfg = { trigger:projectsSection, start:'top 95%', end:'top 10%', scrub:3 };
  gsap.to(tl, { x:0, ease:'power3.out', scrollTrigger:cfg });
  gsap.to(tr, { x:0, ease:'power3.out', scrollTrigger:cfg });
}

/* ───────────────────────────────
   GLOBALS & INIT
─────────────────────────────── */
var winsize;
var calcWinsize = () => { winsize = { width: window.innerWidth, height: window.innerHeight }; };
calcWinsize();
var allowTilt = true, slideshow;

function init() {
  if (expandingCircle) gsap.set(expandingCircle, { scale:0, force3D:true });
  if (waveSvg)         gsap.set(waveSvg,         { opacity:0, visibility:'hidden' });
  if (waveLetters)     gsap.set(waveLetters,      { opacity:0, visibility:'hidden' });
  if (blurtext)        { blurtext.style.opacity='1'; blurtext.style.visibility='visible'; }
  blurItems.forEach(i => i.classList.remove('active','past'));

  var illWrap = document.querySelector('.ill-text-wrap');
  if (illWrap) { illWrap.style.opacity='0'; illWrap.style.visibility='hidden'; }

  setTimeout(initHeroIntro, 500);
  initScrollAnimation();
  initAboutAnimation();
  initProjectsTitleAnimation();
  initNewIntroAnimation();

  if (projectsSection) {
    ScrollTrigger.create({
      trigger: projectsSection, start:'top 80%', end:'bottom top',
      onEnter: () => {
        projectsSection.classList.add('active');
        if (illWrap) { illWrap.style.opacity='0'; illWrap.style.visibility='hidden'; }
        if (!slideshow) createSlideshowWithVideoEvents();
      },
      onLeave:     () => { if(illWrap){ illWrap.style.opacity='0'; illWrap.style.visibility='hidden'; } },
      onEnterBack: () => { if(illWrap){ illWrap.style.opacity='0'; illWrap.style.visibility='hidden'; } },
    });
  }
  initIllustrationScroll();
  initContactAnimation();
}

window.addEventListener('load', init);

/* ✅ resize 디바운스 250ms */
var resizeTimeout;
window.addEventListener('resize', () => {
  cw = window.innerWidth; ch = window.innerHeight;
  detail = cw <= 768 ? 50 : 30;
  calcWinsize();
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 250);
}, { passive: true });

/* ───────────────────────────────
   CURSOR
─────────────────────────────── */
(function () {
  var cursor = document.querySelector('.cursor'); if (!cursor) return;
  var mx=0, my=0, cx=0, cy=0, spd=0.15, rid=null;
  window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; }, { passive:true });
  function run() { cx+=(mx-cx)*spd; cy+=(my-cy)*spd; cursor.style.left=cx+'px'; cursor.style.top=cy+'px'; rid=requestAnimationFrame(run); }
  if (!rid) run();
  var ani = function(e) {
    var s = this.querySelector(':scope > span'); if (!s) return;
    var x=e.offsetX, y=e.offsetY, w=this.offsetWidth, h=this.offsetHeight, m=25;
    s.style.transform = e.type==='mouseleave' ? '' : 'translate('+((x/w)*m*2-m)+'px,'+((y/h)*m*2-m)+'px)';
  };
  Array.from(document.querySelectorAll('a, button, .slide__img-wrap, .nav'))
    .filter(el => !el.closest('.dropdown-menu') && !el.closest('.menu-btn') && !el.closest('.menu-wrapper'))
    .forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.style.transform='translate(-50%,-50%) scale(3)'; });
      el.addEventListener('mouseleave', () => { cursor.style.transform='translate(-50%,-50%) scale(1)'; });
      el.addEventListener('mousemove',  ani);
      el.addEventListener('mouseleave', ani);
    });
})();

/* ───────────────────────────────
   MENU
─────────────────────────────── */
(function () {
  var links = document.querySelectorAll('.dropdown-menu > .link');
  var cursor = document.querySelector('.cursor');
  var toggle = document.getElementById('menu-toggle');
  if (!toggle || !cursor) return;
  var ani = function(e) {
    var s = this.querySelector('span'); if (!s) return;
    var x=e.offsetX, y=e.offsetY, w=this.offsetWidth, h=this.offsetHeight, m=25;
    s.style.transform = e.type==='mouseleave' ? '' : 'translate('+((x/w)*(m*2)-m)+'px, '+((y/h)*(m*2)-m)+'px)';
  };
  toggle.addEventListener('change', function() {
    document.body.classList.toggle('menu-open', this.checked);
    if (!this.checked) cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });
  links.forEach(link => {
    link.addEventListener('mouseenter', () => { cursor.style.transform='translate(-50%,-50%) scale(8)'; });
    link.addEventListener('mouseleave', () => { cursor.style.transform='translate(-50%,-50%) scale(1)'; });
    link.addEventListener('mousemove',  ani);
    link.addEventListener('mouseleave', ani);
    link.addEventListener('click', () => { toggle.checked=false; document.body.classList.remove('menu-open'); cursor.style.transform='translate(-50%,-50%) scale(1)'; });
  });
})();

/* ───────────────────────────────
   HORIZONTAL SLIDER (ABOUT)
─────────────────────────────── */
var currentPage = 0, totalPages = 3;
var wrapper     = document.querySelector('.horizontal-wrapper');
var prevBtn     = document.getElementById('introPrev');
var nextBtn     = document.getElementById('introNext');
var introNewSection = document.getElementById('intro-new');

if (introNewSection) {
  ScrollTrigger.create({
    trigger: introNewSection, start:'top 80%', end:'bottom 20%',
    onEnter:()    => introNewSection.classList.add('active'),
    onLeave:()    => introNewSection.classList.remove('active'),
    onEnterBack:()=> introNewSection.classList.add('active'),
    onLeaveBack:()=> introNewSection.classList.remove('active'),
  });
}

var outAnimated=false, skillAnimated=false;

function triggerOutAnimation() {
  if (outAnimated) return; outAnimated = true;
  document.querySelectorAll('.out-box').forEach((b,i)  => setTimeout(()=>b.classList.add('revealed'), i*200));
  document.querySelectorAll('.out-item').forEach((b,i) => setTimeout(()=>b.classList.add('revealed'), 400+i*120));
  document.querySelectorAll('.badge').forEach((b,i)    => setTimeout(()=>b.classList.add('revealed'), 700+i*100));
}
function triggerSkillAnimation() {
  if (skillAnimated) return; skillAnimated = true;
  var st = document.querySelector('.skill-title');
  if (st) { st.style.transition='opacity 0.6s ease,transform 0.6s ease'; st.style.opacity='1'; st.style.transform='translateY(0)'; }
  document.querySelectorAll('.skill-item').forEach((b,i) => setTimeout(()=>b.classList.add('revealed'), 200+i*80));
}

function updateNavigation() {
  var isFirst = currentPage===0, isLast = currentPage===totalPages-1;
  prevBtn.style.setProperty('opacity',    isFirst?'0':'1',       'important');
  prevBtn.style.setProperty('visibility', isFirst?'hidden':'visible', 'important');
  prevBtn.style.pointerEvents = isFirst ? 'none' : 'auto';
  nextBtn.classList.toggle('hint-float', isFirst);
  nextBtn.style.setProperty('opacity',    isLast?'0':'1',        'important');
  nextBtn.style.setProperty('visibility', isLast?'hidden':'visible', 'important');
  nextBtn.style.pointerEvents = isLast ? 'none' : 'auto';
  wrapper.style.transform = 'translateX('+(-currentPage*100)+'vw)';
  setTimeout(() => { if(currentPage===1) triggerOutAnimation(); if(currentPage===2) triggerSkillAnimation(); }, 400);
}

prevBtn.addEventListener('click', () => { if(currentPage>0){ currentPage--; updateNavigation(); } });
nextBtn.addEventListener('click', () => { if(currentPage<totalPages-1){ currentPage++; updateNavigation(); } });

(function () {
  if (!wrapper) return;
  var sx=0, sy=0, drag=false;
  wrapper.addEventListener('touchstart', e => { sx=e.touches[0].clientX; sy=e.touches[0].clientY; drag=true; }, { passive:true });
  wrapper.addEventListener('touchend',   e => {
    if (!drag) return; drag=false;
    var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
    if (Math.abs(dx)<Math.abs(dy)*1.5 || Math.abs(dx)<40) return;
    if (dx<0 && currentPage<totalPages-1){ currentPage++; updateNavigation(); }
    if (dx>0 && currentPage>0)           { currentPage--; updateNavigation(); }
  }, { passive:true });
})();

document.addEventListener('keydown', e => {
  if (!introNewSection || !introNewSection.classList.contains('active')) return;
  if (e.key==='ArrowLeft'  && currentPage>0)              { currentPage--; updateNavigation(); }
  if (e.key==='ArrowRight' && currentPage<totalPages-1)   { currentPage++; updateNavigation(); }
});

updateNavigation();

document.querySelectorAll('#rotate_line line').forEach((l,i) => l.style.setProperty('--delay', i*0.05+'s'));