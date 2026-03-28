(function () {
  var wl = document.querySelector('.wave-letters');
  var ws = document.querySelector('.wave-svg');
  if (wl) {
    wl.style.opacity = '0';
    wl.style.visibility = 'hidden';
  }
  if (ws) {
    ws.style.opacity = '0';
    ws.style.visibility = 'hidden';
  }
})();

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
document.documentElement.classList.add('js');

const heroIntro = document.getElementById('hero-intro');
const heroContent = document.querySelector('.hero-content');
const blurItems = document.querySelectorAll('.blurtext .blur-item');
const blurtext = document.querySelector('.blurtext');
const expandingCircle = document.querySelector('.expanding-circle');
const waveSvg = document.querySelector('.wave-svg');
const waveLetters = document.querySelector('.wave-letters');
const scrollHint = document.querySelector('.scroll-hint');
const projectsSection = document.getElementById('projects');

let waveStarted = false;

var cw = window.innerWidth,
  ch = window.innerHeight,
  nWaves = 5,
  waves = [],
  amp = 10,
  speed = 0.4,
  detail = 30,
  waveY = 0;
var waveStartScrollY = 0,
  maxWaveY = ch * 1.0;
var waveInitTarget = 0;

function drawWave(t) {
  var currentScroll = window.scrollY;
  var relativeScroll = Math.min(currentScroll - waveStartScrollY, maxWaveY);
  var target = Math.max(relativeScroll, waveInitTarget);
  waveY += (target - waveY) * 0.06;
  for (var k = 0; k < nWaves; k++) {
    var p = waves[k];
    if (!p) continue;
    var offset = ((1 - k / nWaves) * nWaves) / 6;
    var pts = '-20,-20 -20,' + (ch / 2).toFixed(2) + ' ';
    for (var i = -1; i < cw + detail; i += detail) {
      var y = ch + 150 - waveY;
      y += Math.sin(i * 0.003 - t / speed + offset) * amp;
      y += Math.sin(i * 0.004 - t / speed + offset) * amp;
      y += Math.sin(i * -0.011 - t / speed + 20 + offset) * amp;
      pts += i.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    pts += cw + ',-20';
    p.setAttribute('points', pts);
  }
}

function startTyping() {
  const typingEl = document.querySelector('.txt1');
  if (!typingEl) return;
  const typingText = 'PARK BO RAM';
  let index = 0;
  let blinkInterval = null;
  typingEl.textContent = '';
  function typeLetter() {
    if (index < typingText.length) {
      typingEl.textContent = typingText.slice(0, index + 1) + '|';
      index++;
      setTimeout(typeLetter, 200 + Math.random() * 300);
    } else {
      typingEl.textContent = typingText + '|';
      let visible = true;
      if (blinkInterval) clearInterval(blinkInterval);
      blinkInterval = setInterval(() => {
        typingEl.textContent = typingText + (visible ? '|' : ' ');
        visible = !visible;
      }, 500);
    }
  }
  setTimeout(typeLetter, 300);
}

function hideWave() {
  var waveWrapEl = document.querySelector('.wave-wrap');
  if (waveWrapEl) {
    waveWrapEl.style.visibility = 'hidden';
    waveWrapEl.style.pointerEvents = 'none';
  }
  if (waveSvg) {
    waveSvg.style.transition = 'none';
    waveSvg.style.opacity = '0';
    waveSvg.style.visibility = 'hidden';
  }
  if (waveLetters) {
    waveLetters.style.transition = 'none';
    waveLetters.style.opacity = '0';
    waveLetters.style.visibility = 'hidden';
  }
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.visibility = 'hidden';
  }
  gsap.ticker.remove(drawWave);
}

function startWaveAnimation() {
  if (waveStarted) return;
  waveStarted = true;
  waveStartScrollY = window.scrollY;
  waveY = 0;
  waveInitTarget = 0;

  for (var w = 0; w < nWaves; w++) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    waves.push(p);
    document.getElementById('m').appendChild(p);
    if (w === 0) {
      p.setAttribute('fill', '#fff');
    } else {
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#fff');
      p.setAttribute('stroke-dasharray', '2 4');
      p.setAttribute('stroke-width', String(3 - (w / nWaves) * 3));
    }
  }

  if (waveSvg) gsap.to(waveSvg, { opacity: 1, duration: 0.8 });
  gsap.fromTo('.txt1', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0 });
  startTyping();
  gsap.ticker.add(drawWave);

  gsap.to(
    { val: 0 },
    {
      val: ch * 0.3,
      duration: 2.5,
      ease: 'power1.out',
      onUpdate: function () {
        waveInitTarget = this.targets()[0].val;
      },
    },
  );
}

function initHeroIntro() {
  setTimeout(() => {
    if (blurItems[0]) blurItems[0].classList.add('active');
  }, 300);
  setTimeout(() => {
    if (blurItems[0]) {
      blurItems[0].classList.remove('active');
      blurItems[0].classList.add('past');
    }
    if (blurItems[1]) blurItems[1].classList.add('active');
  }, 2000);
}

