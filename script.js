/* =========================================================
   IEEE IAS STUDENT BRANCH CHAPTER — JAVASCRIPT
   File: script.js
   Dependencies (loaded via CDN in index.html):
     • GSAP 3.12.5 + ScrollTrigger
     • Three.js r128
=========================================================

   TABLE OF CONTENTS
   1. Loading Screen
   2. Custom Cursor
   3. Scroll Progress Bar
   4. Navbar Scroll Effect
   5. Mobile Navigation Toggle
   6. Three.js Hero Canvas (Particles + Torus)
   7. Animated Counter (Hero stats)
   8. GSAP Scroll Reveal Animations
   9. Countdown Timers
  10. Contact Form (frontend demo)
========================================================= */


/* =========================================================
   1. LOADING SCREEN
   Simulates a loading progress bar then fades out.
   initAnimations() is called once loading completes.
========================================================= */
const loaderMessages = [
  'INITIALIZING...',
  'LOADING ASSETS...',
  'CALIBRATING UI...',
  'ESTABLISHING LINK...',
  'SYSTEM READY',
];

let loadProgress = 0;
const loaderBar  = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');

const loaderInterval = setInterval(() => {
  loadProgress += Math.random() * 18 + 8;   // random increment per tick
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loaderInterval);
  }

  // Update bar width
  loaderBar.style.width = loadProgress + '%';

  // Update status text based on progress
  const msgIndex = Math.min(
    Math.floor(loadProgress / 22),
    loaderMessages.length - 1
  );
  loaderText.textContent = loaderMessages[msgIndex];

  // Once complete, fade out loader then start animations
  if (loadProgress >= 100) {
    setTimeout(() => {
      gsap.to('#loader', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          document.getElementById('loader').style.display = 'none';
          initAnimations();
        },
      });
    }, 300);
  }
}, 120);


/* =========================================================
   2. CUSTOM CURSOR
   The dot follows mouse exactly; the ring lags behind
   using linear interpolation (lerp) for smooth trailing.
========================================================= */
const cursorDot  = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;   // real mouse position
let ringX  = 0, ringY  = 0;   // lagged ring position

// Track real mouse position
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Animate cursor every frame
(function animateCursor() {
  // Dot snaps immediately
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';

  // Ring lerps toward mouse (0.12 = lag factor)
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';

  requestAnimationFrame(animateCursor);
})();


/* =========================================================
   3. SCROLL PROGRESS BAR
   Updates the width of #scroll-progress on scroll.
========================================================= */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total    = document.body.scrollHeight - window.innerHeight;
  const percent  = (scrolled / total) * 100;
  document.getElementById('scroll-progress').style.width = percent + '%';
});


/* =========================================================
   4. NAVBAR SCROLL EFFECT
   Adds the 'scrolled' class (glass blur + border) once
   the user has scrolled more than 50px.
========================================================= */
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});


/* =========================================================
   5. MOBILE NAVIGATION TOGGLE
   Toggles the 'open' class on the mobile drawer.
   Called via onclick in HTML.
========================================================= */
function toggleMobileNav() {
  document.getElementById('nav-mobile').classList.toggle('open');
}


/* =========================================================
   6. THREE.JS HERO CANVAS
   Creates:
     • A coloured particle cloud (1800 points)
     • Two wireframe torus rings
   All react subtly to mouse movement.
========================================================= */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Scene & Camera
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  /* ---------- PARTICLE SYSTEM ---------- */
  const PARTICLE_COUNT = 1800;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colours   = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Scatter particles in a 3D box
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

    // Mix: 50% neon-blue / 30% neon-purple / 20% neon-cyan
    const pick = Math.random();
    if (pick < 0.5) {
      // neon-blue  #00d4ff → (0, 0.83, 1)
      colours[i * 3] = 0; colours[i * 3 + 1] = 0.83; colours[i * 3 + 2] = 1;
    } else if (pick < 0.8) {
      // neon-purple  #b347ff → (0.7, 0.28, 1)
      colours[i * 3] = 0.7; colours[i * 3 + 1] = 0.28; colours[i * 3 + 2] = 1;
    } else {
      // neon-cyan  #00fff5 → (0, 1, 0.96)
      colours[i * 3] = 0; colours[i * 3 + 1] = 1; colours[i * 3 + 2] = 0.96;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colours,   3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
  });

  const particles = new THREE.Points(geo, particleMat);
  scene.add(particles);

  /* ---------- TORUS RING 1 (blue) ---------- */
  const torusGeo1 = new THREE.TorusGeometry(3.5, 0.015, 8, 120);
  const torusMat1 = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, transparent: true, opacity: 0.08, wireframe: true,
  });
  const torus1 = new THREE.Mesh(torusGeo1, torusMat1);
  torus1.rotation.x = Math.PI / 3;
  scene.add(torus1);

  /* ---------- TORUS RING 2 (purple) ---------- */
  const torusGeo2 = new THREE.TorusGeometry(5, 0.01, 8, 160);
  const torusMat2 = new THREE.MeshBasicMaterial({
    color: 0xb347ff, transparent: true, opacity: 0.05, wireframe: true,
  });
  const torus2 = new THREE.Mesh(torusGeo2, torusMat2);
  torus2.rotation.x = Math.PI / 4;
  torus2.rotation.y = Math.PI / 6;
  scene.add(torus2);

  /* ---------- MOUSE INFLUENCE ---------- */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ---------- RESIZE ---------- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- ANIMATION LOOP ---------- */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.003;

    // Slow rotation + subtle mouse tilt
    particles.rotation.y = t * 0.15 + mx * 0.3;
    particles.rotation.x = t * 0.05 + my * 0.2;
    torus1.rotation.z    = t * 0.2;
    torus2.rotation.z    = -t * 0.1;
    torus2.rotation.x    = t * 0.05;

    renderer.render(scene, camera);
  }

  animate();
}

