/* ==========================================================================
   NURUL IMAN — CINEMATIC DIGITAL LOVE & APOLOGY STORY
   Inspired by Pixel2Prompt / Anniversary Website Architecture
   ========================================================================== */

// --- Global State ---
let currentStage = 1;
let flowerCount = 0;
let rejectEscapeCount = 0;
let isMusicPlaying = false;
let isPetalsActive = true;
let audioCtx = null;
let bgmInterval = null;

// Three.js Global Objects
let scene, camera, renderer;
let heartMesh, dustMesh, galaxyMesh, lanternsGroup;
let clock;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

// Compliments list for the Flower Toy
const compliments = [
  "Senyum Nurul itu selalu berhasil menenangkan duniaku yang bising 🌸",
  "Nurul Iman: Wanita paling anggun, cantik, dan memikat di mataku ✨",
  "Setiap detik menatap matamu, aku selalu jatuh cinta lagi dan lagi 💖",
  "Cantik parasnya, sejuk budi pekertinya, sempurna di hatiku 🌹",
  "Kamu adalah alasan kenapa hari-hariku terasa begitu istimewa 💐",
  "Bidadari yang selalu kurindukan setiap helaan napasku 🥰",
  "Tidak ada bunga di dunia ini yang sanggup menandingi keindahanmu 🌷",
  "Terima kasih sudah hadir dan mewarnai hidupku seindah ini 🌺"
];

// Evasive Pleading Dialogues for the Runaway Button
const escapeDialogues = [
  "Eits, meleset! Tombol ini lari terus lho 😜",
  "Jangan marah dong sayang, aku kangen senyum manismu 🥺",
  "Tombol ini alergi disentuh kalau belum dimaafin 🙈",
  "Ayo pencet tombol sebelah yang warna merah ❤️",
  "Nurul kan baik hati dan cantik banget sedunia 🌸",
  "Ampun bidadariku, aku janji bakal berubah! 🥹🙏",
  "Tangan kamu ga pegel ngejar tombol ini? Mending maafin aja 🥰",
  "Tombol ini sudah terkunci oleh rasa sayangku yang tak terbatas! ✨",
  "Nyerah kan? Tombol sebelah udah nungguin buat dipencet tuh! 🏃💨"
];

/* ==========================================================================
   1. PROCEDURAL WEB AUDIO SYNTHESIZER & SOUND EFFECTS
   ========================================================================== */
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, duration = 0.5, type = 'sine', gainVal = 0.15) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playSparkleSound() {
  if (!audioCtx) initAudio();
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.4, 'triangle', 0.09);
    }, idx * 60);
  });
}

function playBoingSound() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {}
}

function playCelebrationFanfare() {
  if (!audioCtx) initAudio();
  const melody = [
    { f: 523.25, d: 0.18 },
    { f: 659.25, d: 0.18 },
    { f: 783.99, d: 0.18 },
    { f: 1046.50, d: 0.5 },
    { f: 880.00, d: 0.2 },
    { f: 1046.50, d: 0.8 }
  ];
  let delay = 0;
  melody.forEach(item => {
    setTimeout(() => {
      playTone(item.f, item.d, 'triangle', 0.22);
    }, delay * 1000);
    delay += item.d * 0.85;
  });
}

function startProceduralBGM() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  stopProceduralBGM();

  // Romantic progression: Cmaj9 - Am9 - Fmaj7 - Gsus4
  const chords = [
    [261.63, 329.63, 392.00, 493.88],
    [220.00, 261.63, 329.63, 392.00],
    [174.61, 261.63, 329.63, 392.00],
    [196.00, 293.66, 392.00, 440.00]
  ];

  let chordIndex = 0;
  let noteInChord = 0;

  bgmInterval = setInterval(() => {
    if (!isMusicPlaying) return;
    const currentChord = chords[chordIndex];
    const freq = currentChord[noteInChord];

    playTone(freq * 1.5, 1.4, 'sine', 0.04);

    noteInChord++;
    if (noteInChord >= currentChord.length) {
      noteInChord = 0;
      chordIndex = (chordIndex + 1) % chords.length;
    }
  }, 450);
}

function stopProceduralBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

function toggleMusic() {
  initAudio();
  const bgMusic = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggleBtn');
  const label = document.getElementById('musicLabel');

  if (!isMusicPlaying) {
    const playPromise = bgMusic ? bgMusic.play() : undefined;
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isMusicPlaying = true;
          if (btn) btn.classList.add('playing');
          showToast('Memutar: Lana Del Rey 🎶');
        })
        .catch(() => {
          isMusicPlaying = true;
          startProceduralBGM();
          if (btn) btn.classList.add('playing');
          showToast('Melodi piano romantis diputar 🎶');
        });
    } else {
      isMusicPlaying = true;
      startProceduralBGM();
      if (btn) btn.classList.add('playing');
    }
  } else {
    isMusicPlaying = false;
    if (bgMusic) bgMusic.pause();
    stopProceduralBGM();
    if (btn) btn.classList.remove('playing');
    showToast('Musik dijeda');
  }
}

/* ==========================================================================
   2. THREE.JS CINEMATIC 3D ENGINE
   (Volumetric Particle Heart, Cosmic Dust, Galaxy Stars & Floating Lanterns)
   ========================================================================== */
let silkMesh;
let silkGeometry;