function initScrollAnimation() {
  if (!heroIntro || !heroContent) return;

  const isMobile = window.innerWidth <= 768;
  const blurHideProgress = isMobile ? 0.18 : 0.3;
  let autoTriggered = false;
  let heroTl = null;

  // ✅ 핵심: 스케일 값 직접 추적 (핸드오프 시 점프 방지)
  let mobileCircleScale = 0;
  // ✅ 핵심: quickSetter - scroll 이벤트용 최적화 API (gsap.set보다 훨씬 빠름)
  const quickSetScale = gsap.quickSetter(expandingCircle, 'scale');

  function triggerAutoExpand() {
    if (autoTriggered) return;
    autoTriggered = true;

    if (heroTl) {
      if (heroTl.scrollTrigger) heroTl.scrollTrigger.kill();
      heroTl.kill();
      heroTl = null;
    }

    if (blurtext) {
      blurtext.style.opacity = '0';
      blurtext.style.visibility = 'hidden';
    }

    // ✅ 추적한 변수로 fromScale 설정 → 현재 위치에서 부드럽게 이어짐
    const fromScale = isMobile
      ? mobileCircleScale
      : gsap.getProperty(expandingCircle, 'scale') || 0;

    gsap.fromTo(
      expandingCircle,
      { scale: fromScale },
      {
        scale: isMobile ? 22 : 90,
        duration: isMobile ? 0.75 : 1.0,
        ease: 'power2.in',
        force3D: true,
        overwrite: true,
        onComplete: () => {
          var waveWrapEl = document.querySelector('.wave-wrap');
          if (waveWrapEl) {
            waveWrapEl.style.visibility = 'visible';
            waveWrapEl.style.pointerEvents = '';
          }
          if (!waveStarted) startWaveAnimation();
          if (waveSvg) {
            waveSvg.style.opacity = '1';
            waveSvg.style.visibility = 'visible';
          }
          if (waveLetters) {
            setTimeout(() => {
              waveLetters.style.opacity = '1';
              waveLetters.style.visibility = 'visible';
            }, 600);
          }
          // ✅ 모바일에서는 scrollTo 제거 - 사용자 스크롤 방해하지 않음
          if (!isMobile) {
            gsap.to(window, {
              scrollTo: window.scrollY + ch * 0.5,
              duration: 1.4,
              ease: 'power2.inOut',
            });
          }
        },
      },
    );
  }

  if (isMobile) {
    const heroHeight = heroIntro.offsetHeight;
    const heroTop = heroIntro.offsetTop;

    function onMobileScroll() {
      const scrollY = window.scrollY;
      const progress = Math.min(
        Math.max((scrollY - heroTop) / heroHeight, 0),
        1,
      );

      if (progress >= 1) {
        hideWave();
        return;
      }

      if (heroContent) {
        heroContent.style.opacity = '1';
        heroContent.style.visibility = 'visible';
      }

      if (progress > 0.01) expandingCircle.classList.add('show');
      if (scrollHint) scrollHint.classList.toggle('hide', progress > 0.02);

      if (!autoTriggered && blurtext) {
        blurtext.style.opacity = progress > blurHideProgress ? '0' : '1';
        blurtext.style.visibility =
          progress > blurHideProgress ? 'hidden' : 'visible';
      }

      // ✅ quickSetter: RAF와 동기화, 오버헤드 없음 → 버벅임 완전 제거
      if (!autoTriggered) {
        const targetScale = (progress / 0.6) * 12;
        mobileCircleScale = Math.min(targetScale, 12);
        quickSetScale(mobileCircleScale);
      }

      if (progress >= 0.6 && !autoTriggered) {
        triggerAutoExpand();
      }

      if (!autoTriggered) {
        const waveShowProgress = 0.3;
        const lettersShowProgress = 0.42;
        if (progress > waveShowProgress && !waveStarted) startWaveAnimation();
        if (waveSvg) {
          waveSvg.style.opacity = progress > waveShowProgress ? '1' : '0';
          waveSvg.style.visibility =
            progress > waveShowProgress ? 'visible' : 'hidden';
        }
        if (waveLetters) {
          waveLetters.style.opacity =
            progress > lettersShowProgress ? '1' : '0';
          waveLetters.style.visibility =
            progress > lettersShowProgress ? 'visible' : 'hidden';
        }
      }
    }

    window.addEventListener('scroll', onMobileScroll, { passive: true });

    ScrollTrigger.create({
      trigger: heroIntro,
      start: 'top 10%',
      onEnterBack: () => {
        autoTriggered = false;
        // ✅ 리셋 시 추적 변수도 초기화
        mobileCircleScale = 0;
        quickSetScale(0);
        expandingCircle.classList.remove('show');
        if (blurtext) {
          blurtext.style.opacity = '1';
          blurtext.style.visibility = 'visible';
        }
        var waveWrapEl = document.querySelector('.wave-wrap');
        if (waveWrapEl) {
          waveWrapEl.style.visibility = 'visible';
          waveWrapEl.style.pointerEvents = '';
        }
        if (heroContent) {
          heroContent.style.opacity = '1';
          heroContent.style.visibility = 'visible';
        }
      },
    });

    const introNewSec = document.getElementById('intro-new');
    if (introNewSec) {
      ScrollTrigger.create({
        trigger: introNewSec,
        start: 'top 98%',
        onEnter: () => hideWave(),
      });
    }

  } else {
    heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroIntro,
        start: 'top top',
        end: 'bottom bottom',
        pin: heroContent,
        pinSpacing: false,
        scrub: 0.5,
        onLeave: () => hideWave(),
        onEnterBack: () => {
          autoTriggered = false;
          heroTl = null;
          mobileCircleScale = 0;
          gsap.set(expandingCircle, { scale: 0 });
          expandingCircle.classList.remove('show');
          if (blurtext) {
            blurtext.style.opacity = '1';
            blurtext.style.visibility = 'visible';
          }
          var waveWrapEl = document.querySelector('.wave-wrap');
          if (waveWrapEl) {
            waveWrapEl.style.visibility = 'visible';
            waveWrapEl.style.pointerEvents = '';
          }
          if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.visibility = 'visible';
          }
          if (waveStarted && waveSvg) {
            waveSvg.style.visibility = 'visible';
            waveSvg.style.opacity = '1';
            gsap.ticker.remove(drawWave);
            gsap.ticker.add(drawWave);
          }
        },
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress > 0.01) expandingCircle.classList.add('show');
          if (scrollHint) scrollHint.classList.toggle('hide', progress > 0.02);
          if (!autoTriggered && blurtext) {
            blurtext.style.opacity = progress > blurHideProgress ? '0' : '1';
            blurtext.style.visibility =
              progress > blurHideProgress ? 'hidden' : 'visible';
          }
          if (progress >= 0.6 && !autoTriggered) triggerAutoExpand();
          if (!autoTriggered) {
            const waveShowProgress = 0.4;
            const lettersShowProgress = 0.65;
            if (progress > waveShowProgress && !waveStarted)
              startWaveAnimation();
            if (waveSvg) {
              waveSvg.style.opacity = progress > waveShowProgress ? '1' : '0';
              waveSvg.style.visibility =
                progress > waveShowProgress ? 'visible' : 'hidden';
            }
            if (waveLetters) {
              waveLetters.style.opacity =
                progress > lettersShowProgress ? '1' : '0';
              waveLetters.style.visibility =
                progress > lettersShowProgress ? 'visible' : 'hidden';
            }
            if (expandingCircle)
              expandingCircle.style.visibility =
                progress > 0.55 ? 'hidden' : 'visible';
          }
        },
      },
    });

    heroTl.to(
      expandingCircle,
      {
        scale: 50,
        duration: 1.5,
        ease: 'power1.inOut',
        force3D: true,
      },
      0,
    );

    const introNewSec = document.getElementById('intro-new');
    if (introNewSec) {
      ScrollTrigger.create({
        trigger: introNewSec,
        start: 'top 98%',
        onEnter: () => hideWave(),
      });
    }
  }
}

