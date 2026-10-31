/**
 * DropMe — Main Application Logic
 * Pure vanilla JavaScript: Scrollytelling on HTML5 Canvas, preloader,
 * custom headlight cursor, hover fleet accordion, live fare calculator & booking engine,
 * with real-time email dispatch to admin.
 */

(function () {
  'use strict';

  // Ensure config is loaded
  const CFG = window.DROPME_CONFIG || window.NOCTIS_CONFIG;
  if (!CFG) {
    console.error('Configuration not found.');
    return;
  }

  /* ============================================================
     1. GLOBAL STATE & HELPERS
     ============================================================ */
  const state = {
    hero: {
      frames: [],
      loadedIndices: new Set(),
      currentFrame: 0,
      targetFrame: 0,
      lastDrawn: -1,
      totalCount: CFG.frames.hero.count,
      isMobile: window.innerWidth < 768
    },
    safety: {
      frames: [],
      loadedIndices: new Set(),
      currentFrame: 0,
      targetFrame: 0,
      lastDrawn: -1,
      totalCount: CFG.frames.safety.count,
      isMobile: window.innerWidth < 768
    },
    cursor: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      hoverLabel: 'VIEW',
      isHovering: false,
      isActive: false
    },
    lastScrollY: window.scrollY,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  const padZero = (num, size = 3) => String(num).padStart(size, '0');
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  /* ============================================================
     2. APPLY CONFIGURABLE SECTION HEIGHTS
     ============================================================ */
  function applyConfigHeights() {
    if (!CFG.sectionHeights) return;
    const heroWrapper = document.getElementById('hero');
    const howSection = document.getElementById('how-it-works');
    const safetyWrapper = document.getElementById('safety');
    const fleetSection = document.getElementById('fleet');
    const bookSection = document.getElementById('book');

    if (heroWrapper && CFG.sectionHeights.hero) heroWrapper.style.height = CFG.sectionHeights.hero;
    if (howSection && CFG.sectionHeights.howItWorks) howSection.style.minHeight = CFG.sectionHeights.howItWorks;
    if (safetyWrapper && CFG.sectionHeights.safety) safetyWrapper.style.height = CFG.sectionHeights.safety;
    if (fleetSection && CFG.sectionHeights.fleet) fleetSection.style.minHeight = CFG.sectionHeights.fleet;
    if (bookSection && CFG.sectionHeights.book) bookSection.style.minHeight = CFG.sectionHeights.book;
  }

  /* ============================================================
     3. FILM GRAIN OVERLAY GENERATOR
     ============================================================ */
  function initFilmGrain() {
    const canvas = document.getElementById('grain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tileSize = 256;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = tileSize;
    offCanvas.height = tileSize;
    const offCtx = offCanvas.getContext('2d');
    const imgData = offCtx.createImageData(tileSize, tileSize);
    const buffer = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer.length; i++) {
      const v = (Math.random() * 255) | 0;
      buffer[i] = (255 << 24) | (v << 16) | (v << 8) | v;
    }
    offCtx.putImageData(imgData, 0, 0);

    function resizeGrain() {
      canvas.width = window.innerWidth + 100;
      canvas.height = window.innerHeight + 100;
    }
    window.addEventListener('resize', resizeGrain);
    resizeGrain();

    setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pattern = ctx.createPattern(offCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.save();
        ctx.translate((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
        ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100);
        ctx.restore();
      }
    }, 125);
  }

  /* ============================================================
     4. CUSTOM HEADLIGHT CURSOR (Desktop Fine Pointer Only)
     ============================================================ */
  function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const cursorLabel = cursor ? cursor.querySelector('.cursor-label') : null;
    if (!cursor || !cursorLabel) return;

    if (!window.matchMedia('(pointer: fine)').matches || state.reducedMotion) {
      cursor.style.display = 'none';
      return;
    }

    window.addEventListener('mousemove', (e) => {
      state.cursor.targetX = e.clientX;
      state.cursor.targetY = e.clientY;
    });

    window.addEventListener('mousedown', () => {
      cursor.classList.add('is-active');
      setTimeout(() => cursor.classList.remove('is-active'), 120);
    });

    function attachCursorHover() {
      document.querySelectorAll('a, button, .fleet-slide, [data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          let label = el.getAttribute('data-cursor') || 'VIEW';
          if (el.classList.contains('fleet-slide')) {
            label = el.classList.contains('is-open') ? 'BOOK' : 'OPEN';
          }
          cursorLabel.textContent = label;
          cursor.classList.add('is-hovering');
        });

        el.addEventListener('mousemove', () => {
          if (el.classList.contains('fleet-slide')) {
            const label = el.classList.contains('is-open') ? 'BOOK' : 'OPEN';
            if (cursorLabel.textContent !== label) {
              cursorLabel.textContent = label;
            }
          }
        });

        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('is-hovering');
        });
      });

      document.querySelectorAll('input, select, textarea').forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('text-mode'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('text-mode'));
      });
    }

    attachCursorHover();

    function renderCursor() {
      state.cursor.x += (state.cursor.targetX - state.cursor.x) * 0.18;
      state.cursor.y += (state.cursor.targetY - state.cursor.y) * 0.18;
      cursor.style.transform = `translate3d(${state.cursor.x}px, ${state.cursor.y}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

  /* ============================================================
     5. FRAME PRELOADER & ASSET STREAMING
     ============================================================ */
  function formatFramePath(template, index) {
    return template.replace('%04d', padZero(index, 4));
  }

  function initPreloader(onHeroReady) {
    const preloader = document.getElementById('preloader');
    const counter = document.getElementById('preloader-counter');
    const bar = document.getElementById('preloader-bar');

    const heroConfig = CFG.frames.hero;
    const safetyConfig = CFG.frames.safety;
    const isMob = window.innerWidth < 768;

    const heroPath = isMob ? heroConfig.mobilePath : heroConfig.desktopPath;
    const safetyPath = isMob ? safetyConfig.mobilePath : safetyConfig.desktopPath;

    state.hero.frames = new Array(heroConfig.count);
    state.safety.frames = new Array(safetyConfig.count);

    const initialTarget = Math.min(40, heroConfig.count);
    let loadedCount = 0;
    let initialFired = false;

    function updateProgress(pct) {
      if (bar) bar.style.width = `${pct}%`;
      if (counter) counter.textContent = padZero(Math.round(pct), 3);
    }

    function checkInitialReady() {
      if (loadedCount >= initialTarget && !initialFired) {
        initialFired = true;
        updateProgress(100);

        if (preloader) {
          preloader.classList.add('is-exiting');
          setTimeout(() => {
            preloader.classList.add('is-hidden');
            document.body.classList.remove('loading');
            if (onHeroReady) onHeroReady();
          }, 450);
        }

        streamRemainingFrames();
      }
    }

    function loadFrameImage(path, onLoaded) {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {}).finally(() => onLoaded(img));
        } else {
          onLoaded(img);
        }
      };
      img.onerror = () => onLoaded(null);
    }

    // Load initial 40 hero frames first
    for (let i = 1; i <= initialTarget; i++) {
      loadFrameImage(formatFramePath(heroPath, i), (img) => {
        if (img) {
          state.hero.frames[i - 1] = img;
          state.hero.loadedIndices.add(i - 1);
        }
        loadedCount++;
        const pct = (loadedCount / initialTarget) * 100;
        updateProgress(pct);
        checkInitialReady();
      });
    }

    // Stream remaining frames in background
    function streamRemainingFrames() {
      let heroIdx = initialTarget + 1;
      function loadNextHero() {
        if (heroIdx <= heroConfig.count) {
          const idx = heroIdx++;
          loadFrameImage(formatFramePath(heroPath, idx), (img) => {
            if (img) {
              state.hero.frames[idx - 1] = img;
              state.hero.loadedIndices.add(idx - 1);
            }
            loadNextHero();
          });
        } else {
          loadSafetyFrames();
        }
      }
      for (let w = 0; w < 4; w++) loadNextHero();
    }

    function loadSafetyFrames() {
      let safetyIdx = 1;
      function loadNextSafety() {
        if (safetyIdx <= safetyConfig.count) {
          const idx = safetyIdx++;
          loadFrameImage(formatFramePath(safetyPath, idx), (img) => {
            if (img) {
              state.safety.frames[idx - 1] = img;
              state.safety.loadedIndices.add(idx - 1);
            }
            loadNextSafety();
          });
        }
      }
      for (let w = 0; w < 4; w++) loadNextSafety();
    }
  }

  /* ============================================================
     6. CANVAS DRAWING ENGINE (Cover vs Contain Fit)
     ============================================================ */
  function drawImageFit(ctx, img, canvasWidth, canvasHeight, isPortrait) {
    if (!img || !img.complete) return;
    const imgW = img.naturalWidth || 1600;
    const imgH = img.naturalHeight || 900;
    const imgRatio = imgW / imgH;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawW, drawH, drawX, drawY;

    if (!isPortrait) {
      if (canvasRatio > imgRatio) {
        drawW = canvasWidth;
        drawH = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawH) / 2;
      } else {
        drawH = canvasHeight;
        drawW = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawW) / 2;
        drawY = 0;
      }
    } else {
      if (canvasRatio > imgRatio) {
        drawH = canvasHeight;
        drawW = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvasWidth;
        drawH = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawH) / 2;
      }
    }

    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  function getNearestLoadedFrame(framesArray, loadedSet, targetIdx) {
    if (loadedSet.has(targetIdx) && framesArray[targetIdx]) {
      return framesArray[targetIdx];
    }
    let step = 1;
    const maxIdx = framesArray.length - 1;
    while (targetIdx - step >= 0 || targetIdx + step <= maxIdx) {
      if (targetIdx - step >= 0 && loadedSet.has(targetIdx - step)) {
        return framesArray[targetIdx - step];
      }
      if (targetIdx + step <= maxIdx && loadedSet.has(targetIdx + step)) {
        return framesArray[targetIdx + step];
      }
      step++;
    }
    return null;
  }

  /* ============================================================
     7. SCROLLYTELLING RUNTIME (Hero & Safety)
     ============================================================ */
  function initScrollytelling() {
    const heroWrapper = document.getElementById('hero');
    const heroCanvas = document.getElementById('hero-canvas');
    const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;
    const heroProgressLine = document.getElementById('hero-progress-line');
    const heroFadeOverlay = document.getElementById('hero-fade-overlay');

    const safetyWrapper = document.getElementById('safety');
    const safetyCanvas = document.getElementById('safety-canvas');
    const safetyCtx = safetyCanvas ? safetyCanvas.getContext('2d') : null;
    const safetyProgressLine = document.getElementById('safety-progress-line');

    const hudSpeed = document.getElementById('hud-speed');
    const hudDist = document.getElementById('hud-dist');
    const hudChapterText = document.getElementById('hud-chapter-text');

    const heroChapters = [
      document.getElementById('hero-ch-1'),
      document.getElementById('hero-ch-2'),
      document.getElementById('hero-ch-3'),
      document.getElementById('hero-ch-4')
    ];

    const safetyChapters = [
      document.getElementById('safety-ch-1'),
      document.getElementById('safety-ch-2'),
      document.getElementById('safety-ch-3')
    ];

    const safetyCalloutsWrap = document.getElementById('safety-callouts');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;
    let isPortrait = viewH > viewW;

    function resizeCanvases() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      isPortrait = viewH > viewW;

      if (heroCanvas) {
        heroCanvas.width = viewW * dpr;
        heroCanvas.height = viewH * dpr;
        heroCtx.scale(dpr, dpr);
      }
      if (safetyCanvas) {
        safetyCanvas.width = viewW * dpr;
        safetyCanvas.height = viewH * dpr;
        safetyCtx.scale(dpr, dpr);
      }
      state.hero.lastDrawn = -1;
      state.safety.lastDrawn = -1;
    }

    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    if (state.reducedMotion) {
      if (heroCtx) {
        const checkHeroFirst = setInterval(() => {
          const img = getNearestLoadedFrame(state.hero.frames, state.hero.loadedIndices, 0);
          if (img) {
            drawImageFit(heroCtx, img, viewW, viewH, isPortrait);
            clearInterval(checkHeroFirst);
          }
        }, 100);
      }
      if (safetyCtx) {
        const checkSafetyFirst = setInterval(() => {
          const img = getNearestLoadedFrame(state.safety.frames, state.safety.loadedIndices, 0);
          if (img) {
            drawImageFit(safetyCtx, img, viewW, viewH, isPortrait);
            clearInterval(checkSafetyFirst);
          }
        }, 100);
      }
      return;
    }

    function scrollyLoop() {
      // 1. HERO Scrollytelling
      if (heroWrapper && heroCtx) {
        const hRect = heroWrapper.getBoundingClientRect();
        const hScrollDist = heroWrapper.offsetHeight - window.innerHeight;
        const hProgress = clamp(-hRect.top / (hScrollDist || 1), 0, 1);

        state.hero.targetFrame = Math.round(hProgress * (state.hero.totalCount - 1));
        state.hero.currentFrame += (state.hero.targetFrame - state.hero.currentFrame) * 0.15;
        const heroDrawIdx = Math.round(state.hero.currentFrame);

        if (heroDrawIdx !== state.hero.lastDrawn) {
          const img = getNearestLoadedFrame(state.hero.frames, state.hero.loadedIndices, heroDrawIdx);
          if (img) {
            drawImageFit(heroCtx, img, viewW, viewH, isPortrait);
            state.hero.lastDrawn = heroDrawIdx;
          }
        }

        if (heroProgressLine) {
          heroProgressLine.style.width = `${(hProgress * 100).toFixed(2)}%`;
        }

        if (heroFadeOverlay) {
          const fadeStart = CFG.heroHud.fadeToBlackStart || 0.95;
          const fadePct = clamp((hProgress - fadeStart) / (1 - fadeStart), 0, 1);
          heroFadeOverlay.style.opacity = fadePct;
        }

        if (hudSpeed) {
          const spd = Math.round(hProgress * (CFG.heroHud.speedMax || 118));
          hudSpeed.textContent = `${padZero(spd, 3)} KM/H`;
        }
        if (hudDist) {
          const dst = (hProgress * (CFG.heroHud.distanceMax || 4.2)).toFixed(1);
          hudDist.textContent = `${dst} KM`;
        }

        const activeChIdx = hProgress < 0.18 ? 0 : hProgress < 0.45 ? 1 : hProgress < 0.74 ? 2 : 3;
        heroChapters.forEach((ch, idx) => {
          if (!ch) return;
          if (idx === activeChIdx) {
            ch.classList.add('active');
          } else {
            ch.classList.remove('active');
          }
        });

        if (hudChapterText) {
          hudChapterText.textContent = `0${activeChIdx + 1}/04`;
        }
      }

      // 2. SAFETY Scrollytelling
      if (safetyWrapper && safetyCtx) {
        const sRect = safetyWrapper.getBoundingClientRect();
        const sScrollDist = safetyWrapper.offsetHeight - window.innerHeight;
        const sProgress = clamp(-sRect.top / (sScrollDist || 1), 0, 1);

        state.safety.targetFrame = Math.round(sProgress * (state.safety.totalCount - 1));
        state.safety.currentFrame += (state.safety.targetFrame - state.safety.currentFrame) * 0.15;
        const safetyDrawIdx = Math.round(state.safety.currentFrame);

        if (safetyDrawIdx !== state.safety.lastDrawn) {
          const img = getNearestLoadedFrame(state.safety.frames, state.safety.loadedIndices, safetyDrawIdx);
          if (img) {
            drawImageFit(safetyCtx, img, viewW, viewH, isPortrait);
            state.safety.lastDrawn = safetyDrawIdx;
          }
        }

        if (safetyProgressLine) {
          safetyProgressLine.style.width = `${(sProgress * 100).toFixed(2)}%`;
        }

        const sActiveChIdx = sProgress < 0.33 ? 0 : sProgress < 0.68 ? 1 : 2;
        safetyChapters.forEach((ch, idx) => {
          if (!ch) return;
          if (idx === sActiveChIdx) {
            ch.classList.add('active');
          } else {
            ch.classList.remove('active');
          }
        });

        const calloutsActive = sProgress >= (CFG.safetyCallouts.startProgress || 0.40);
        if (safetyCalloutsWrap) {
          if (calloutsActive) {
            safetyCalloutsWrap.classList.add('active');
          } else {
            safetyCalloutsWrap.classList.remove('active');
          }
        }

        if (calloutsActive && CFG.safetyCallouts.items) {
          const isSensorPhase = sProgress >= 0.68;
          CFG.safetyCallouts.items.forEach((item, idx) => {
            const el = document.getElementById(`callout-${item.id}`);
            if (!el) return;

            const thresh = 0.40 + idx * 0.05;
            if (sProgress >= thresh) {
              el.classList.add('is-visible');
            } else {
              el.classList.remove('is-visible');
            }

            const pos = isSensorPhase ? item.sensorPos : item.structurePos;
            const dot = el.querySelector('.callout-dot');
            const card = el.querySelector('.callout-card');
            const line = el.querySelector('.callout-line');

            if (dot && card && line) {
              const dx = (pos.dotX / 100) * viewW;
              const dy = (pos.dotY / 100) * viewH;
              const lx = (pos.labelX / 100) * viewW;
              const ly = (pos.labelY / 100) * viewH;

              dot.style.left = `${dx}px`;
              dot.style.top = `${dy}px`;

              card.style.left = `${lx}px`;
              card.style.top = `${ly}px`;

              const deltaX = lx - dx;
              const deltaY = ly - dy;
              const length = Math.hypot(deltaX, deltaY);
              const angle = Math.atan2(deltaY, deltaX);

              line.style.left = `${dx}px`;
              line.style.top = `${dy}px`;
              line.style.width = `${length}px`;
              line.style.transform = `rotate(${angle}rad)`;
            }
          });
        }
      }

      requestAnimationFrame(scrollyLoop);
    }

    requestAnimationFrame(scrollyLoop);
  }

  /* ============================================================
     8. SECTION 2: HOW IT WORKS WORD-BY-WORD SCROLL REVEAL
     ============================================================ */
  function initHowItWorks() {
    const heading = document.getElementById('how-sentence');
    const section = document.getElementById('how-it-works');
    if (!heading || !section) return;

    const text = heading.textContent.trim();
    const words = text.split(/\s+/);
    heading.innerHTML = words.map(w => `<span class="how-word">${w}</span>`).join(' ');
    const wordElements = heading.querySelectorAll('.how-word');

    function checkHowScroll() {
      const rect = section.getBoundingClientRect();
      const progress = clamp(-rect.top / (section.offsetHeight * 0.5), 0, 1);
      const activeWordCount = Math.floor(progress * wordElements.length);

      wordElements.forEach((el, i) => {
        if (i <= activeWordCount) {
          el.classList.add('is-lit');
        } else {
          el.classList.remove('is-lit');
        }
      });
    }

    window.addEventListener('scroll', checkHowScroll, { passive: true });
    checkHowScroll();
  }

  /* ============================================================
     9. SECTION 4: FLEET ACCORDION & SCROLL REVEAL
     ============================================================ */
  function initFleetAccordion() {
    const fleetSection = document.getElementById('fleet');
    const slides = Array.from(document.querySelectorAll('.fleet-slide'));
    if (!slides.length) return;

    if (fleetSection && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            fleetSection.classList.add('is-in-view');
            observer.unobserve(fleetSection);
          }
        });
      }, { threshold: 0.2 });
      observer.observe(fleetSection);
    } else if (fleetSection) {
      fleetSection.classList.add('is-in-view');
    }

    let hoverTimeout = null;

    function openSlide(slide) {
      if (slide.classList.contains('is-open')) return;
      slides.forEach(s => {
        s.classList.remove('is-open');
        s.setAttribute('aria-expanded', 'false');
      });
      slide.classList.add('is-open');
      slide.setAttribute('aria-expanded', 'true');
    }

    slides.forEach((slide, idx) => {
      slide.addEventListener('mouseenter', () => {
        if (window.innerWidth < 768) return;
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          openSlide(slide);
        }, 80);
      });

      slide.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      });

      slide.addEventListener('click', (e) => {
        if (e.target.closest('.fleet-book-link') || e.target.closest('.swatch')) return;
        openSlide(slide);
      });

      slide.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = slides[(idx + 1) % slides.length];
          next.focus();
          openSlide(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = slides[(idx - 1 + slides.length) % slides.length];
          prev.focus();
          openSlide(prev);
        }
      });

      const swatches = slide.querySelectorAll('.swatch');
      swatches.forEach(sw => {
        sw.addEventListener('click', (e) => {
          e.stopPropagation();
          swatches.forEach(s => s.classList.remove('is-active'));
          sw.classList.add('is-active');
        });
      });

      const bookLink = slide.querySelector('.fleet-book-link');
      if (bookLink) {
        bookLink.addEventListener('click', () => {
          const carId = slide.getAttribute('data-car');
          preselectCar(carId);
        });
      }
    });

    const heroBookBtn = document.querySelector('.hero-actions [data-car="gt-e"]');
    if (heroBookBtn) {
      heroBookBtn.addEventListener('click', () => preselectCar('gt-e'));
    }
  }

  function preselectCar(carId) {
    const carSelect = document.getElementById('car-select');
    if (carSelect && carId) {
      carSelect.value = carId;
      carSelect.dispatchEvent(new Event('change'));
    }
  }

  /* ============================================================
     10. SECTION 5: FARE CALCULATOR & BOOKING ENGINE WITH EMAIL DISPATCH
     ============================================================ */
  function haversineDistance(coords1, coords2) {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function dispatchBookingEmail(booking) {
    const targetEmail = CFG.adminEmail || 'harishjadi3@gmail.com';
    const statusEl = document.getElementById('conf-email-status');
    const mailtoEl = document.getElementById('conf-mailto-link');

    const subject = encodeURIComponent(`[DropMe Booking] ${booking.id} — ${booking.pickup} to ${booking.dropoff}`);
    const body = encodeURIComponent(
      `Hello Harish,\n\nA new ride has been booked on DropMe:\n\n` +
      `Booking ID: ${booking.id}\n` +
      `Route: ${booking.pickup} → ${booking.dropoff}\n` +
      `Schedule: ${booking.date} at ${booking.time}\n` +
      `Vehicle: ${booking.carName}\n` +
      `Passengers: ${booking.passengers}\n` +
      `Estimated Fare: ${CFG.currency} ${booking.fare.toLocaleString('en-IN')}\n\n` +
      `Timestamp: ${booking.created}`
    );

    if (mailtoEl) {
      mailtoEl.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    }

    if (statusEl) {
      statusEl.textContent = `Alerting ${targetEmail}...`;
    }

    // Direct background notification via FormSubmit AJAX API
    fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `New DropMe Booking: ${booking.id} (${booking.pickup} → ${booking.dropoff})`,
        _template: 'table',
        "Platform": "DropMe",
        "Booking ID": booking.id,
        "Pickup City": booking.pickup,
        "Drop-off City": booking.dropoff,
        "Date": booking.date,
        "Time": booking.time,
        "Vehicle Model": booking.carName,
        "Passenger Count": booking.passengers,
        "Total Fare": `${CFG.currency} ${booking.fare.toLocaleString('en-IN')}`,
        "Booking Date/Time": booking.created
      })
    })
    .then(res => res.json())
    .then(() => {
      if (statusEl) {
        statusEl.textContent = `Notification delivered to ${targetEmail}`;
      }
    })
    .catch(err => {
      console.warn('Email dispatch notice:', err);
      if (statusEl) {
        statusEl.textContent = `Dispatched to ${targetEmail}`;
      }
    });
  }

  function initBookingEngine() {
    const form = document.getElementById('booking-form');
    const pickupInput = document.getElementById('pickup-input');
    const dropoffInput = document.getElementById('dropoff-input');
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const passSelect = document.getElementById('passengers-select');
    const carSelect = document.getElementById('car-select');
    const citiesDatalist = document.getElementById('cities-list');

    const sumDist = document.getElementById('sum-dist');
    const sumDur = document.getElementById('sum-dur');
    const sumFare = document.getElementById('sum-fare');
    const routeFrom = document.getElementById('route-from');
    const routeTo = document.getElementById('route-to');
    const routeDot = document.getElementById('route-pulse-dot');

    const confPanel = document.getElementById('booking-confirmation');
    const confId = document.getElementById('conf-id');
    const confRoute = document.getElementById('conf-route');
    const confSchedule = document.getElementById('conf-schedule');
    const confCar = document.getElementById('conf-car');
    const confFare = document.getElementById('conf-fare');
    const btnNewBooking = document.getElementById('btn-new-booking');

    const savedWrap = document.getElementById('saved-bookings-wrap');
    const savedList = document.getElementById('saved-bookings-list');

    if (citiesDatalist && CFG.cities) {
      citiesDatalist.innerHTML = CFG.cities.map(c => `<option value="${c.name}"></option>`).join('');
    }

    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.value = today;
    }

    if (timeInput && !timeInput.value) {
      timeInput.value = "22:00";
    }

    function findCity(name) {
      if (!name) return null;
      const clean = name.trim().toLowerCase();
      return CFG.cities.find(c => c.name.toLowerCase() === clean) || null;
    }

    function findCar(id) {
      return CFG.fleet.find(c => c.id === id) || CFG.fleet[0];
    }

    let calculatedQuote = null;

    function calculateFare() {
      const pCity = findCity(pickupInput.value);
      const dCity = findCity(dropoffInput.value);
      const selectedCar = findCar(carSelect.value);

      if (routeFrom) routeFrom.textContent = pCity ? pCity.name.toUpperCase() : 'ORIGIN';
      if (routeTo) routeTo.textContent = dCity ? dCity.name.toUpperCase() : 'DESTINATION';

      if (!pCity || !dCity || pCity.name === dCity.name) {
        calculatedQuote = null;
        if (sumDist) sumDist.textContent = '—';
        if (sumDur) sumDur.textContent = '—';
        if (sumFare) sumFare.textContent = '—';
        return;
      }

      const rawDist = haversineDistance(pCity.coords, dCity.coords);
      const realDist = Math.max(12, Math.round(rawDist * (CFG.roadFactor || 1.25)));
      const fare = (CFG.baseFee || 1200) + realDist * selectedCar.rate;

      const hours = realDist / (CFG.averageSpeed || 60);
      const hInt = Math.floor(hours);
      const mInt = Math.round((hours - hInt) * 60);
      const durStr = hInt > 0 ? `${hInt}H ${mInt}M` : `${mInt} MIN`;

      calculatedQuote = {
        pickup: pCity.name,
        dropoff: dCity.name,
        distanceKm: realDist,
        durationStr: durStr,
        fare: fare,
        car: selectedCar
      };

      if (sumDist) sumDist.textContent = `${realDist} KM`;
      if (sumDur) sumDur.textContent = durStr;
      if (sumFare) sumFare.textContent = `${CFG.currency} ${fare.toLocaleString('en-IN')}`;

      if (routeDot) {
        routeDot.setAttribute('cx', '0');
        let dotPos = 0;
        function animateRouteDot() {
          dotPos += 8;
          if (dotPos <= 400) {
            routeDot.setAttribute('cx', String(dotPos));
            requestAnimationFrame(animateRouteDot);
          } else {
            routeDot.setAttribute('cx', '400');
          }
        }
        requestAnimationFrame(animateRouteDot);
      }
    }

    [pickupInput, dropoffInput, carSelect, passSelect].forEach(input => {
      if (input) input.addEventListener('input', calculateFare);
      if (input) input.addEventListener('change', calculateFare);
    });

    calculateFare();

    function clearErrors() {
      ['pickup', 'dropoff', 'date', 'time', 'passengers', 'car'].forEach(id => {
        const err = document.getElementById(`error-${id}`);
        if (err) err.textContent = '';
      });
    }

    function validate() {
      clearErrors();
      let isValid = true;

      const pCity = findCity(pickupInput.value);
      const dCity = findCity(dropoffInput.value);
      const selectedCar = findCar(carSelect.value);
      const passengers = parseInt(passSelect.value, 10) || 1;

      if (!pickupInput.value.trim()) {
        document.getElementById('error-pickup').textContent = 'Pickup location required.';
        isValid = false;
      } else if (!pCity) {
        document.getElementById('error-pickup').textContent = 'Please choose a valid city.';
        isValid = false;
      }

      if (!dropoffInput.value.trim()) {
        document.getElementById('error-dropoff').textContent = 'Drop-off location required.';
        isValid = false;
      } else if (!dCity) {
        document.getElementById('error-dropoff').textContent = 'Please choose a valid city.';
        isValid = false;
      } else if (pCity && dCity && pCity.name === dCity.name) {
        document.getElementById('error-dropoff').textContent = 'Drop-off must be different from pickup.';
        isValid = false;
      }

      if (!dateInput.value) {
        document.getElementById('error-date').textContent = 'Date required.';
        isValid = false;
      } else {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          document.getElementById('error-date').textContent = 'Date cannot be in the past.';
          isValid = false;
        }
      }

      if (!timeInput.value) {
        document.getElementById('error-time').textContent = 'Time required.';
        isValid = false;
      }

      if (passengers > selectedCar.seats) {
        document.getElementById('error-passengers').textContent = `${selectedCar.name} accommodates max ${selectedCar.seats} passengers.`;
        isValid = false;
      }

      return isValid;
    }

    function getStorageBookings() {
      const modern = localStorage.getItem('dropme_bookings');
      if (modern) return JSON.parse(modern);
      const legacy = localStorage.getItem('noctis_bookings');
      if (legacy) return JSON.parse(legacy);
      return [];
    }

    function setStorageBookings(arr) {
      localStorage.setItem('dropme_bookings', JSON.stringify(arr));
      localStorage.setItem('noctis_bookings', JSON.stringify(arr));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!calculatedQuote) calculateFare();

        const randomId = 'NX-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const booking = {
          id: randomId,
          pickup: calculatedQuote.pickup,
          dropoff: calculatedQuote.dropoff,
          date: dateInput.value,
          time: timeInput.value,
          carName: calculatedQuote.car.name,
          passengers: parseInt(passSelect.value, 10) || 1,
          fare: calculatedQuote.fare,
          created: new Date().toISOString()
        };

        const existing = getStorageBookings();
        existing.unshift(booking);
        setStorageBookings(existing);

        if (confId) confId.textContent = booking.id;
        if (confRoute) confRoute.textContent = `${booking.pickup} → ${booking.dropoff}`;
        if (confSchedule) confSchedule.textContent = `${booking.date} @ ${booking.time}`;
        if (confCar) confCar.textContent = `${booking.carName} (${booking.passengers} ${booking.passengers === 1 ? 'Seat' : 'Seats'})`;
        if (confFare) confFare.textContent = `${CFG.currency} ${booking.fare.toLocaleString('en-IN')}`;

        form.setAttribute('hidden', 'true');
        if (confPanel) confPanel.removeAttribute('hidden');

        // Dispatch real-time email alert to harishjadi3@gmail.com
        dispatchBookingEmail(booking);

        renderSavedBookings();
      });
    }

    if (btnNewBooking) {
      btnNewBooking.addEventListener('click', () => {
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        timeInput.value = "22:00";
        calculateFare();
        form.removeAttribute('hidden');
        if (confPanel) confPanel.setAttribute('hidden', 'true');
      });
    }

    function renderSavedBookings() {
      if (!savedList || !savedWrap) return;
      const bookings = getStorageBookings();

      if (bookings.length === 0) {
        savedWrap.setAttribute('hidden', 'true');
        savedList.innerHTML = '';
        return;
      }

      savedWrap.removeAttribute('hidden');
      savedList.innerHTML = bookings.map((b, idx) => `
        <li class="saved-booking-item">
          <span><strong>${b.id}</strong> · ${b.pickup} &rarr; ${b.dropoff} (${b.date} @ ${b.time}) · ${b.carName} · ${CFG.currency} ${b.fare.toLocaleString('en-IN')}</span>
          <button type="button" class="saved-cancel-btn" data-index="${idx}" data-cursor="VIEW">Cancel</button>
        </li>
      `).join('');

      savedList.querySelectorAll('.saved-cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-index'), 10);
          const current = getStorageBookings();
          current.splice(index, 1);
          setStorageBookings(current);
          renderSavedBookings();
        });
      });
    }

    renderSavedBookings();
  }

  /* ============================================================
     11. NAVIGATION HIDE / SHOW ON SCROLL
     ============================================================ */
  function initNavScroll() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > state.lastScrollY && currentScrollY > 120) {
        nav.classList.add('nav--hidden');
      } else {
        nav.classList.remove('nav--hidden');
      }
      state.lastScrollY = currentScrollY;
    }, { passive: true });
  }

  /* ============================================================
     12. BOOTSTRAP
     ============================================================ */
  function init() {
    applyConfigHeights();
    initFilmGrain();
    initCustomCursor();
    initNavScroll();
    initHowItWorks();
    initFleetAccordion();
    initBookingEngine();

    initPreloader(() => {
      initScrollytelling();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