function initThree() {
  const container = document.getElementById('three-container');
  if (!container || typeof THREE === 'undefined') return;

  clock = new THREE.Clock();

  // Scene with warm luxury cream background & fog
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xfaf6f0, 0.035);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6;

  // Renderer with warm clear color
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xfaf6f0, 1);
  container.appendChild(renderer.domElement);

  // Warm Studio Lighting (Key Champagne Light + Soft Ambient)
  const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  dirLight.position.set(5, 8, 4);
  scene.add(dirLight);

  // 1. Build Interactive Liquid Silk Cloth Wave
  createLiquidSilkMesh();

  // 2. Build Volumetric 3D Particle Heart (Tuned for Cream Contrast)
  create3DParticleHeart();

  // 3. Build Floating Cosmic Pearl Dust
  createCosmicDust();

  // 4. Build Floating 3D Lanterns
  createFloatingLanterns();

  // Event Listeners
  window.addEventListener('resize', onThreeResize);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // 3D Interactive Envelope Parallax Tilt
  setupEnvelope3DTilt();

  // Stardust Touch & Cursor Trail
  setupStardustTrail();

  animateThree();
}

function createLiquidSilkMesh() {
  silkGeometry = new THREE.PlaneGeometry(32, 22, 50, 36);
  const silkMaterial = new THREE.MeshPhongMaterial({
    color: 0xf8f2e8,
    specular: 0xffffff,
    shininess: 90,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    flatShading: false
  });

  silkMesh = new THREE.Mesh(silkGeometry, silkMaterial);
  silkMesh.position.z = -3;
  silkMesh.rotation.x = -0.25;
  scene.add(silkMesh);
}

function create3DParticleHeart() {
  const count = 3800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Color palette tuned for Cream background: Rich Velvet Ruby (#7a1532), Warm Rose Gold (#c44d6f), and Brilliant Gold (#d4af37)
  const colorGold = new THREE.Color('#d4af37');
  const colorRose = new THREE.Color('#c44d6f');
  const colorWine = new THREE.Color('#7a1532');

  for (let i = 0; i < count; i++) {
    // Mathematical Parametric Heart Formula (same formula as reference repo)
    const t = Math.random() * Math.PI * 2;
    let x = 16 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    // Volumetric fill
    const fill = Math.pow(Math.random(), 0.55);
    x *= fill;
    y *= fill;
    const scale = 0.085;
    const thickness = (1 - fill) * 1.2 + 0.15;
    const z = (Math.random() - 0.5) * thickness * 2.5;

    positions[i * 3] = x * scale;
    positions[i * 3 + 1] = y * scale + 0.2;
    positions[i * 3 + 2] = z;

    // Mixed shimmering colors
    const lerpFactor = Math.random();
    const c = lerpFactor > 0.5 ? colorGold.clone().lerp(colorRose, Math.random()) : colorRose.clone().lerp(colorWine, Math.random());
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  heartMesh = new THREE.Points(geometry, material);
  scene.add(heartMesh);
}

function createCosmicDust() {
  const count = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const col = new THREE.Color('#d9b870');

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2;

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });

  dustMesh = new THREE.Points(geometry, material);
  scene.add(dustMesh);
}