function initAboutAnimation() {
  function splitToChars(el) {
    const text = el.textContent;
    el.innerHTML = '';
    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.cssText =
        'display:inline-block; color:rgba(255,255,255,0.05); white-space:pre;';
      el.appendChild(span);
    });
    return el.querySelectorAll('span');
  }

  function splitDescWords(el) {
    const nodes = Array.from(el.childNodes);
    nodes.forEach((node) => {
      if (node.nodeType === 3 && node.textContent.trim()) {
        const parts = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((w) => {
          if (/^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(w));
          } else if (w) {
            const span = document.createElement('span');
            span.className = 'dw';
            span.textContent = w;
            span.style.cssText =
              'display:inline-block; color:rgba(255,255,255,0.05); font-weight:400;';
            frag.appendChild(span);
          }
        });
        node.replaceWith(frag);
      } else if (node.nodeName === 'B') {
        const innerText = node.textContent;
        node.innerHTML = '';
        innerText.split(/(\s+)/).forEach((w) => {
          if (/^\s+$/.test(w)) {
            node.appendChild(document.createTextNode(w));
          } else if (w) {
            const span = document.createElement('span');
            span.className = 'dw dw--bold';
            span.textContent = w;
            span.style.cssText =
              'display:inline-block; color:rgba(255,255,255,0.05); font-weight:700;';
            node.appendChild(span);
          }
        });
      }
    });
    return el.querySelectorAll('.dw');
  }

  const floatParams = [
    { y: 20, x: 8, rot: 4, dur: 2.4 },
    { y: 16, x: -10, rot: -3, dur: 3.0 },
    { y: 22, x: 6, rot: 3, dur: 2.0 },
    { y: 18, x: -8, rot: -4, dur: 2.7 },
  ];

  function createFloatTweens(img, p) {
    return [
      gsap.to(img, {
        y: '-=' + p.y,
        duration: p.dur,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
      gsap.to(img, {
        x: p.x,
        duration: p.dur * 1.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
      gsap.to(img, {
        rotation: p.rot,
        duration: p.dur * 1.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
    ];
  }

  function killFloatTweens(img) {
    if (img._floatTweens) {
      img._floatTweens.forEach((t) => t.kill());
      img._floatTweens = null;
    }
  }

  document.querySelectorAll('.about-panel').forEach((panel) => {
    const floatImgs = Array.from(panel.querySelectorAll('.float-img'));
    var allChars = [];
    panel.querySelectorAll('.word').forEach((wordEl) => {
      allChars.push(...splitToChars(wordEl));
    });
    const descEl = panel.querySelector('.panel-desc');
    const descWords = splitDescWords(descEl);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 60%',
        end: 'bottom 52%',
        scrub: 0.5,
      },
    });
    allChars.forEach((char, i) => {
      tl.to(
        char,
        { color: '#ffffff', duration: 0.2, ease: 'power2.inOut' },
        i * 0.03,
      );
    });
    descWords.forEach((word, i) => {
      const isBold = word.classList.contains('dw--bold');
      tl.to(
        word,
        {
          color: isBold ? '#ffffff' : 'rgba(255,255,255,0.8)',
          duration: 0.25,
          ease: 'power1.inOut',
        },
        i * 0.05,
      );
    });

    floatImgs.forEach((img) => gsap.set(img, { opacity: 0, y: 80 }));

    ScrollTrigger.create({
      trigger: panel,
      start: 'top 75%',
      end: 'bottom 20%',
      onEnter: () => {
        floatImgs.forEach((img, i) => {
          killFloatTweens(img);
          gsap.to(img, {
            opacity: 1,
            y: 0,
            duration: 1.0,
            delay: i * 0.12,
            ease: 'power3.out',
            onComplete: () => {
              img._floatTweens = createFloatTweens(
                img,
                floatParams[i] || floatParams[0],
              );
            },
          });
        });
      },
      onLeave: () => {
        floatImgs.forEach((img) => {
          killFloatTweens(img);
          gsap.to(img, {
            opacity: 0,
            y: -60,
            duration: 0.5,
            ease: 'power2.in',
          });
        });
      },
      onEnterBack: () => {
        floatImgs.forEach((img, i) => {
          killFloatTweens(img);
          gsap.to(img, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              img._floatTweens = createFloatTweens(
                img,
                floatParams[i] || floatParams[0],
              );
            },
          });
        });
      },
      onLeaveBack: () => {
        floatImgs.forEach((img) => {
          killFloatTweens(img);
          gsap.to(img, { opacity: 0, y: 80, duration: 0.5, ease: 'power2.in' });
        });
      },
    });
  });
}

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
var lineEq = function (y2, y1, x2, x1, currentVal) {
  var m = (y2 - y1) / (x2 - x1);
  return m * currentVal + (y1 - m * x1);
};
var chars = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z',
  '.', ':', '', '^',
];
var charsTotal = chars.length;

var charming = function (el) {
  var text = el.textContent;
  el.innerHTML = '';
  text.split('').forEach(function (char, i) {
    var span = document.createElement('span');
    span.className = 'char' + (i + 1);
    span.textContent = char;
    el.appendChild(span);
  });
};

var randomizeLetters = function (letters) {
  return new Promise(function (resolve) {
    var lettersTotal = letters.length,
      cnt = 0;
    letters.forEach(function (letter, pos) {
      var loopTimeout;
      var loop = function () {
        letter.innerHTML = chars[getRandomInt(0, charsTotal - 1)];
        loopTimeout = setTimeout(loop, getRandomInt(50, 500));
      };
      loop();
      setTimeout(
        function () {
          clearTimeout(loopTimeout);
          letter.style.opacity = 1;
          letter.innerHTML = letter.dataset.initial;
          if (++cnt === lettersTotal) resolve();
        },
        pos * lineEq(40, 0, 8, 200, lettersTotal),
      );
    });
  });
};