// Initialise Three.js (wrapped in try/catch so the rest of
// the page still works if WebGL is not available)
try {
  initHeroCanvas();
} catch (err) {
  console.warn('Three.js hero canvas could not initialise:', err);
}


/* =========================================================
   7. ANIMATED COUNTER
   Counts up from 0 to data-count value.
   Called after the loader finishes.
========================================================= */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    let current  = 0;
    const step   = target / 60;   // ~60 ticks to reach target

    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      // Add '+' suffix for large round numbers
      el.textContent = Math.floor(current) + (target > 50 ? '+' : '');
    }, 24);
  });
}


/* =========================================================
   8. GSAP SCROLL REVEAL ANIMATIONS
   Called once the loading screen has faded out.
   • Hero elements animate in on load (staggered).
   • All .reveal elements in sections animate in on scroll.
   • Navbar links slide in on load.
========================================================= */
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  /* -- Hero entrance (staggered fade-up) -- */
  gsap.fromTo(
    '.hero-content .reveal',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2,
      onComplete: animateCounters,   // start counters after hero animates
    }
  );

  /* -- Section reveals (triggered on scroll) -- */
  gsap.utils.toArray('section .reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,           // only animate once
        },
      }
    );
  });

  /* -- Navbar links slide down on initial load -- */
  gsap.from('.nav-link', {
    opacity: 0, y: -12,
    stagger: 0.07,
    duration: 0.5,
    delay: 0.8,
    ease: 'power2.out',
  });
}


/* =========================================================
   9. COUNTDOWN TIMERS
   ─────────────────────────────────────────────────────────
   HOW TO UPDATE EVENT DATES:
   Change the date strings below to your real event dates.
   Format: 'YYYY-MM-DDTHH:MM:SS'
   The countdown IDs must match the <div id="countdownN">
   elements in index.html.
========================================================= */
const eventDate = new Date('2026-03-28T10:00:00');

function updateCountdown() {
  const now = new Date();
  const diff = eventDate - now;

  const el = document.getElementById("countdown1");

  if (!el) return;

  if (diff <= 0) {
    el.innerHTML = "🚀 Event Started!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  el.innerHTML =
    `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;


    el.innerHTML = `<b>${days}d : ${hours}h : ${minutes}m : ${seconds}s</b>`;
}


setInterval(updateCountdown, 1000);
updateCountdown();

const eventDate2 = new Date('2026-03-22T10:00:00');

function updateCountdown2() {
  const now = new Date();
  const diff = eventDate2 - now;

  const el = document.getElementById("countdown2");

  if (!el) return;

  if (diff <= 0) {
    el.innerHTML = "<b>🚀 Live Now!</b>";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  el.innerHTML =
    `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
}

setInterval(updateCountdown2, 1000);
updateCountdown2();



/**
 * Renders a live countdown inside the element with the
 * given id, counting down to the target Date object.
 */
function renderCountdown(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  function update() {
    const now  = new Date();
    const diff = target - now;

    if (diff <= 0) {
      el.innerHTML = `
        <span style="
          font-family:'JetBrains Mono',monospace;
          font-size:0.7rem;
          color:var(--neon-cyan);
          letter-spacing:2px
        ">EVENT IN PROGRESS / COMPLETED</span>`;
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    el.innerHTML = [
      ['DAYS', days],
      ['HRS',  hours],
      ['MIN',  minutes],
      ['SEC',  seconds],
    ]
      .map(
        ([label, value]) => `
          <div class="countdown-unit">
            <span class="countdown-num">${String(value).padStart(2, '0')}</span>
            <span class="countdown-label">${label}</span>
          </div>`
      )
      .join('');
  }

  update();                         // immediate render
  setInterval(update, 1000);        // refresh every second
}

// Start all countdown timers
Object.entries(eventDates).forEach(([id, date]) => renderCountdown(id, date));


/* =========================================================
  10. CONTACT FORM — FRONTEND DEMO
   Shows a success message after a 1.5s fake delay.
   To make this real: replace the setTimeout logic with
   a fetch() POST to your backend or a form service
   (Formspree, EmailJS, etc.).
========================================================= */
function handleFormSubmit(btn) {
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Sending...';

  setTimeout(() => {
    btn.style.display = 'none';
    document.getElementById('form-msg').style.display = 'block';
  }, 1500);
}