function createFloatingLanterns() {
  lanternsGroup = new THREE.Group();
  const lanternCount = 28;

  for (let i = 0; i < lanternCount; i++) {
    const lantern = new THREE.Group();

    // Cylindrical glowing body
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.42, 10, 1, true);
    const bodyMat = new THREE.MeshBasicMaterial({
      color: 0xffa040,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    lantern.add(body);

    // Golden cap
    const capGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.08, 10);
    const capMat = new THREE.MeshBasicMaterial({ color: 0xd9b870 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.24;
    lantern.add(cap);

    // Initial random positions
    lantern.position.set(
      (Math.random() - 0.5) * 14,
      Math.random() * 18 - 8,
      (Math.random() - 0.5) * 8 - 2
    );

    lantern.userData = {
      speed: 0.4 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      baseY: lantern.position.y
    };

    lanternsGroup.add(lantern);
  }

  lanternsGroup.visible = false; // only visible in stage 5
  scene.add(lanternsGroup);
}

function onThreeResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(e) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(e) {
  if (e.touches.length > 0) {
    mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
  }
}

function animateThree() {
  requestAnimationFrame(animateThree);
  if (!clock || !renderer || !scene || !camera) return;

  const elapsedTime = clock.getElapsedTime();

  // Smooth mouse/touch tilt
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  // Undulate the 3D Liquid Silk Cloth Wave
  if (silkMesh && silkGeometry) {
    const pos = silkGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const wave = Math.sin(u * 0.35 + elapsedTime * 0.75 + targetX * 1.5) *
                   Math.cos(v * 0.35 + elapsedTime * 0.65 + targetY * 1.5) * 0.38;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    silkMesh.rotation.z = Math.sin(elapsedTime * 0.1) * 0.02;
  }

  // 3D Heart Rhythmic Beating & Rotation
  if (heartMesh) {
    const heartbeat = 1 + 0.05 * Math.sin(elapsedTime * 2.2);
    heartMesh.scale.set(heartbeat, heartbeat, heartbeat);
    heartMesh.rotation.y = elapsedTime * 0.12 + targetX * 0.3;
    heartMesh.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08 - targetY * 0.2;

    // Switch heart visibility based on stages
    if (currentStage === 1 || currentStage === 2) {
      heartMesh.visible = true;
    } else {
      heartMesh.visible = false;
    }
  }

  // Cosmic Dust Sway
  if (dustMesh) {
    dustMesh.rotation.y = elapsedTime * 0.04;
    dustMesh.rotation.x = elapsedTime * 0.02;
  }

  // Floating Lanterns (Active on Stage 5)
  if (lanternsGroup) {
    if (currentStage === 5) {
      lanternsGroup.visible = true;
      lanternsGroup.children.forEach(l => {
        l.position.y += l.userData.speed * 0.025;
        l.position.x += Math.sin(elapsedTime * 0.5 + l.userData.phase) * 0.008;
        l.rotation.y = Math.sin(elapsedTime * 0.3 + l.userData.phase) * 0.15;

        // Reset if floats too high
        if (l.position.y > 10) {
          l.position.y = -8;
          l.position.x = (Math.random() - 0.5) * 14;
        }
      });
    } else {
      lanternsGroup.visible = false;
    }
  }

  renderer.render(scene, camera);
}

/* ==========================================================================
   3. STAGE NAVIGATION LOGIC
   ========================================================================== */
function goToStage(step) {
  initAudio();
  playTone(440, 0.25, 'triangle', 0.08);

  // If leaving Stage 6 (Runaway Stage), reset runaway button's fixed position
  if (step !== 6) {
    const rejectBtn = document.getElementById('btnReject');
    if (rejectBtn) {
      rejectBtn.style.position = '';
      rejectBtn.style.left = '';
      rejectBtn.style.top = '';
      rejectBtn.style.zIndex = '';
    }
  }

  const stages = document.querySelectorAll('.luxury-stage, .cinema-stage');
  stages.forEach(st => st.classList.remove('active'));

  const targetStage = document.getElementById(`stage-${step}`);
  if (targetStage) {
    targetStage.classList.add('active');
    currentStage = step;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Special triggers per stage
  if (step === 3) {
    updateLoveStopwatch();
  } else if (step === 5) {
    setTimeout(initScratchCard, 200);
  } else if (step === 6) {
    setupRunawayButton();
  } else if (step === 7) {
    triggerCelebration();
  }
}

function resetToBeginning() {
  rejectEscapeCount = 0;
  const rejectBtn = document.getElementById('btnReject');
  if (rejectBtn) {
    rejectBtn.style.position = '';
    rejectBtn.style.transform = '';
    rejectBtn.style.left = '';
    rejectBtn.style.top = '';
    document.getElementById('rejectBtnText').textContent = 'Nggak, Masih Marah!';
  }
  const forgiveBtn = document.getElementById('btnForgive');
  if (forgiveBtn) {
    forgiveBtn.style.transform = '';
  }
  goToStage(1);
}

/* ==========================================================================
   4. STAGE 1: ENVELOPE INTERACTION
   ========================================================================== */
function openEnvelope() {
  try {
    initAudio();
    playSparkleSound();
  } catch (err) {}

  try {
    if (!isMusicPlaying) {
      toggleMusic();
    }
  } catch (err) {}

  const envelope = document.getElementById('envelopeToy');
  if (envelope) {
    envelope.classList.add('open');
  }

  setTimeout(() => {
    goToStage(2);
  }, 900);
}

/* ==========================================================================
   5. STAGE 3: FLOWER TOY & COMPLETE 34 PHOTOS GALLERY
   ========================================================================== */
const allPhotos = [
  { src: 'Assets/Foto/IMG_2175.JPG', caption: 'Senyuman Nurul yang Selalu Menyejukkan Hati 💖' },
  { src: 'Assets/Foto/IMG_2176.JPG', caption: 'Tatapan Anggun & Penuh Kasih ✨' },
  { src: 'Assets/Foto/IMG_2178.JPG', caption: 'Bidadariku Paling Cantik 🌹' },
  { src: 'Assets/Foto/IMG_2181.JPG', caption: 'Pesonamu yang Tiada Duanya 🌸' },
  { src: 'Assets/Foto/IMG_2183.JPG', caption: 'Cantik Sempurna Luar & Dalam 💍' },
  { src: 'Assets/Foto/IMG_6543.JPG', caption: 'Detik-Detik Berharga Berdua 🥰' },
  { src: 'Assets/Foto/IMG_6544.JPG', caption: 'Genggaman Tangan yang Menenangkan 🕊️' },
  { src: 'Assets/Foto/IMG_6545.JPG', caption: 'Saat Waktu Terasa Begitu Indah 💫' },
  { src: 'Assets/Foto/IMG_6553.JPG', caption: 'Senyum Manismu yang Bikin Candu 🌷' },
  { src: 'Assets/Foto/IMG_6671.JPG', caption: 'Paling Menawan di Segala Suasana ✨' },
  { src: 'Assets/Foto/IMG_6684.JPG', caption: 'Keanggunan yang Memikat Jiwa 👑' },
  { src: 'Assets/Foto/IMG_6689.JPG', caption: 'Menatap Masa Depan Bersamamu 💖' },
  { src: 'Assets/Foto/IMG_6697.JPG', caption: 'Bahagia Sederhana Namun Abadi 🌹' },
  { src: 'Assets/Foto/IMG_6749.JPG', caption: 'Tawa Lepas Penuh Kebahagiaan 🌸' },
  { src: 'Assets/Foto/IMG_6750.JPG', caption: 'Ceria yang Menghangatkan Hariku 🥰' },
  { src: 'Assets/Foto/IMG_6753.JPG', caption: 'Setiap Detik Bersamamu Sangat Berarti 💍' },
  { src: 'Assets/Foto/IMG_6755.JPG', caption: 'Kekasih Terbaik di Dunia 💐' },
  { src: 'Assets/Foto/IMG_7477.JPEG', caption: 'Momen Spesial yang Tak Terlupa 💖' },
  { src: 'Assets/Foto/IMG_7928.JPG', caption: 'Langkah Kita Bersama 🕊️' },
  { src: 'Assets/Foto/IMG_8604.JPG', caption: 'Keindahan yang Begitu Abadi ✨' },
  { src: 'Assets/Foto/IMG_0071.JPG', caption: 'Senyuman Manis yang Kurindukan 🌸' },
  { src: 'Assets/Foto/IMG_0404.JPG', caption: 'Kelembutan Jiwa & Parasmu 🌷' },
  { src: 'Assets/Foto/IMG_0529.JPG', caption: 'Mata Cantik yang Selalu Kucintai 🌹' },
  { src: 'Assets/Foto/IMG_2393.PNG', caption: 'Kenangan Manis yang Tersimpan Rapi 💖' },
  { src: 'Assets/Foto/IMG_4240.JPG', caption: 'Cahaya Indah di Setiap Hariku ✨' },
  { src: 'Assets/Foto/IMG_4241.JPG', caption: 'Senyum Teduh Penghapus Lelah 🥰' },
  { src: 'Assets/Foto/IMG_4242.JPG', caption: 'Paras Anggun Bidadari Hatiku 🌸' },
  { src: 'Assets/Foto/IMG_5992.JPG', caption: 'Selalu Mempesona di Setiap Sudut 💐' },
  { src: 'Assets/Foto/IMG_6772.JPG', caption: 'Hati yang Selalu Tertuju Padamu 💍' },
  { src: 'Assets/Foto/IMG_6951.JPG', caption: 'Manisnya Hari Bersamamu 💖' },
  { src: 'Assets/Foto/IMG_9169.JPG', caption: 'Wajah Cantik Kesayanganku 🌹' },
  { src: 'Assets/Foto/IMG_9171.JPG', caption: 'Tatapan Paling Tulus & Lembut 🕊️' },
  { src: 'Assets/Foto/IMG_9172.JPG', caption: 'Bidadari yang Selalu Kusayangi 🌸' },
  { src: 'Assets/Foto/IMG_9186.JPG', caption: 'Cinta Abadi untuk Nurul Iman 💖' }
];

let currentPhotoIndex = 0;
let isGridView = false;

function tapFlower() {
  initAudio();
  flowerCount++;
  playSparkleSound();

  const countDisplay = document.getElementById('flowerCount');
  countDisplay.textContent = flowerCount;
  countDisplay.style.transform = 'scale(1.3)';
  setTimeout(() => { countDisplay.style.transform = 'scale(1)'; }, 200);

  const complimentEl = document.getElementById('flowerCompliment');
  const randomIndex = Math.floor(Math.random() * compliments.length);
  complimentEl.style.opacity = '0';
  setTimeout(() => {
    complimentEl.textContent = `"${compliments[randomIndex]}"`;
    complimentEl.style.opacity = '1';
  }, 150);

  const btn = document.getElementById('tapFlowerBtn');
  const rect = btn.getBoundingClientRect();
  spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, ['🌸', '🌺', '🌹', '✨', '💖']);

  if (flowerCount === 10) {
    showToast('Hebat! 10 Bunga terindah terkumpul untuk Nurul 💐');
    triggerMiniConfetti();
  } else if (flowerCount === 25) {
    showToast('Luar biasa! 25 Bunga cinta mekar sempurna 🌸✨');
    triggerMiniConfetti();
  } else if (flowerCount === 50) {
    showToast('50 Bunga! Nurul Iman resmi jadi wanita terbahagia! 👑❤️');
    triggerMiniConfetti();
  }
}

function openPhotoModalIndex(index) {
  currentPhotoIndex = index;
  updateModalContent();
  initAudio();
  playTone(587.33, 0.2, 'sine', 0.09);
  const modal = document.getElementById('photoModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function openPhotoModal(imgSrc, caption) {
  const foundIndex = allPhotos.findIndex(p => p.src === imgSrc);
  if (foundIndex !== -1) {
    openPhotoModalIndex(foundIndex);
  } else {
    currentPhotoIndex = 0;
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    if (modalImg) modalImg.src = imgSrc;
    if (modalCaption) modalCaption.textContent = caption || 'Nurul Iman yang Menawan';
    const modal = document.getElementById('photoModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
}

function updateModalContent() {
  const photo = allPhotos[currentPhotoIndex];
  if (!photo) return;
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');
  const modalCounter = document.getElementById('modalCounter');

  if (modalImg) modalImg.src = photo.src;
  if (modalCaption) modalCaption.textContent = photo.caption;
  if (modalCounter) modalCounter.textContent = `${currentPhotoIndex + 1} / ${allPhotos.length}`;
}

function navigatePhoto(direction) {
  initAudio();
  playTone(659.25, 0.15, 'sine', 0.07);
  currentPhotoIndex = (currentPhotoIndex + direction + allPhotos.length) % allPhotos.length;
  updateModalContent();
}

function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function toggleGalleryView() {
  const row = document.getElementById('polaroidRow');
  const btnText = document.getElementById('galleryViewText');
  if (!row) return;
  isGridView = !isGridView;
  row.classList.toggle('grid-mode', isGridView);
  if (btnText) {
    btnText.textContent = isGridView ? 'Mode Slider Mendatar ↔️' : 'Tampilkan Mode Grid (34)';
  }
  showToast(isGridView ? 'Mode Grid Aktif: 34 Foto Nurul 📱' : 'Mode Slider Aktif 🌸');
}

/* ==========================================================================
   6. STAGE 4: THE RUNAWAY / IMPOSSIBLE "NGGAK MAU" BUTTON
   ========================================================================== */
function dodgeButton(e) {
  if (e) {
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch(err) {}
  }

  try {
    initAudio();
    playBoingSound();
  } catch(err) {}

  rejectEscapeCount++;

  const msgIndex = (rejectEscapeCount - 1) % escapeDialogues.length;
  const escapeMsgEl = document.getElementById('escapeMessage');
  if (escapeMsgEl) {
    escapeMsgEl.textContent = escapeDialogues[msgIndex];
  }

  const btnTextEl = document.getElementById('rejectBtnText');
  if (btnTextEl) {
    const shortLabels = [
      "Eits ga kena! 😝",
      "Jangan dong 🥺",
      "Tuh kan kabur 🙈",
      "Maafin yuk 🥰",
      "Ga bisa disentuh 😜",
      "Plisss sayang 🥹",
      "Lari lagi ah 🏃💨"
    ];
    btnTextEl.textContent = shortLabels[rejectEscapeCount % shortLabels.length];
  }

  const forgiveBtn = document.getElementById('btnForgive');
  if (forgiveBtn) {
    const newScale = Math.min(1.35, 1 + rejectEscapeCount * 0.05);
    forgiveBtn.style.transform = `scale(${newScale})`;
  }

  const rejectBtn = document.getElementById('btnReject');
  if (!rejectBtn) return;
  const btnRect = rejectBtn.getBoundingClientRect();
  const btnWidth = btnRect.width || 180;
  const btnHeight = btnRect.height || 50;

  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;

  const minX = 20;
  const maxX = Math.max(minX + 20, winWidth - btnWidth - 20);
  const minY = 80;
  const maxY = Math.max(minY + 20, winHeight - btnHeight - 40);

  const randomX = Math.floor(Math.random() * (maxX - minX)) + minX;
  const randomY = Math.floor(Math.random() * (maxY - minY)) + minY;

  rejectBtn.style.position = 'fixed';
  rejectBtn.style.left = `${randomX}px`;
  rejectBtn.style.top = `${randomY}px`;
  rejectBtn.style.zIndex = '9999';
  rejectBtn.style.transform = 'scale(0.95)';

  try {
    spawnParticleBurst(randomX + btnWidth / 2, randomY + btnHeight / 2, ['💨', '✨', '🙈']);
  } catch(err) {}

  setTimeout(() => {
    if (rejectBtn) rejectBtn.style.transform = 'scale(1)';
  }, 150);
}

function setupRunawayButton() {
  const rejectBtn = document.getElementById('btnReject');
  const forgiveBtn = document.getElementById('btnForgive');
  if (!rejectBtn) return;

  // Desktop events
  rejectBtn.onmouseenter = dodgeButton;
  rejectBtn.onmouseover = dodgeButton;

  // Mobile touch events: touchstart must be intercepted immediately
  rejectBtn.addEventListener('touchstart', dodgeButton, { passive: false });
  rejectBtn.addEventListener('pointerdown', dodgeButton, { passive: false });
  rejectBtn.onclick = dodgeButton;

  if (forgiveBtn) {
    forgiveBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      goToStage(7);
    };
  }
}

/* ==========================================================================
   7. STAGE 5: CELEBRATION, VOUCHERS & WHATSAPP
   ========================================================================== */
function triggerCelebration() {
  playCelebrationFanfare();

  if (typeof confetti === 'function') {
    const end = Date.now() + 4 * 1000;
    const colors = ['#d9b870', '#6b1731', '#f3e0b0', '#ffffff', '#e09f3e'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  const waBtn = document.getElementById('whatsappBtn') || document.querySelector('.luxury-whatsapp-cta');
  if (waBtn) {
    const message = encodeURIComponent(
      "Halo sayangku... ❤️\n\n" +
      "Aku udah buka dan baca semua isi website permintaan maafmu untuk Nurul Iman. Aku tersentuh banget dengan ketulusanmu dan aku udah maafin kamu 🥰\n\n" +
      "Tapi ingat janjimu ya: Prioritaskan waktu buat aku, kontrol emosimu, dan selalu berbicara dengan lembut! Sekarang giliran kamu tepatin janjimu dan traktir aku! 🌸💍"
    );
    waBtn.href = `https://api.whatsapp.com/send?phone=62822394349489&text=${message}`;
  }
}

function triggerMiniConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#d9b870', '#6b1731', '#f8bcc9']
    });
  }
}

function claimVoucher(cardEl, voucherName) {
  initAudio();
  playTone(880, 0.3, 'sine', 0.15);

  if (!cardEl.classList.contains('claimed')) {
    cardEl.classList.add('claimed');
    const btn = cardEl.querySelector('.ticket-claim-button, .v-claim-btn, .claim-btn');
    if (btn) btn.textContent = 'Terklaim! ✅';
    showToast(`Tiket "${voucherName}" tersimpan! Wajib kutepati ❤️`);
    triggerMiniConfetti();
  } else {
    showToast(`Voucher ini sudah aktif untuk Nurul Iman! 🎫`);
  }
}

/* ==========================================================================
   8. 2D FALLING PETALS CANVAS ENGINE
   ========================================================================== */
const canvas = document.getElementById('petalsCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let petals = [];
const TOTAL_PETALS = 30;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Petal {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * (canvas ? canvas.width : window.innerWidth);
    this.y = -20 - Math.random() * 50;
    this.size = 10 + Math.random() * 12;
    this.speedY = 1.2 + Math.random() * 1.8;
    this.speedX = Math.random() * 1.5 - 0.75;
    this.angle = Math.random() * 360;
    this.spin = (Math.random() - 0.5) * 2;
    this.sway = Math.random() * 2;
    this.swaySpeed = 0.02 + Math.random() * 0.02;
    this.opacity = 0.55 + Math.random() * 0.35;
    const colors = ['#f8bcc9', '#f3a8b9', '#ffd5de', '#d9b870', '#ffffff'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += Math.sin(this.sway) * 1.2 + this.speedX;
    this.sway += this.swaySpeed;
    this.angle += this.spin;

    if (canvas && (this.y > canvas.height + 30 || this.x < -30 || this.x > canvas.width + 30)) {
      this.reset();
    }
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, 0, this.size * 1.5);
    ctx.bezierCurveTo(-this.size, 0, -this.size / 2, -this.size / 2, 0, 0);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function initPetals() {
  if (!canvas) return;
  resizeCanvas();
  petals = [];
  for (let i = 0; i < TOTAL_PETALS; i++) {
    const p = new Petal();
    p.y = Math.random() * canvas.height;
    petals.push(p);
  }
}

function animatePetals() {
  if (canvas && ctx && isPetalsActive) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
  }
  requestAnimationFrame(animatePetals);
}

function spawnParticleBurst(x, y, symbols = ['🌸', '✨', '💖']) {
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = `${14 + Math.random() * 12}px`;
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transform = 'translate(-50%, -50%) scale(0.6)';
    el.style.opacity = '1';

    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 60;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 20;

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.15)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 850);
  }
}