var disassembleLetters = function (letters) {
  return new Promise(function (resolve) {
    var lettersTotal = letters.length,
      cnt = 0;
    letters.forEach(function (letter, pos) {
      setTimeout(function () {
        letter.style.opacity = 0;
        if (++cnt === lettersTotal) resolve();
      }, pos * 30);
    });
  });
};

class Slide {
  constructor(el) {
    this.DOM = { el };
    this.DOM.imgWrap = el.querySelector('.slide__img-wrap');
    this.DOM.img = this.DOM.imgWrap.querySelector('.slide__img');
    this.DOM.texts = {
      wrap: el.querySelector('.slide__title-wrap'),
      title: el.querySelector('.slide__title'),
      number: el.querySelector('.slide__number'),
      side: el.querySelector('.slide__side'),
    };
    charming(this.DOM.texts.title);
    charming(this.DOM.texts.side);
    this.DOM.titleLetters = Array.from(
      this.DOM.texts.title.querySelectorAll('span'),
    ).sort(() => 0.5 - Math.random());
    this.DOM.sideLetters = Array.from(
      this.DOM.texts.side.querySelectorAll('span'),
    ).sort(() => 0.5 - Math.random());
    this.DOM.titleLetters.forEach((l) => (l.dataset.initial = l.innerHTML));
    this.DOM.sideLetters.forEach((l) => (l.dataset.initial = l.innerHTML));
    this.calcSizes();
    this.calcTransforms();
    this.initEvents();
  }
  calcSizes() {
    this.width = this.DOM.imgWrap.offsetWidth;
    this.height = this.DOM.imgWrap.offsetHeight;
  }
  calcTransforms() {
    const isMobile = winsize.width <= 768;
    if (isMobile) {
      this.transforms = [
        { x: -winsize.width * 1.2, y: 0, rotation: 0 },
        { x: -winsize.width * 0.6, y: 0, rotation: 0 },
        { x: 0, y: 0, rotation: 0 },
        { x: winsize.width * 0.6, y: 0, rotation: 0 },
        { x: winsize.width * 1.2, y: 0, rotation: 0 },
        { x: 0, y: 0, rotation: 0 },
      ];
    } else {
      this.transforms = [
        {
          x: -1 * (winsize.width / 2 + this.width),
          y: -1 * (winsize.height / 2 + this.height),
          rotation: -30,
        },
        {
          x: -1 * (winsize.width / 2 - this.width / 3),
          y: -1 * (winsize.height / 2 - this.height / 3),
          rotation: 0,
        },
        { x: 0, y: 0, rotation: 0 },
        {
          x: winsize.width / 2 - this.width / 3,
          y: winsize.height / 2 - this.height / 3,
          rotation: 0,
        },
        {
          x: winsize.width / 2 + this.width,
          y: winsize.height / 2 + this.height,
          rotation: 30,
        },
        {
          x: -1 * (winsize.width / 2 - this.width / 2 - winsize.width * 0.075),
          y: 0,
          rotation: 0,
        },
      ];
    }
  }
  initEvents() {
    this.DOM.imgWrap.addEventListener('mouseenter', () => {
      if (!this.isPositionedCenter()) return;
      clearTimeout(this.mousetime);
      this.mousetime = setTimeout(
        () =>
          gsap.to(this.DOM.img, {
            duration: 0.5,
            ease: 'power2.out',
            scale: 1.08,
          }),
        40,
      );
    });
    this.DOM.imgWrap.addEventListener('mouseleave', () => {
      if (!this.isPositionedCenter()) return;
      clearTimeout(this.mousetime);
      gsap.to(this.DOM.img, { duration: 0.5, ease: 'power2.out', scale: 1 });
    });
  }
  position(pos) {
    gsap.set(this.DOM.imgWrap, {
      x: this.transforms[pos].x,
      y: this.transforms[pos].y,
      rotationX: 0,
      rotationY: 0,
      opacity: 1,
      rotationZ: this.transforms[pos].rotation,
    });
  }
  setCurrent(isContentOpen) {
    this.isCurrent = true;
    this.DOM.el.classList.add('slide--current', 'slide--visible');
    this.position(isContentOpen ? 5 : 2);
  }
  setLeft(isContentOpen) {
    this.isRight = this.isCurrent = false;
    this.isLeft = true;
    this.DOM.el.classList.add('slide--visible');
    this.position(isContentOpen ? 0 : 1);
  }
  setRight(isContentOpen) {
    this.isLeft = this.isCurrent = false;
    this.isRight = true;
    this.DOM.el.classList.add('slide--visible');
    this.position(isContentOpen ? 4 : 3);
  }
  isPositionedRight() { return this.isRight; }
  isPositionedLeft() { return this.isLeft; }
  isPositionedCenter() { return this.isCurrent; }
  reset() {
    this.isRight = this.isLeft = this.isCurrent = false;
    this.DOM.el.className = 'slide';
  }
  hide() {
    gsap.set(this.DOM.imgWrap, {
      x: 0, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, opacity: 0,
    });
  }
  moveToPosition(settings) {
    const isMobile = winsize.width <= 768;
    const dur = isMobile ? 0.45 : 0.8;
    return new Promise((resolve) => {
      gsap.to(this.DOM.imgWrap, {
        duration: dur,
        ease: isMobile ? 'power2.inOut' : 'power4.inOut',
        delay: settings.delay || 0,
        startAt:
          settings.from !== undefined
            ? {
                x: this.transforms[settings.from + 2].x,
                y: this.transforms[settings.from + 2].y,
                rotationX: 0,
                rotationY: 0,
                rotationZ: this.transforms[settings.from + 2].rotation,
              }
            : {},
        x: this.transforms[settings.position + 2].x,
        y: this.transforms[settings.position + 2].y,
        rotationX: 0,
        rotationY: 0,
        rotationZ: this.transforms[settings.position + 2].rotation,
        onStart:
          settings.from !== undefined
            ? () => gsap.set(this.DOM.imgWrap, { opacity: 1 })
            : null,
        onComplete: resolve,
      });
      if (settings.resetImageScale) {
        gsap.to(this.DOM.img, {
          duration: dur,
          ease: 'power4.inOut',
          scale: 1,
        });
      }
    });
  }
  hideTexts(animation) {
    animation = animation || false;
    if (animation) {
      disassembleLetters(this.DOM.titleLetters).then(() =>
        gsap.set(this.DOM.texts.wrap, { opacity: 0 }),
      );
      disassembleLetters(this.DOM.sideLetters).then(() =>
        gsap.set(this.DOM.texts.side, { opacity: 0 }),
      );
    } else {
      gsap.set(this.DOM.texts.wrap, { opacity: 0 });
      gsap.set(this.DOM.texts.side, { opacity: 0 });
    }
  }
  showTexts(animation) {
    animation = animation !== false;
    gsap.set(this.DOM.texts.wrap, { opacity: 1 });
    gsap.set(this.DOM.texts.side, { opacity: 1 });
    if (animation) {
      randomizeLetters(this.DOM.titleLetters);
      randomizeLetters(this.DOM.sideLetters);
      gsap.to(this.DOM.texts.number, {
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
        startAt: { x: '-50%', opacity: 0 },
        x: '0%',
        opacity: 1,
      });
    }
  }
}

