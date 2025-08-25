      (() => {
        const root = document.getElementById('carousel');
        const track = document.getElementById('track');
        const slides = Array.from(track.children);
        const prevBtn = root.querySelector('[data-dir="prev"]');
        const nextBtn = root.querySelector('[data-dir="next"]');
        const indicatorBtns = Array.from(root.querySelectorAll('[data-slide-to]'));
        const counterEl = root.querySelector('[data-counter]');

        let index = 0;
        let timer = null;
        const AUTOPLAY_MS = 3000; // تغییر دهید اگر لازم است

        const rtl = document.documentElement.getAttribute('dir') === 'rtl';

        function updateCounter() {
          if (!counterEl) return;
          const faDigits = (n) => n.toString().replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);
          counterEl.textContent = `${faDigits(index + 1)} / ${faDigits(slides.length)}`;
        }

        function updateIndicators() {
          indicatorBtns.forEach((btn, i) => {
            const active = i === index;
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.classList.toggle('opacity-100', active);
            btn.classList.toggle('opacity-40', !active);
          });
          updateCounter();
        }

        function slideTo(i, { smooth = true } = {}) {
          index = (i + slides.length) % slides.length;
          const slide = slides[index];
          slide.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'center', block: 'nearest' });
          updateIndicators();
        }

        // Buttons
        prevBtn?.addEventListener('click', () => slideTo(index - 1));
        nextBtn?.addEventListener('click', () => slideTo(index + 1));

        // Indicators
        indicatorBtns.forEach((btn) => {
          btn.addEventListener('click', () => slideTo(parseInt(btn.dataset.slideTo, 10)));
        });

        // Keyboard navigation
        root.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowLeft') {
            // در RTL فلش چپ یعنی حرکت به اسلاید قبلی بصری (به راست)
            slideTo(index + (rtl ? 1 : -1));
          }
          if (e.key === 'ArrowRight') {
            slideTo(index + (rtl ? -1 : 1));
          }
        });

        // Sync active index while scrolling (drag/touch)
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
              const i = slides.indexOf(entry.target);
              if (i !== -1) {
                index = i;
                updateIndicators();
              }
            }
          });
        }, { root: track, threshold: [0.6] });
        slides.forEach((s) => io.observe(s));

        // Autoplay with pause-on-hover & page visibility
        function startAuto() {
          if (timer) return;
          timer = setInterval(() => slideTo(index + 1), AUTOPLAY_MS);
        }
        function stopAuto() {
          clearInterval(timer); timer = null;
        }
        root.addEventListener('mouseenter', stopAuto);
        root.addEventListener('mouseleave', startAuto);
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) stopAuto(); else startAuto();
        });

        // Init
        updateIndicators();
        startAuto();
      })();