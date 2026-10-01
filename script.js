/* ==========================================================================
   JAVASCRIPT XỬ LÝ TƯƠNG TÁC THIỆP MỜI TỐT NGHIỆP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Các phần tử DOM chính
  const cardStage = document.getElementById('cardStage');
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('waxSeal');
  const envelopeHint = document.getElementById('envelopeHint');
  const closeLetterBtn = document.getElementById('closeLetterBtn');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const toastMessage = document.getElementById('toastMessage');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');

  let isOpen = false;

  // ========================================================================
  // 1. HIỆU ỨNG MỞ & ĐÓNG PHONG BÌ
  // ========================================================================

  function openEnvelope() {
    if (isOpen) return;
    isOpen = true;

    // Kích hoạt class hoạt họa mở thư
    cardStage.classList.add('is-open');
    if (envelopeHint) envelopeHint.classList.add('fade-out');

    // Bắn pháo hoa giấy mừng tốt nghiệp
    triggerConfetti();

    // Phát tiếng chuông chime chúc mừng du dương
    playCelebrationChime();

    // Tự động phát nhạc nền mặc định
    startBackgroundMusic();
  }

  function closeEnvelope(e) {
    if (e) e.stopPropagation();
    if (!isOpen) return;
    isOpen = false;

    // Đóng nắp phong bì và hạ lá thư về vị trí ban đầu
    cardStage.classList.remove('is-open');
    if (envelopeHint) envelopeHint.classList.remove('fade-out');

    // Cuộn nhẹ lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Gắn sự kiện click mở thư
  const envBadge = document.getElementById('envBadge');
  if (envelope) envelope.addEventListener('click', openEnvelope);
  if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
  if (envBadge) envBadge.addEventListener('click', openEnvelope);

  // Gắn sự kiện click đóng thư
  if (closeLetterBtn) closeLetterBtn.addEventListener('click', closeEnvelope);

  // ========================================================================
  // 2. SAO CHÉP ĐỊA CHỈ & HIỂN THỊ TOAST
  // ========================================================================

  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const addressText = "Hội trường, tầng 2 tòa 14 tầng - Học viện Kỹ thuật Mật mã, 141 Chiến Thắng, Tân Triều, Thanh Trì, Hà Nội";

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addressText).then(() => {
          showToast("Đã sao chép địa chỉ thành công! 📍");
        }).catch(() => {
          fallbackCopyText(addressText);
        });
      } else {
        fallbackCopyText(addressText);
      }
    });
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("Đã sao chép địa chỉ thành công! 📍");
    } catch (err) {
      showToast("Địa chỉ: 141 Chiến Thắng, Hà Nội");
    }
    document.body.removeChild(textArea);
  }

  let toastTimeout;
  function showToast(message) {
    if (!toastMessage) return;
    toastMessage.textContent = message;
    toastMessage.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastMessage.classList.remove('show');
    }, 2800);
  }

  // ========================================================================
  // 3. ÂM NHẠC & TIẾNG CHIME CHÚC MỪNG (Web Audio API - Tự tạo âm thanh du dương)
  // ========================================================================

  let audioCtx = null;
  let isPlayingMusic = false;
  let musicInterval = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Chime chúc mừng khi mở thư (Đô - Mi - Sol - Đô)
  function playCelebrationChime() {
    try {
      initAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
    } catch (e) {
      console.warn("Audio chime skipped:", e);
    }
  }

  // Giai điệu nhẹ nhàng chúc mừng tốt nghiệp
  const melodyNotes = [
    261.63, 329.63, 392.00, 523.25, 
    293.66, 349.23, 440.00, 587.33, 
    329.63, 392.00, 493.88, 659.25, 
    349.23, 440.00, 523.25, 698.46, 
    392.00, 493.88, 587.33, 783.99, 
    523.25, 659.25, 783.99, 1046.50 
  ];

  let currentMelodyStep = 0;

  function playNextMelodyNote() {
    if (!isPlayingMusic || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const freq = melodyNotes[currentMelodyStep % melodyNotes.length];
      currentMelodyStep++;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.6);
    } catch (err) {
      console.warn("Music step error:", err);
    }
  }

  // Bật phát nhạc nền mặc định
  function startBackgroundMusic() {
    if (isPlayingMusic) return;
    initAudioContext();
    isPlayingMusic = true;
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = setInterval(playNextMelodyNote, 430);
  }

  // Khởi động nhạc ngay khi có tương tác đầu tiên của người dùng
  const autoPlayOnGesture = () => {
    startBackgroundMusic();
    document.removeEventListener('click', autoPlayOnGesture);
    document.removeEventListener('touchstart', autoPlayOnGesture);
  };
  document.addEventListener('click', autoPlayOnGesture);
  document.addEventListener('touchstart', autoPlayOnGesture);

  // Thử phát ngay khi tải trang (trường hợp trình duyệt cho phép)
  try {
    startBackgroundMusic();
  } catch (e) {
    // Sẽ được kích hoạt bởi autoPlayOnGesture
  }

  // ========================================================================
  // 4. HIỆU ỨNG PHÁO HOA GIẤY (CANVAS CONFETTI CELEBRATION)
  // ========================================================================

  let confettiCtx = null;
  let particles = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const confettiColors = [
    '#f5be47', '#e58e26', '#eb3b5a', '#fa8231', 
    '#20bf6b', '#0fb9b1', '#45aaf2', '#a55eea', '#ffffff'
  ];

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 9 + 6;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 6;
      
      this.gravity = 0.28;
      this.friction = 0.96;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.opacity = 1;
      this.decay = Math.random() * 0.008 + 0.006;
      this.isStar = Math.random() > 0.65;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.decay;
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.isStar) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size, -Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
          ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2));
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.65);
      }

      ctx.restore();
    }
  }

  function triggerConfetti() {
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');
    resizeCanvas();

    const rect = envelope ? envelope.getBoundingClientRect() : null;
    const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    for (let i = 0; i < 120; i++) {
      particles.push(new ConfettiParticle(originX, originY));
    }

    if (!confettiAnimId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(confettiCtx);

      if (p.opacity <= 0 || p.y > confettiCanvas.height + 50) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
    }
  }
});