/* ==========================================================================
   9. TOAST NOTIFICATION UTILITY
   ========================================================================== */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

/* ==========================================================================
   10. INITIALIZATION
   ========================================================================== */
function initApp() {
  try {
    initThree();
  } catch(e) {
    console.warn('Three.js warning:', e);
  }

  try {
    initPetals();
    animatePetals();
    window.addEventListener('resize', resizeCanvas);
  } catch(e) {
    console.warn('Petals warning:', e);
  }

  // Music toggle
  const musicBtn = document.getElementById('musicToggleBtn');
  if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }

  // Petals toggle
  const petalBtn = document.getElementById('petalToggleBtn');
  if (petalBtn) {
    petalBtn.addEventListener('click', () => {
      isPetalsActive = !isPetalsActive;
      petalBtn.classList.toggle('active', isPetalsActive);
      if (!isPetalsActive && ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      showToast(isPetalsActive ? 'Hujan bunga diaktifkan 🌸' : 'Hujan bunga dijeda');
    });
  }

  // Stepper buttons
  const stepIndicators = document.querySelectorAll('.step-btn');
  stepIndicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const step = parseInt(indicator.dataset.step, 10);
      goToStage(step);
    });
  });

  // Stage 1 Envelope elements
  const envelopeToy = document.getElementById('envelopeToy');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const openLetterBtn = document.getElementById('openLetterBtn');

  if (waxSealBtn) waxSealBtn.addEventListener('click', openEnvelope);
  if (envelopeToy) envelopeToy.addEventListener('click', openEnvelope);
  if (openLetterBtn) openLetterBtn.addEventListener('click', openEnvelope);

  // Stage 3 Flower Toy
  const tapFlowerBtn = document.getElementById('tapFlowerBtn');
  if (tapFlowerBtn) {
    tapFlowerBtn.addEventListener('click', tapFlower);
  }

  // Global interactive sparkle tap
  document.addEventListener('click', (e) => {
    if (!e.target.closest('button') && !e.target.closest('.parchment-item') && !e.target.closest('.polaroid-frame-card')) {
      spawnParticleBurst(e.clientX, e.clientY, ['🌸', '✨', '❤️']);
    }
  });

  // Stage 2 cards touch sound
  const confessionCards = document.querySelectorAll('.parchment-item, .confession-card');
  confessionCards.forEach(card => {
    card.addEventListener('click', () => {
      initAudio();
      playTone(523.25, 0.25, 'sine', 0.08);
      const rect = card.getBoundingClientRect();
      spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, ['💖', '🕊️', '✨']);
    });
  });

  // Keyboard navigation for photo modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePhotoModal();
    } else if (e.key === 'ArrowRight') {
      navigatePhoto(1);
    } else if (e.key === 'ArrowLeft') {
      navigatePhoto(-1);
    }
  });
}