class Content {
  constructor(el) {
    this.DOM = { el };
    this.DOM.image = el.querySelector('.content__item-image');
    this.DOM.number = el.querySelector('.content__number');
    this.DOM.title = el.querySelector('.content__title');
    this.DOM.subtitle = el.querySelector('.content__subtitle');
    this.DOM.info = el.querySelector('.content__info');
    this.DOM.buttons = el.querySelector('.content__buttons');
  }
  show() {
    var video = this.DOM.image && this.DOM.image.querySelector('video');
    if (video) video.play().catch(function () {});
    this.DOM.el.classList.add('content__item--current');
    gsap.to(this.DOM.image, {
      duration: 0.8,
      ease: 'power4.out',
      opacity: 1,
      x: 0,
      startAt: { opacity: 0, x: -50 },
    });
    gsap.to(
      [this.DOM.number, this.DOM.title, this.DOM.subtitle, this.DOM.info, this.DOM.buttons],
      {
        duration: 0.8,
        ease: 'power4.out',
        opacity: 1,
        startAt: { y: 40, opacity: 0 },
        y: 0,
        stagger: 0.05,
      },
    );
    var projectName = this.DOM.title.textContent;
    document
      .querySelectorAll('.content .marquee-track--left, .content .marquee-track--right')
      .forEach(function (track) {
        track.innerHTML = Array(20)
          .fill('<span>' + projectName + '</span>')
          .join('');
      });
    var marquee = document.querySelector('.content .marquee-wrap');
    if (marquee) marquee.style.opacity = '1';
  }
  hide() {
    var video = this.DOM.image && this.DOM.image.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    this.DOM.el.classList.remove('content__item--current');
    gsap.to(
      [this.DOM.image, this.DOM.number, this.DOM.title, this.DOM.subtitle, this.DOM.info, this.DOM.buttons].reverse(),
      { duration: 0.3, ease: 'power3.in', opacity: 0, stagger: 0.01 },
    );
    var marquee = document.querySelector('.content .marquee-wrap');
    if (marquee) marquee.style.opacity = '0';
  }
}

