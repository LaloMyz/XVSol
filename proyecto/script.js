/**
 * Invitación XV Años - Clase principal
 * Maneja el carousel, audio y efectos visuales
 * ✅ Modificado para carrusel infinito real con clones de extremos
 */
class XVInvitation {
  constructor() {
    // Propiedades del carousel
    this.currentIndex = 0;
    this.slides = document.querySelectorAll('.slide');
    this.carousel = document.getElementById('carousel');
    
    // Clonar slides en extremos
    this.cloneEdgeSlides();

    // Volver a capturar slides (ahora incluyen clones)
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    
    // Empezar en el primer slide real (índice 1)
    this.currentIndex = 1;
    this.updateCarousel(false);
    
    // Propiedades del audio
    this.audio = document.getElementById('bg-music');
    this.audioControl = document.getElementById('audioControl');
    this.isPlaying = false;
    
    // Propiedades del autoplay
    this.autoPlayInterval = null;
    this.autoPlayDelay = 10000;
    
    // Propiedades de navegación
    this.indicators = null;
    
    // Inicializar
    this.init();
  }

  /**
   * Clonar primer y último slide en extremos
   */
  cloneEdgeSlides() {
    const first = this.slides[0].cloneNode(true);
    const last = this.slides[this.slides.length - 1].cloneNode(true);
    this.carousel.appendChild(first);
    this.carousel.insertBefore(last, this.slides[0]);
  }

  /**
   * Inicialización principal
   */
  init() {
    this.createIndicators();
    this.setupEventListeners();
    this.preloadImages();
    this.createParticles();
    this.setupAudio();
    this.startAutoPlay();

    // Marcar activo real
    this.slides[this.currentIndex].classList.add('active');

    console.log('XV Invitation initialized successfully');
  }

  /**
   * Crear indicadores de navegación
   */
  createIndicators() {
    const indicatorsContainer = document.getElementById('indicators');
    indicatorsContainer.innerHTML = '';

    // Solo para slides reales (excluye clones)
    for (let i = 0; i < this.totalSlides - 2; i++) {
      const indicator = document.createElement('div');
      indicator.className = 'indicator';
      if (i === 0) indicator.classList.add('active');
      indicator.addEventListener('click', () => this.goToRealSlide(i));
      indicatorsContainer.appendChild(indicator);
    }
    
    this.indicators = document.querySelectorAll('.indicator');
  }

  /**
   * Ir a slide real específico
   */
  goToRealSlide(realIndex) {
    this.currentIndex = realIndex + 1; // +1 porque está desplazado por el clon al inicio
    this.updateCarousel();
  }

  /**
   * Configurar listeners
   */
  setupEventListeners() {
    document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());
    document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());

    this.setupTouchEvents();
    this.setupKeyboardEvents();
    this.setupMouseEvents();

    this.carousel.addEventListener('transitionend', () => this.handleEdgeClones());
  }

  /**
   * Saltar invisible si estamos en clon
   */
  handleEdgeClones() {
    if (this.currentIndex === 0) {
      this.currentIndex = this.totalSlides - 2; // último real
      this.updateCarousel(false);
    } else if (this.currentIndex === this.totalSlides - 1) {
      this.currentIndex = 1; // primero real
      this.updateCarousel(false);
    }
  }

  /**
   * Eventos táctiles
   */
  setupTouchEvents() {
    let startX = 0;
    let startY = 0;

    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      this.pauseAutoPlay();
    });

    this.carousel.addEventListener('touchmove', (e) => {
      const diffX = Math.abs(e.touches[0].clientX - startX);
      const diffY = Math.abs(e.touches[0].clientY - startY);
      if (diffX > diffY) e.preventDefault();
    });

    this.carousel.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      const threshold = 50;
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) this.nextSlide();
        else this.prevSlide();
      }
      this.startAutoPlay();
    });
  }

  /**
   * Eventos de teclado
   */
  setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.prevSlide();
          break;
        case ' ':
          e.preventDefault();
          this.toggleAudio();
          break;
        case 'Escape':
          this.pauseAutoPlay();
          break;
      }
    });
  }

  /**
   * Mouse enter/leave pausa autoplay
   */
  setupMouseEvents() {
    this.carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
    this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  /**
   * Precargar imágenes
   */
  preloadImages() {
    this.slides.forEach((slide) => {
      const img = slide.querySelector('img');
      const imgSrc = slide.dataset.img;
      if (imgSrc) {
        const tempImg = new Image();
        tempImg.onload = () => {
          img.src = imgSrc;
          img.style.display = 'block';
          slide.classList.remove('loading');
        };
        tempImg.onerror = () => {
          slide.innerHTML = `<div class="error-message">
                               <p>❌ Error al cargar la imagen</p>
                               <small>${imgSrc}</small>
                             </div>`;
          slide.classList.remove('loading');
        };
        tempImg.src = imgSrc;
      }
    });
  }

  /**
   * Control de audio
   */
  setupAudio() {
    this.audioControl.addEventListener('click', () => this.toggleAudio());
    this.audio.addEventListener('canplaythrough', () => {
      console.log('Audio ready to play');
    });
    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this.audioControl.textContent = '❌';
    });
  }

  toggleAudio() {
    if (this.isPlaying) this.pauseAudio();
    else this.playAudio();
  }

  playAudio() {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.audioControl.textContent = '🔊';
        this.isPlaying = true;
      }).catch(() => {
        this.audioControl.textContent = '🔇';
        this.isPlaying = false;
      });
    }
  }

  pauseAudio() {
    this.audio.pause();
    this.audioControl.textContent = '🔇';
    this.isPlaying = false;
  }

  /**
   * Avanzar
   */
  nextSlide() {
    if (this.currentIndex >= this.totalSlides - 1) return;
    this.currentIndex++;
    this.updateCarousel();
  }

  /**
   * Retroceder
   */
  prevSlide() {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.updateCarousel();
  }

  /**
   * Actualizar vista
   */
  updateCarousel(animated = true) {
    if (!animated) {
      this.carousel.style.transition = 'none';
    } else {
      this.carousel.style.transition = 'transform 0.5s ease';
    }

    const offset = -this.currentIndex * 100;
    this.carousel.style.transform = `translateX(${offset}vw)`;

    // Actualizar clase active
    this.slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === this.currentIndex);
    });

    this.updateIndicators();
  }

  /**
   * Indicadores
   */
  updateIndicators() {
    if (!this.indicators) return;
    const realIndex = (this.currentIndex - 1 + this.totalSlides - 2) % (this.totalSlides - 2);
    this.indicators.forEach((indicator, idx) => {
      indicator.classList.toggle('active', idx === realIndex);
    });
  }

  /**
   * AutoPlay
   */
  startAutoPlay() {
    this.pauseAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * Partículas decorativas
   */
  createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 2;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  /**
   * Estado actual
   */
  getStatus() {
    return {
      currentSlide: this.currentIndex,
      totalSlides: this.totalSlides,
      isAudioPlaying: this.isPlaying,
      isAutoPlaying: this.autoPlayInterval !== null
    };
  }
}

/**
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing XV Invitation...');
  window.xvInvitation = new XVInvitation();
});

/**
 * Fallback para habilitar audio tras primer clic
 */
document.addEventListener('click', function initAudio() {
  const audio = document.getElementById('bg-music');
  if (audio && audio.paused) {
    audio.play().catch(() => {});
  }
  document.removeEventListener('click', initAudio);
}, { once: true });

/**
 * Error global
 */
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});