// Immediate + DOMContentLoaded execution guard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}




/* ==========================================================================
   NEW FEATURES: LIVE LOVE STOPWATCH (SINCE MAY 5, 2023)
   ========================================================================== */
const loveStartDate = new Date(2023, 4, 5, 0, 0, 0); // May 5, 2023

function updateLoveStopwatch() {
  const now = new Date();
  const diffMs = Math.max(0, now - loveStartDate);

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const elDays = document.getElementById('swDays');
  const elHours = document.getElementById('swHours');
  const elMins = document.getElementById('swMins');
  const elSecs = document.getElementById('swSecs');
  const elTotalSeconds = document.getElementById('swTotalSeconds');
  const elTotalDays = document.getElementById('swTotalDays');

  if (elDays) elDays.textContent = days.toLocaleString('id-ID');
  if (elHours) elHours.textContent = String(hours).padStart(2, '0');
  if (elMins) elMins.textContent = String(minutes).padStart(2, '0');
  if (elSecs) elSecs.textContent = String(seconds).padStart(2, '0');
  if (elTotalSeconds) elTotalSeconds.textContent = totalSeconds.toLocaleString('id-ID');
  if (elTotalDays) elTotalDays.textContent = days.toLocaleString('id-ID');
}

// Start stopwatch interval immediately
setInterval(updateLoveStopwatch, 1000);
updateLoveStopwatch();