class Slideshow {
  constructor(el) {
    this.DOM = { el };
    this.slides = Array.from(el.querySelectorAll('.slide')).map(
      (s) => new Slide(s),
    );
    this.slidesTotal = this.slides.length;
    if (this.slidesTotal < 3) return;
    this.current = 0;
    this.DOM.deco = el.querySelector('.slideshow__deco');
    this.DOM.navPrev = el.querySelector('.nav--prev');
    this.DOM.navNext = el.querySelector('.nav--next');
    this.DOM.closeCtrl = document.querySelector('.content__back');
    this.contents = Array.from(
      document.querySelectorAll('.content > .content__item'),
    ).map((c) => new Content(c));
    this.render();
    this.currentSlide.showTexts(false);
    this.initEvents();
  }
  render() {
    this.currentSlide = this.slides[this.current];
    this.nextSlide =
      this.slides[this.current + 1 <= this.slidesTotal - 1 ? this.current + 1 : 0];
    this.prevSlide =
      this.slides[this.current - 1 >= 0 ? this.current - 1 : this.slidesTotal - 1];
    this.currentSlide.setCurrent();
    this.nextSlide.setRight();
    this.prevSlide.setLeft();
  }
  initEvents() {
    this.slides.forEach((slide) =>
      slide.DOM.imgWrap.addEventListener('click', () => {
        if (slide.isPositionedRight()) this.navigate('next');
        else if (slide.isPositionedLeft()) this.navigate('prev');
        else this.showContent();
      }),
    );
    this.DOM.navNext &&
      this.DOM.navNext.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate('next');
      });
    this.DOM.navPrev &&
      this.DOM.navPrev.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate('prev');
      });
    this.DOM.closeCtrl &&
      this.DOM.closeCtrl.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideContent();
      });
    window.addEventListener(
      'resize',
      () => {
        this.slides.forEach((s) => {
          s.calcSizes();
          s.calcTransforms();
        });
        this.nextSlide.setRight(this.isContentOpen);
        this.prevSlide.setLeft(this.isContentOpen);
        this.currentSlide.setCurrent(this.isContentOpen);
        if (this.isContentOpen && this.DOM.deco) {
          gsap.set(this.DOM.deco, {
            scaleX: winsize.width / this.DOM.deco.offsetWidth,
            scaleY: winsize.height / this.DOM.deco.offsetHeight,
            x: -20,
            y: 20,
          });
        }
      },
      { passive: true },
    );
  }
  showContent() {
    if (this.isContentOpen || this.isAnimating) return;
    allowTilt = false;
    this.isContentOpen = true;
    this.DOM.el.classList.add('slideshow--previewopen');
    if (winsize.width > 768 && this.DOM.deco) {
      gsap.to(this.DOM.deco, {
        duration: 0.8,
        ease: 'power4.inOut',
        scaleX: winsize.width / this.DOM.deco.offsetWidth,
        scaleY: winsize.height / this.DOM.deco.offsetHeight,
        x: -20,
        y: 20,
      });
    }
    gsap.to(this.DOM.closeCtrl, {
      duration: 0.8,
      ease: 'power4.out',
      delay: 0.4,
      opacity: 1,
    });
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
      gsap.to(this.DOM.deco, {
        duration: 0.8,
        ease: 'power4.inOut',
        scaleX: 1, scaleY: 1, x: 0, y: 0,
      });
    }
    this.prevSlide.moveToPosition({ position: -1 });
    this.nextSlide.moveToPosition({ position: 1 });
    this.currentSlide.moveToPosition({ position: 0 }).then(() => {
      allowTilt = true;
      this.isContentOpen = false;
    });
    this.currentSlide.showTexts();
  }
  bounceDeco(direction, delay) {
    if (winsize.width <= 768 || !this.DOM.deco) return;
    gsap.to(this.DOM.deco, {
      duration: 0.4,
      ease: 'power2.in',
      delay: delay * 1.2,
      x: direction === 'next' ? -40 : 40,
      y: direction === 'next' ? -40 : 40,
      onComplete: () =>
        gsap.to(this.DOM.deco, { duration: 0.6, ease: 'power2.out', x: 0, y: 0 }),
    });
  }
  navigate(direction) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    allowTilt = false;
    const isMobile = winsize.width <= 768;
    const d1 = 0,
      d2 = isMobile ? 0.05 : 0.07,
      d3 = isMobile ? 0.1 : 0.14,
      d4 = isMobile ? 0.14 : 0.21;
    const upcomingPos =
      direction === 'next'
        ? this.current < this.slidesTotal - 2
          ? this.current + 2
          : Math.abs(this.slidesTotal - 2 - this.current)
        : this.current >= 2
          ? this.current - 2
          : Math.abs(this.slidesTotal - 2 + this.current);
    this.upcomingSlide = this.slides[upcomingPos];
    this.current =
      direction === 'next'
        ? this.current < this.slidesTotal - 1
          ? this.current + 1
          : 0
        : this.current > 0
          ? this.current - 1
          : this.slidesTotal - 1;
    this.prevSlide
      .moveToPosition({
        position: direction === 'next' ? -2 : 0,
        delay: direction === 'next' ? d1 : d3,
      })
      .then(() => { if (direction === 'next') this.prevSlide.hide(); });
    this.currentSlide.moveToPosition({
      position: direction === 'next' ? -1 : 1,
      delay: d2,
    });
    this.currentSlide.hideTexts();
    this.bounceDeco(direction, d2);
    this.nextSlide
      .moveToPosition({
        position: direction === 'next' ? 0 : 2,
        delay: direction === 'next' ? d3 : d1,
      })
      .then(() => { if (direction === 'prev') this.nextSlide.hide(); });
    if (direction === 'next') this.nextSlide.showTexts();
    else this.prevSlide.showTexts();
    this.upcomingSlide
      .moveToPosition({
        position: direction === 'next' ? 1 : -1,
        from: direction === 'next' ? 2 : -2,
        delay: d4,
      })
      .then(() => {
        [this.nextSlide, this.currentSlide, this.prevSlide].forEach((s) => s.reset());
        this.render();
        allowTilt = true;
        this.isAnimating = false;
      });
  }
}

function createSlideshowWithVideoEvents() {
  document.querySelectorAll('.content__item-image video').forEach(function (video) {
    var source = video.querySelector('source');
    if (source && source.dataset.src && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
  });
  slideshow = new Slideshow(document.querySelector('.slideshow'));
}

function initIllustrationScroll() {
  var gallerySection = document.querySelector('.gallery-section');
  var items = document.querySelectorAll('.gallery-item');
  var titleLeft = document.querySelector('.gallery-title-left');
  var titleRight = document.querySelector('.gallery-title-right');
  if (!gallerySection || !items.length) return;
  gsap.set(titleLeft, { x: '-50vw' });
  gsap.set(titleRight, { x: '50vw' });
  var titleConfig = {
    trigger: gallerySection,
    start: 'top 95%',
    end: 'top 10%',
    scrub: 3,
  };
  gsap.to(titleLeft, { x: 0, ease: 'power3.out', scrollTrigger: titleConfig });
  gsap.to(titleRight, { x: 0, ease: 'power3.out', scrollTrigger: titleConfig });
  ScrollTrigger.create({
    trigger: gallerySection,
    start: 'top 80%',
    end: 'bottom top',
    onEnter: () => gallerySection.classList.add('active'),
    onLeave: () => gallerySection.classList.remove('active'),
    onEnterBack: () => gallerySection.classList.add('active'),
    onLeaveBack: () => gallerySection.classList.remove('active'),
  });
  if (window.innerWidth <= 768) {
    gsap.set(items, { clearProps: 'all' });
    items.forEach(function (item) {
      var img = item.querySelector('img');
      gsap.set(img, { filter: 'grayscale(100%)' });
      item.addEventListener('click', function () {
        if (item.classList.contains('active')) {
          item.classList.remove('active');
          gsap.to(img, { filter: 'grayscale(100%)', duration: 0.4, ease: 'power2.out' });
        } else {
          item.classList.add('active');
          gsap.to(img, { filter: 'grayscale(0%)', duration: 0.4, ease: 'power2.out' });
        }
      });
    });
    return;
  }
  gsap.set(items[0], { x: '-25vw', y: 0, scale: 1, zIndex: 1 });
  gsap.set(items[1], { x: '0vw', y: 0, scale: 1, zIndex: 2 });
  gsap.set(items[2], { x: '25vw', y: 0, scale: 1, zIndex: 1 });
  gsap
    .timeline({
      scrollTrigger: {
        trigger: gallerySection,
        start: 'top top',
        end: '+=300',
        scrub: 0.3,
        pin: true,
      },
    })
    .to(items[0], { x: '-34vw', y: 0, scale: 1 }, 0)
    .to(items[1], { x: '0vw', y: 0, scale: 1 }, 0)
    .to(items[2], { x: '34vw', y: 0, scale: 1 }, 0);
  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      gsap.to(item, {
        scale: 1.1, rotationY: 5, rotationX: -3,
        duration: 0.4, ease: 'power2.out', zIndex: 10, overwrite: 'auto',
      });
    });
    item.addEventListener('mouseleave', function () {
      gsap.to(item, {
        scale: 1, rotationY: 0, rotationX: 0,
        duration: 0.4, ease: 'power2.out', zIndex: 1, overwrite: 'auto',
      });
    });
  });
}