function sendHeartPulse() {
  initAudio();
  playTone(587.33, 0.4, 'sine', 0.18);
  setTimeout(() => playTone(880, 0.5, 'triangle', 0.15), 120);

  const btn = document.querySelector('.heartbeat-action-btn');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    spawnParticleBurst(rect.left + rect.width / 2, rect.top, ['💖', '💓', '✨', '🌹', '🥰']);
  } else {
    spawnParticleBurst(window.innerWidth / 2, window.innerHeight / 2, ['💖', '💓', '✨']);
  }

  showToast('Detak cinta terkirim ke Nurul Iman! 💓');
}

/* ==========================================================================
   NEW FEATURES: RUANG MAINAN CINTA (BAB V)
   1. LOVE METER SLIDER
   2. SCRATCH CARD AJAIB
   3. OFFICIAL CONTRACT SIGNING
   ========================================================================== */
const meterReactions = [
  { min: 0, max: 20, emoji: '😤', title: 'Masih Sebel & Cemberut', quote: 'Wajar banget sayang... Aku sadar aku salah. Ampuni aku yaa 🥺' },
  { min: 21, max: 40, emoji: '🥺', title: 'Mulai Luluh Dikit...', quote: 'Terima kasih sudah mau mendengarkan keluhanku sayang... Hatiku mulai tenang 🥰' },
  { min: 41, max: 65, emoji: '🥰', title: 'Udah Senyum Lagi Deh', quote: 'Senyum manis Nurul yang paling kurindukan akhirnya kembali bersinar! 💖' },
  { min: 66, max: 85, emoji: '😍', title: 'Sayang Banget Sama Kamu', quote: 'Bidadariku emang wanita paling baik, pemaaf, dan berhati mulia di dunia! 🌹' },
  { min: 86, max: 100, emoji: '💖', title: 'Cinta Abadi 1000% Tak Terhingga', quote: 'Nurul Iman adalah ratu terhebat di seluruh alam semesta! Kita bahagia selamanya! 👑✨' }
];

function updateLoveMeter(val) {
  const numVal = parseInt(val, 10);
  const match = meterReactions.find(r => numVal >= r.min && numVal <= r.max) || meterReactions[2];

  const elEmoji = document.getElementById('meterEmoji');
  const elTitle = document.getElementById('meterTitle');
  const elQuote = document.getElementById('meterQuote');
  const elBadge = document.getElementById('meterPercentBadge');

  if (elEmoji) elEmoji.textContent = match.emoji;
  if (elTitle) elTitle.textContent = match.title;
  if (elQuote) elQuote.textContent = `"${match.quote}"`;
  if (elBadge) {
    elBadge.textContent = numVal === 100 ? 'Skor: 1000% CINTA ABADI 💖' : `Skor Kasih Sayang: ${numVal}%`;
  }

  try {
    initAudio();
    playTone(300 + numVal * 4.5, 0.1, 'sine', 0.05);
  } catch(e) {}
}

/* 2. SCRATCH CARD LOGIC */
let scratchCanvasInitialized = false;
let isScratchedRevealed = false;

function initScratchCard() {
  const canvas = document.getElementById('scratchCanvas');
  if (!canvas || scratchCanvasInitialized) return;
  scratchCanvasInitialized = true;

  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width || 360;
  canvas.height = rect.height || 210;

  // Draw gold luxury foil
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#c99e32');
  grad.addColorStop(0.3, '#f5e4a8');
  grad.addColorStop(0.6, '#d4af37');
  grad.addColorStop(1, '#a67c1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  // Gold text instruction on foil
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#420816';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✨ GOSOK DENGAN JARI / KURSOR ✨', canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#5a0e24';
  ctx.fillText('Buka Pesan Rahasia Hatiku Untuk Nurul', canvas.width / 2, canvas.height / 2 + 14);

  let isDrawing = false;

  function scratch(x, y) {
    if (isScratchedRevealed) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2, false);
    ctx.fill();

    checkScratchPercentage();
  }

  function getPos(e) {
    const cRect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - cRect.left,
      y: clientY - cRect.top
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    initAudio();
    const p = getPos(e);
    scratch(p.x, p.y);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const p = getPos(e);
    scratch(p.x, p.y);
  });

  window.addEventListener('mouseup', () => { isDrawing = false; });

  canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    initAudio();
    const p = getPos(e);
    scratch(p.x, p.y);
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    const p = getPos(e);
    scratch(p.x, p.y);
  }, { passive: true });

  canvas.addEventListener('touchend', () => { isDrawing = false; });
}

function checkScratchPercentage() {
  if (isScratchedRevealed) return;
  const canvas = document.getElementById('scratchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentCount = 0;
    const totalPixels = imgData.data.length / 4;

    for (let i = 3; i < imgData.data.length; i += 16) {
      if (imgData.data[i] === 0) {
        transparentCount += 4;
      }
    }

    const percent = (transparentCount / totalPixels) * 100;
    if (percent > 38) {
      revealScratchNow();
    }
  } catch (err) {}
}

function revealScratchNow() {
  if (isScratchedRevealed) return;
  isScratchedRevealed = true;

  const canvas = document.getElementById('scratchCanvas');
  if (canvas) {
    canvas.style.transition = 'opacity 0.6s ease';
    canvas.style.opacity = '0';
    setTimeout(() => { canvas.style.display = 'none'; }, 600);
  }

  const tipText = document.getElementById('scratchTipText');
  if (tipText) {
    tipText.innerHTML = '🎉 <strong>Pesan Rahasia Terbuka Sempurna!</strong>';
    tipText.style.color = '#5a0e24';
  }

  initAudio();
  playSparkleSound();
  playCelebrationFanfare();

  if (typeof confetti === 'function') {
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
  }

  showToast('Surat rahasia berhasil dibuka! 💌');
}

/* 3. OFFICIAL CONTRACT SIGNING */
let isContractSigned = false;