function initContactAnimation() {
  var contactSection = document.getElementById('contact');
  if (!contactSection) return;
  var gradientImg = contactSection.querySelector('.gradient-img');
  var img = contactSection.querySelector('.gradient-img img');
  var title = contactSection.querySelector('.contact-title');
  var desc = contactSection.querySelector('.contact-desc');
  var btn = contactSection.querySelector('.contact-btn');
  if (!gradientImg) return;
  gsap.set(gradientImg, { scale: 0.25 });
  gsap.to(gradientImg, {
    scale: 3,
    ease: 'none',
    scrollTrigger: {
      trigger: contactSection,
      start: 'top bottom',
      end: 'center center',
      scrub: 1.2,
    },
  });
  if (img) {
    gsap.to(img, {
      scale: 1.25,
      ease: 'none',
      scrollTrigger: {
        trigger: contactSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    });
  }
  ScrollTrigger.create({
    trigger: contactSection,
    start: 'top 60%',
    onEnter: () => {
      if (title) title.classList.add('revealed');
      if (desc) desc.classList.add('revealed');
      if (btn) btn.classList.add('revealed');
    },
    onLeaveBack: () => {
      if (title) title.classList.remove('revealed');
      if (desc) desc.classList.remove('revealed');
      if (btn) btn.classList.remove('revealed');
    },
  });
}

function initNewIntroAnimation() {
  var introNewSection = document.getElementById('intro-new');
  if (!introNewSection) return;
  var introNewImage = document.querySelector('.intro-new-image');
  var introNewTitleLines = document.querySelectorAll('.intro-new-title-line');
  var introNewDivider = document.querySelector('.intro-new-divider');
  var introNewText = document.querySelector('.intro-new-text');
  var verticalLine = document.querySelector('.intro-new-vertical-line');
  var orbitRight = document.querySelector('.about-right');
  ScrollTrigger.create({
    trigger: introNewSection,
    start: 'top 75%',
    once: true,
    onEnter: function () {
      if (introNewImage)
        setTimeout(() => introNewImage.classList.add('revealed'), 100);
      if (orbitRight)
        setTimeout(() => orbitRight.classList.add('revealed'), 300);
      if (verticalLine) {
        setTimeout(() => {
          verticalLine.classList.add('revealed');
          gsap.to(verticalLine, { height: '60%', duration: 0.8, ease: 'power2.out' });
        }, 500);
      }
      setTimeout(() => {
        introNewTitleLines.forEach((line) => line.classList.add('revealed'));
        if (introNewDivider) introNewDivider.classList.add('revealed');
        if (introNewText) introNewText.classList.add('revealed');
      }, 800);
    },
  });
}

function initProjectsTitleAnimation() {
  var titleLeft = document.querySelector('.title-left');
  var titleRight = document.querySelector('.title-right');
  if (!titleLeft || !titleRight || !projectsSection) return;
  gsap.set(titleLeft, { x: '-50vw' });
  gsap.set(titleRight, { x: '50vw' });
  var stConfig = {
    trigger: projectsSection,
    start: 'top 95%',
    end: 'top 10%',
    scrub: 3,
  };
  gsap.to(titleLeft, { x: 0, ease: 'power3.out', scrollTrigger: stConfig });
  gsap.to(titleRight, { x: 0, ease: 'power3.out', scrollTrigger: stConfig });
}

var winsize;
var calcWinsize = function () {
  winsize = { width: window.innerWidth, height: window.innerHeight };
};
calcWinsize();

var allowTilt = true;
var slideshow;

function init() {
  if (expandingCircle) gsap.set(expandingCircle, { scale: 0, force3D: true });
  if (waveSvg) gsap.set(waveSvg, { opacity: 0, visibility: 'hidden' });
  if (waveLetters) gsap.set(waveLetters, { opacity: 0, visibility: 'hidden' });
  if (blurtext) {
    blurtext.style.opacity = '1';
    blurtext.style.visibility = 'visible';
  }
  blurItems.forEach((item) => item.classList.remove('active', 'past'));

  var illWrap = document.querySelector('.ill-text-wrap');
  if (illWrap) {
    illWrap.style.opacity = '0';
    illWrap.style.visibility = 'hidden';
  }

  setTimeout(initHeroIntro, 500);
  initScrollAnimation();
  initAboutAnimation();
  initProjectsTitleAnimation();
  initNewIntroAnimation();

  if (projectsSection) {
    ScrollTrigger.create({
      trigger: projectsSection,
      start: 'top 80%',
      end: 'bottom top',
      onEnter: function () {
        projectsSection.classList.add('active');
        if (illWrap) { illWrap.style.opacity = '0'; illWrap.style.visibility = 'hidden'; }
        if (!slideshow) createSlideshowWithVideoEvents();
      },
      onLeave: () => {
        if (illWrap) { illWrap.style.opacity = '0'; illWrap.style.visibility = 'hidden'; }
      },
      onEnterBack: () => {
        if (illWrap) { illWrap.style.opacity = '0'; illWrap.style.visibility = 'hidden'; }
      },
    });
  }

  initIllustrationScroll();
  initContactAnimation();
}

window.addEventListener('load', init);

var resizeTimeout;
window.addEventListener(
  'resize',
  function () {
    cw = window.innerWidth;
    ch = window.innerHeight;
    calcWinsize();
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      ScrollTrigger.refresh();
    }, 250);
  },
  { passive: true },
);