function signContract() {
  if (isContractSigned) return;
  isContractSigned = true;

  initAudio();
  playCelebrationFanfare();

  const seal = document.getElementById('contractWaxStamp');
  const btn = document.getElementById('btnSignContract');

  if (seal) seal.classList.remove('hidden');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-check-double"></i> <span>Telah Disahkan & Disetujui 💖</span>';
    btn.style.background = 'linear-gradient(135deg, #1b7a42 0%, #2ecc71 100%)';
    btn.style.color = '#ffffff';
    btn.disabled = true;
  }

  const rect = btn ? btn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
  spawnParticleBurst(rect.left + 100, rect.top, ['📜', '✨', '💍', '💖', '👑']);

  showToast('Komitmen resmi berhasil disahkan! 📜✨');
}

/* ==========================================================================
   BAB VII: SURPRISE TREAT SPINNER
   ========================================================================== */
const romanticTreats = [
  { emoji: '🍰', name: 'Traktir Makanan Kesukaan Nurul Sepuasnya', note: '"Pilih tempat makan atau dessert favoritmu, hari ini aku yang bayar semuanya!"' },
  { emoji: '💆‍♀️', name: 'Voucher Pijat Bahu & Peluk Hangat Bebas Keluh', note: '"Siap memanjakan Nurul sampai lelah dan cemberutnya hilang 100%!"' },
  { emoji: '🛍️', name: 'Jalan Santai & Shopping Time Berdua', note: '"Keliling mall atau pasar malam berdua, bebas pilih jajan apa saja!"' },
  { emoji: '🚗', name: 'Night Drive Romantis Sambil Dengar Lagu Favorit', note: '"Keliling kota malam hari sambil cerita dan nikmati udara sejuk berdua!"' },
  { emoji: '💐', name: 'Buket Bunga Asli Datang ke Rumah Nurul', note: '"Bunga cantik khusus untuk bidadariku yang paling cantik di dunia!"' },
  { emoji: '👑', name: 'Nurut Seharian Penuh Tanpa Protes', note: '"Hari ini Nurul adalah Ratu! Apapun perintahmu akan langsung kulaksanakan!"' }
];

let lastTreatIndex = 0;

function spinSurpriseTreat() {
  initAudio();
  playSparkleSound();

  let nextIdx = Math.floor(Math.random() * romanticTreats.length);
  if (nextIdx === lastTreatIndex) {
    nextIdx = (nextIdx + 1) % romanticTreats.length;
  }
  lastTreatIndex = nextIdx;
  const treat = romanticTreats[nextIdx];

  const card = document.getElementById('treatResultCard');
  if (card) {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => { card.style.transform = 'scale(1)'; }, 150);
  }

  const elEmoji = document.getElementById('treatEmoji');
  const elName = document.getElementById('treatName');
  const elNote = document.getElementById('treatNote');

  if (elEmoji) elEmoji.textContent = treat.emoji;
  if (elName) elName.textContent = treat.name;
  if (elNote) elNote.textContent = treat.note;

  spawnParticleBurst(window.innerWidth / 2, window.innerHeight * 0.45, ['🎁', '✨', '💖']);
  showToast('Hadiah kejutan baru terbuka! 🎁');
}



// Expose all interactive functions to global window for seamless onclick support
window.openEnvelope = openEnvelope;
window.goToStage = goToStage;
window.resetToBeginning = resetToBeginning;
window.tapFlower = tapFlower;
window.toggleMusic = toggleMusic;
window.claimVoucher = claimVoucher;
window.dodgeButton = dodgeButton;
window.openPhotoModalIndex = openPhotoModalIndex;
window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;
window.navigatePhoto = navigatePhoto;
window.toggleGalleryView = toggleGalleryView;

// Newly added interactive features
window.sendHeartPulse = sendHeartPulse;
window.updateLoveMeter = updateLoveMeter;
window.initScratchCard = initScratchCard;
window.revealScratchNow = revealScratchNow;
window.signContract = signContract;
window.spinSurpriseTreat = spinSurpriseTreat;
window.updateLoveStopwatch = updateLoveStopwatch;



function playHeartWhisper() {
  initAudio();
  playTone(523.25, 0.4, 'sine', 0.15);
  setTimeout(() => playTone(659.25, 0.5, 'triangle', 0.12), 150);
  setTimeout(() => playTone(783.99, 0.6, 'sine', 0.15), 300);

  const quote = document.getElementById('whisperQuote');
  if (quote) {
    quote.style.transform = 'scale(1.03)';
    quote.style.color = '#741632';
    setTimeout(() => {
      quote.style.transform = 'scale(1)';
      quote.style.color = '#38111d';
    }, 400);
  }

  spawnParticleBurst(window.innerWidth / 2, window.innerHeight * 0.4, ['🕊️', '💖', '✨', '🌸']);
  showToast('Bisikan hati tersampaikan: "Aku sungguh mencintaimu, Nurul" 💖');
}

function toggleGalleryView() {
  const board = document.getElementById('polaroidBoard') || document.getElementById('polaroidRow');
  const btnText = document.getElementById('galleryViewModeText') || document.getElementById('galleryViewText');
  if (!board) return;

  isGridView = !isGridView;
  board.classList.toggle('showcase-mode', isGridView);
  
  if (btnText) {
    btnText.textContent = isGridView ? 'Ubah Tampilan: Grid Rapi' : 'Ubah Tampilan: Album Geser';
  }

  initAudio();
  playTone(587.33, 0.15, 'triangle', 0.08);
  showToast(isGridView ? 'Tampilan: Album Geser (Carousel) 📸' : 'Tampilan: Grid Rapi 📸');
}

window.playHeartWhisper = playHeartWhisper;
window.toggleGalleryView = toggleGalleryView;