(function () {
  var cursor = document.querySelector('.cursor');
  if (!cursor) return;
  var mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  var cursorSpeed = 0.15;
  var cursorRafId = null;
  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });
  function animateCursor() {
    cursorX += (mouseX - cursorX) * cursorSpeed;
    cursorY += (mouseY - cursorY) * cursorSpeed;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursorRafId = requestAnimationFrame(animateCursor);
  }
  if (!cursorRafId) animateCursor();
  var animateit = function (e) {
    var span = this.querySelector(':scope > span');
    if (!span) return;
    var x = e.offsetX, y = e.offsetY;
    var w = this.offsetWidth, h = this.offsetHeight;
    var move = 25;
    span.style.transform =
      e.type === 'mouseleave'
        ? ''
        : 'translate(' + ((x / w) * move * 2 - move) + 'px,' + ((y / h) * move * 2 - move) + 'px)';
  };
  var interactiveEls = Array.from(
    document.querySelectorAll('a, button, .slide__img-wrap, .nav'),
  ).filter(
    (el) =>
      !el.closest('.dropdown-menu') &&
      !el.closest('.menu-btn') &&
      !el.closest('.menu-wrapper'),
  );
  interactiveEls.forEach(function (el) {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(3)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
    el.addEventListener('mousemove', animateit);
    el.addEventListener('mouseleave', animateit);
  });
})();

(function () {
  var menuLinks = document.querySelectorAll('.dropdown-menu > .link');
  var cursor = document.querySelector('.cursor');
  var menuToggle = document.getElementById('menu-toggle');
  if (!menuToggle || !cursor) return;
  var animateMenuLink = function (e) {
    var span = this.querySelector('span');
    if (!span) return;
    var x = e.offsetX, y = e.offsetY;
    var w = this.offsetWidth, h = this.offsetHeight;
    var move = 25;
    span.style.transform =
      e.type === 'mouseleave'
        ? ''
        : 'translate(' + ((x / w) * (move * 2) - move) + 'px, ' + ((y / h) * (move * 2) - move) + 'px)';
  };
  menuToggle.addEventListener('change', function () {
    document.body.classList.toggle('menu-open', this.checked);
    if (!this.checked) cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });
  menuLinks.forEach(function (link) {
    link.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(8)';
    });
    link.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    link.addEventListener('mousemove', animateMenuLink);
    link.addEventListener('mouseleave', animateMenuLink);
    link.addEventListener('click', function () {
      menuToggle.checked = false;
      document.body.classList.remove('menu-open');
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
})();

var currentPage = 0;
var totalPages = 3;
var wrapper = document.querySelector('.horizontal-wrapper');
var prevBtn = document.getElementById('introPrev');
var nextBtn = document.getElementById('introNext');
var introNewSection = document.getElementById('intro-new');

if (introNewSection) {
  ScrollTrigger.create({
    trigger: introNewSection,
    start: 'top 80%',
    end: 'bottom 20%',
    onEnter: () => introNewSection.classList.add('active'),
    onLeave: () => introNewSection.classList.remove('active'),
    onEnterBack: () => introNewSection.classList.add('active'),
    onLeaveBack: () => introNewSection.classList.remove('active'),
  });
}

var outAnimated = false;
var skillAnimated = false;

function triggerOutAnimation() {
  if (outAnimated) return;
  outAnimated = true;
  document.querySelectorAll('.out-box').forEach(function (box, i) {
    setTimeout(() => box.classList.add('revealed'), i * 200);
  });
  document.querySelectorAll('.out-item').forEach(function (item, i) {
    setTimeout(() => item.classList.add('revealed'), 400 + i * 120);
  });
  document.querySelectorAll('.badge').forEach(function (badge, i) {
    setTimeout(() => badge.classList.add('revealed'), 700 + i * 100);
  });
}

function triggerSkillAnimation() {
  if (skillAnimated) return;
  skillAnimated = true;
  var skillTitle = document.querySelector('.skill-title');
  if (skillTitle) {
    skillTitle.style.transition = 'opacity 0.6s ease,transform 0.6s ease';
    skillTitle.style.opacity = '1';
    skillTitle.style.transform = 'translateY(0)';
  }
  document.querySelectorAll('.skill-item').forEach(function (item, i) {
    setTimeout(() => item.classList.add('revealed'), 200 + i * 80);
  });
}

function updateNavigation() {
  var isFirst = currentPage === 0;
  var isLast = currentPage === totalPages - 1;

  prevBtn.style.setProperty('opacity', isFirst ? '0' : '1', 'important');
  prevBtn.style.setProperty('visibility', isFirst ? 'hidden' : 'visible', 'important');
  prevBtn.style.pointerEvents = isFirst ? 'none' : 'auto';

  nextBtn.classList.toggle('hint-float', isFirst);
  nextBtn.style.setProperty('opacity', isLast ? '0' : '1', 'important');
  nextBtn.style.setProperty('visibility', isLast ? 'hidden' : 'visible', 'important');
  nextBtn.style.pointerEvents = isLast ? 'none' : 'auto';

  wrapper.style.transform = 'translateX(' + -currentPage * 100 + 'vw)';
  setTimeout(function () {
    if (currentPage === 1) triggerOutAnimation();
    if (currentPage === 2) triggerSkillAnimation();
  }, 400);
}

prevBtn.addEventListener('click', function () {
  if (currentPage > 0) {
    currentPage--;
    updateNavigation();
  }
});
nextBtn.addEventListener('click', function () {
  if (currentPage < totalPages - 1) {
    currentPage++;
    updateNavigation();
  }
});

(function () {
  if (!wrapper) return;
  var startX = 0, startY = 0, isDragging = false;
  wrapper.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });
  wrapper.addEventListener('touchend', function (e) {
    if (!isDragging) return;
    isDragging = false;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && currentPage < totalPages - 1) {
      currentPage++;
      updateNavigation();
    }
    if (dx > 0 && currentPage > 0) {
      currentPage--;
      updateNavigation();
    }
  }, { passive: true });
})();

document.addEventListener('keydown', function (e) {
  if (!introNewSection || !introNewSection.classList.contains('active')) return;
  if (e.key === 'ArrowLeft' && currentPage > 0) {
    currentPage--;
    updateNavigation();
  }
  if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
    currentPage++;
    updateNavigation();
  }
});

updateNavigation();

document.querySelectorAll('#rotate_line line').forEach(function (line, i) {
  line.style.setProperty('--delay', i * 0.05 + 's');
});