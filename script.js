// Global Variables
let currentLanguage = 'ar';
let currentTheme = 'light';
let isMobileMenuOpen = false;

// Backend endpoint (change if your port/domain is different)
const API_URL = 'http://localhost:8000/api/sign/recognize';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupAnimations();
    setupScrollEffects();
    setupInteractiveElements();
    setupCounterAnimations();
    setupParticleEffects();
    setupTiltEffects();
    setupMouseEffects();
    setupHeroGlow();
});

// Initialize Application
function initializeApp() {
    // Set initial language
    updateTranslatableElements(currentLanguage);
    
    // Set initial theme
    document.body.setAttribute('data-theme', currentTheme);
    
    // Initialize header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);
    
    // Initialize smooth scrolling for navigation links
    setupSmoothScrolling();
    
    // Initialize intersection observer for animations
    setupIntersectionObserver();
    
    // Initialize background animations
    setupBackgroundAnimations();
    
    // Initialize speech synthesis
    initializeSpeechSynthesis();
    

}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle -> use sidebar, not legacy dropdown
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn && !mobileMenuBtn.hasAttribute('onclick')) {
        mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    }
    // Close sidebar when clicking overlay (avoid double-binding if inline handler exists)
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay && !sidebarOverlay.hasAttribute('onclick')) {
        sidebarOverlay.addEventListener('click', () => {
            if (isMobileMenuOpen) toggleMobileSidebar();
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMobileMenuOpen) {
                toggleMobileMenu();
            }
        });
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Mouse movement effects
    document.addEventListener('mousemove', handleMouseMovement);
    
    // Feature card interactions
    setupFeatureCardInteractions();
    
    // Button hover effects
    setupButtonEffects();
}

// Language Toggle
function toggleLanguage() {
    // Stop any ongoing speech
    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        const speakerBtn = document.getElementById('speakerBtn');
        const speakerIcon = document.getElementById('speakerIcon');
        if (speakerBtn) {
            speakerBtn.classList.remove('speaking');
        }
        if (speakerIcon) {
            speakerIcon.className = 'fas fa-volume-up';
        }
    }
    
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    
    // Update HTML attributes
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    
    // Update all translatable elements
    updateTranslatableElements(currentLanguage);
    
    // Update language toggle button
    const langToggle = document.querySelector('.language-toggle span');
    if (langToggle) {
        langToggle.textContent = currentLanguage === 'ar' ? 'English' : 'العربية';
    }
    
    // Update navigation links
    updateNavigationLinks();
    
    // Update team popup if it's open
    updateTeamPopupLanguage();
    
    // Add transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

// Update Translatable Elements
function updateTranslatableElements(language) {
    const translatableElements = document.querySelectorAll('[data-ar][data-en]');
    
    translatableElements.forEach(element => {
        const text = language === 'ar' ? element.getAttribute('data-ar') : element.getAttribute('data-en');
        if (text) {
            element.textContent = text;
        }
    });

    // Update placeholders
    const inputs = document.querySelectorAll('input[data-ar-placeholder][data-en-placeholder]');
    inputs.forEach(input => {
        const placeholder = language === 'ar' ? input.getAttribute('data-ar-placeholder') : input.getAttribute('data-en-placeholder');
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
}

// Update Navigation Links
function updateNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    const linkTexts = {
        ar: ['الرئيسية', 'المميزات', 'حول', 'اتصل بنا'],
        en: ['Home', 'Features', 'About', 'Contact']
    };
    
    navLinks.forEach((link, index) => {
        const span = link.querySelector('span');
        if (span) {
            span.textContent = linkTexts[currentLanguage][index];
        }
    });
}

// Theme Toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Add transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

// Mobile Menu Toggle (Legacy - keeping for compatibility)
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    
    if (mobileBtn) {
        mobileBtn.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = mobileBtn.querySelectorAll('span');
        if (isMobileMenuOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
}

// Mobile Sidebar Toggle
function toggleMobileSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const navMenu = document.getElementById('navMenu');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
    
    if (overlay) {
        overlay.classList.toggle('active');
    }
    // Ensure legacy dropdown is always hidden when using sidebar
    if (navMenu) {
        navMenu.classList.remove('active');
    }
    
    if (mobileBtn) {
        mobileBtn.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = mobileBtn.querySelectorAll('span');
        if (isMobileMenuOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
    
    // Prevent body scroll when sidebar is open
    if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Text-to-Speech Variables
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isSpeaking = false;

// Text-to-Speech Toggle
function toggleSpeech() {
    const speakerBtn = document.getElementById('speakerBtn');
    const speakerIcon = document.getElementById('speakerIcon');
    const translationText = document.getElementById('translationText');
    
    if (!translationText || !translationText.textContent || translationText.textContent.trim() === '') {
        return;
    }
    
    if (isSpeaking) {
        // Stop speaking
        if (currentUtterance) {
            speechSynthesis.cancel();
        }
        isSpeaking = false;
        speakerBtn.classList.remove('speaking');
        speakerIcon.className = 'fas fa-volume-up';
    } else {
        // Start speaking
        const text = translationText.textContent.trim();
        
        // Create new utterance
        currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set language based on current language setting
        if (currentLanguage === 'ar') {
            currentUtterance.lang = 'ar-SA';
            currentUtterance.voice = getArabicVoice();
        } else {
            currentUtterance.lang = 'en-US';
            currentUtterance.voice = getEnglishVoice();
        }
        
        // Set speech properties
        currentUtterance.rate = 0.9;
        currentUtterance.pitch = 1;
        currentUtterance.volume = 1;
        
        // Event listeners
        currentUtterance.onstart = () => {
            isSpeaking = true;
            speakerBtn.classList.add('speaking');
            speakerIcon.className = 'fas fa-volume-mute';
        };
        
        currentUtterance.onend = () => {
            isSpeaking = false;
            speakerBtn.classList.remove('speaking');
            speakerIcon.className = 'fas fa-volume-up';
        };
        
        currentUtterance.onerror = () => {
            isSpeaking = false;
            speakerBtn.classList.remove('speaking');
            speakerIcon.className = 'fas fa-volume-up';
        };
        
        // Start speaking
        speechSynthesis.speak(currentUtterance);
    }
}

// Get Arabic Voice
function getArabicVoice() {
    const voices = speechSynthesis.getVoices();
    return voices.find(voice => voice.lang.includes('ar')) || voices[0];
}

// Get English Voice
function getEnglishVoice() {
    const voices = speechSynthesis.getVoices();
    return voices.find(voice => voice.lang.includes('en')) || voices[0];
}

// Initialize speech synthesis voices
function initializeSpeechSynthesis() {
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            // Voices are loaded
        };
    }
}



// Header Scroll Effect
function handleHeaderScroll() {
    const header = document.querySelector('.modern-header');
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

// Smooth Scrolling
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.modern-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                updateActiveNavLink(targetId);
            }
        });
    });
}

// Update Active Navigation Link
function updateActiveNavLink(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.modern-header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Setup Animations
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .contact-item, .stat, .stat-card');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        element.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Setup Scroll Effects
function setupScrollEffects() {
    // Parallax effect for background elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const particles = document.querySelectorAll('.particle');
        const shapes = document.querySelectorAll('.floatingElements');
        
        particles.forEach((particle, index) => {
            const speed = 0.5 + (index * 0.1);
            particle.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
        
        shapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.05);
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Setup Interactive Elements
function setupInteractiveElements() {
    // Interactive demo card effects
    const interactiveDemo = document.querySelector('.interactive-demo');
    if (interactiveDemo) {
        interactiveDemo.addEventListener('mousemove', (e) => {
            const rect = interactiveDemo.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            interactiveDemo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        interactiveDemo.addEventListener('mouseleave', () => {
            interactiveDemo.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    }
}

// Setup Counter Animations
function setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Setup Particle Effects
function setupParticleEffects() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach(particle => {
        particle.addEventListener('mouseenter', () => {
            particle.style.transform = 'scale(1.5) rotate(180deg)';
            particle.style.opacity = '0.8';
        });
        
        particle.addEventListener('mouseleave', () => {
            particle.style.transform = 'scale(1) rotate(0deg)';
            particle.style.opacity = '0.3';
        });
    });
}

// Setup Tilt Effects
function setupTiltEffects() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}

// Setup Mouse Effects
function setupMouseEffects() {
    const particles = document.querySelectorAll('.particle');
    const shapes = document.querySelectorAll('.floatingElements');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        particles.forEach((particle, index) => {
            const speed = 1 + (index * 0.1);
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const x = (mouseX - 0.5) * speed * 10;
            const y = (mouseY - 0.5) * speed * 10;
            
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Setup Background Animations
function setupBackgroundAnimations() {
    // Add random movement to particles
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach(particle => {
        setInterval(() => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            particle.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + Math.random() * 2000);
    });
}

// Setup Feature Card Interactions
function setupFeatureCardInteractions() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            // Add click animation
            card.style.transform = 'scale(0.95)';
    setTimeout(() => {
                card.style.transform = 'translateY(-15px) scale(1.02)';
            }, 150);
            
                    // Removed notification popup
        });
    });
}

// Setup Button Effects
function setupButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
        
        // Ripple click effect
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Handle Mouse Movement
function handleMouseMovement(e) {
    const particles = document.querySelectorAll('.particle');
    const shapes = document.querySelectorAll('.floatingElements');
    
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    particles.forEach((particle, index) => {
        const speed = 1 + (index * 0.1);
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        const x = (mouseX - 0.5) * speed * 10;
        const y = (mouseY - 0.5) * speed * 10;
        
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// Setup Intersection Observer
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                if (entry.target.classList.contains('feature-card')) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out';
                }
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.feature-card, .contact-item, .stat, .stat-card, .about-image');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Translation Modal Functions
function openTranslationModal() {
    const modal = document.getElementById('translationModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Initialize camera
        initializeCamera();
        
        // Add entrance animation
        modal.style.animation = 'fadeIn 0.3s ease-out';
    }
}

function closeTranslationModal() {
    const modal = document.getElementById('translationModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Stop camera
        stopCamera();
    }
}

// Camera Functions
function initializeCamera() {
    const video = document.getElementById('camera');
    if (video && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.play();
                // Start sign recognition loop once camera is ready
                tryStartSignRecognitionLoop(video);
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                showNotification('خطأ في الوصول للكاميرا', 'error');
            });
    }
}

function stopCamera() {
    const video = document.getElementById('camera');
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
    // Stop recognition loop when camera stops
    stopSignRecognitionLoop();
}

// Sign Recognition Streaming
let signRecognitionIntervalId = null;
let offscreenCanvas = null;
let offscreenCtx = null;

function tryStartSignRecognitionLoop(videoElement) {
    // Guard against multiple intervals
    stopSignRecognitionLoop();

    // Create an offscreen canvas for frame capture
    if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas');
        offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    // Polling interval (ms)
    const CAPTURE_INTERVAL_MS = 500; // 2 FPS (500ms between captures)
    const TARGET_WIDTH = 320; // downscale for bandwidth; backend should accept this

    signRecognitionIntervalId = setInterval(async () => {
        const video = videoElement || document.getElementById('camera');
        if (!video || video.readyState < 2) return; // not enough data yet

        try {
            const aspect = video.videoWidth / Math.max(1, video.videoHeight);
            const width = TARGET_WIDTH;
            const height = Math.round(width / aspect);

            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            offscreenCtx.drawImage(video, 0, 0, width, height);

            const blob = await new Promise(resolve => offscreenCanvas.toBlob(resolve, 'image/jpeg', 0.7));
            if (!blob) return;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'image/jpeg'
                },
                body: blob
            });

            if (!response.ok) return;
            const result = await response.json();
            if (!result) return;

            const translationText = document.getElementById('translationText');
            if (!translationText) return;

            if (result.text && typeof result.text === 'string' && result.text.trim() !== '') {
                const arabicText = result.text.trim();
                
                // Check if it's an unknown prediction
                if (arabicText === "غير معروف" || arabicText.includes("غير معروف")) {
                    translationText.textContent = "غير معروف - حاول مرة أخرى";
                    translationText.style.color = "#ff6b6b"; // Red color for unknown
                    return;
                }
                
                // Display only the Arabic letter
                translationText.textContent = arabicText;
                translationText.style.color = "#4ecdc4"; // Reset to normal color
                
            } else if (result.label) {
                translationText.textContent = String(result.label);
            }
        } catch (err) {
            // Be silent to avoid spamming console; optionally log once
        }
    }, CAPTURE_INTERVAL_MS);
}

function stopSignRecognitionLoop() {
    if (signRecognitionIntervalId) {
        clearInterval(signRecognitionIntervalId);
        signRecognitionIntervalId = null;
    }
}

function startTranslation() {
    const translationText = document.getElementById('translationText');
    if (translationText) {
        // Simulate translation process
        translationText.textContent = currentLanguage === 'ar' ? 'جاري الترجمة...' : 'Translating...';
        
        // Add loading animation
        translationText.style.animation = 'pulse 1s ease-in-out infinite';
        
        setTimeout(() => {
            // Simulate translation result
            const sampleTranslations = {
                ar: ['مرحباً', 'كيف حالك؟', 'شكراً لك', 'أهلاً وسهلاً', 'أنا سعيد بلقائك'],
                en: ['Hello', 'How are you?', 'Thank you', 'Welcome', 'Nice to meet you']
            };
            
            const randomTranslation = sampleTranslations[currentLanguage][Math.floor(Math.random() * sampleTranslations[currentLanguage].length)];
            translationText.textContent = randomTranslation;
            translationText.style.animation = 'none';
            
            // Auto-speak the translation
            setTimeout(() => {
                if (!isSpeaking) {
                    toggleSpeech();
                }
            }, 500);
            
            showNotification(
                currentLanguage === 'ar' ? 'تمت الترجمة بنجاح!' : 'Translation completed successfully!',
                'success'
            );
        }, 2000);
    }
}

// Form Submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name') || e.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const message = formData.get('message') || e.target.querySelector('textarea').value;
    
    if (name && email && message) {
        // Simulate form submission with loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = currentLanguage === 'ar' ? '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...' : '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification(
                currentLanguage === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!',
                'success'
            );
            
            // Reset form
            e.target.reset();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    } else {
        showNotification(
            currentLanguage === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields',
            'error'
        );
    }
}

// Keyboard Navigation
function handleKeyboardNavigation(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('translationModal');
        if (modal && modal.classList.contains('show')) {
            closeTranslationModal();
        }
    }
    
    // Toggle sidebar with Enter key (mobile)
    if (e.key === 'Enter' && e.target.classList.contains('mobile-menu-btn')) {
        toggleMobileSidebar();
    }
    
    // Open translation modal with Ctrl/Cmd + T
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        openTranslationModal();
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-medium);
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        box-shadow: var(--shadow-heavy);
        background: ${getNotificationColor(type)};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function getNotificationColor(type) {
    const colors = {
        success: 'var(--bright-green)',
        error: '#f44336',
        warning: 'var(--orange)',
        info: 'var(--primary-blue)'
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced scroll handling with debounce
const debouncedScrollHandler = debounce(handleHeaderScroll, 10);
window.addEventListener('scroll', debouncedScrollHandler);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Removed notification popup - user can install manually if needed
});

// Export functions for global access
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleMobileSidebar = toggleMobileSidebar;
window.openTranslationModal = openTranslationModal;
window.closeTranslationModal = closeTranslationModal;
window.startTranslation = startTranslation;
window.scrollToSection = scrollToSection;

function setupHeroGlow() {
    const hero = document.querySelector('.hero-container');
    const glow = document.querySelector('.hero-container .cursor-glow');
    if (!hero || !glow) return;
    hero.addEventListener('mousemove', (e)=>{
        const rect = hero.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        glow.style.setProperty('--mx', mx + 'px');
        glow.style.setProperty('--my', my + 'px');
    });
    hero.addEventListener('mouseleave', ()=>{
        glow.style.setProperty('--mx', '-999px');
        glow.style.setProperty('--my', '-999px');
    });
}
// initialize hero glow
setupHeroGlow();

// Team Dashboard Functionality
const teamMembers = [
    {
        name: "AHMED ALRASHEED",
        nameAr: "أحمد الرشيد",
        role: "Team Lead",
        roleAr: "قائد الفريق",
        image: "assets/ahmed_photo.jpeg",
        description: "I am a Computer Science student at Shaqra University, an AI Engineer, an iOS Developer, and a Full-Stack Developer, passionate about creating innovative technological solutions that integrate artificial intelligence and software development. I have participated in leading and developing impactful projects such as Sila, a system for translating sign language letters, EduEye, which predicts at-risk students and identifies talented ones, and Velorent, a personal car rental platform. I was also part of the team behind Yusra, an application that facilitates access to accessible locations for people with disabilities. With my team, I achieved 2nd place in Qualithon Hackathon among 63 teams representing 30 universities. I also earned 1st place for three consecutive years in the University Scientific Forum in the \"Outstanding Entrepreneurship Idea\" track. I am a graduate of the Apple AI Foundation Program and the Samsung Innovation Campus in AI. I hold the Global Leadership Certificate from Coventry University in the UK, after being selected among the top 16 students to join this prestigious program. These achievements have strengthened my skills in leadership, innovation, and quality, and I strive to harness technology to create impactful and inspiring solutions.",
        descriptionAr: "أنا طالب علوم حاسب في جامعة شقراء، ومهندس ذكاء اصطناعي، ومطور تطبيقات iOS، ومطور متكامل (Full-Stack Developer)، شغوف بابتكار حلول تقنية حديثة تجمع بين الذكاء الاصطناعي وتطوير البرمجيات. شاركت في قيادة وتطوير مشاريع مؤثرة مثل صلة لترجمة أحرف لغة الإشارة، وEduEye للتنبؤ بالمتعثرين واكتشاف الموهوبين، إضافة إلى تطوير Velorent لتأجير السيارات الشخصية، كما كنت جزءًا من فريق عمل على مشروع يسرا لتسهيل الوصول للأماكن المهيأة لذوي الإعاقة. حققت مع فريقي المركز الثاني في هاكاثون كواليثون بين 63 فريقًا من 30 جامعة. كما حصدت المركز الأول ثلاث سنوات متتالية في الملتقى العلمي بالجامعة بمسار الفكرة المتميزة بريادة الأعمال. أنا خريج المعسكر التأسيسي للذكاء الاصطناعي من أبل، وبرنامج سامسونج للذكاء الاصطناعي. أحمل شهادة القيادة العالمية من جامعة كوفنتري ببريطانيا بعد اختياري ضمن أفضل 16 طالبًا في الجامعة. هذه الإنجازات عززت مهاراتي في القيادة، الابتكار، والجودة، وأسعى لتسخير التقنية في صناعة حلول واقعية ملهمة.",
        linkedin: "https://linkedin.com/in/ahmed-k-alrasheed-446b8829b"
    },
    {
        name: "AMIRAH ALDAJANI",
        nameAr: "أميرة الدعجاني",
        role: "UI/UX Designer",
        roleAr: "مصممة واجهات المستخدم",
        image: "assets/Amirah_logo.jpeg",
        description: "Final-year Computer Science student majoring in Artificial Intelligence. Skilled in AI, IoT, Data Analytics, and Robotic Process Automation (RPA). Developed key projects such as Sila for translating sign language letters and Ghiras for plant disease detection. Also engineered a smart parking system integrating AI and IoT. Participated in hackathons and competitions, achieving 2nd place at the Smart Cities Hackathon. Completed a diverse internship at AlKhorayef Group covering Data Analytics, RPA, and Web Development, in addition to Samsung AI - innovation campus. Earned independent professional certifications in Artificial Intelligence, IoT, and Data Analytics.",
        descriptionAr: "طالبة في السنة الأخيرة بقسم علوم الحاسب – مسار الذكاء الاصطناعي. أمتلك خبرة عملية في الذكاء الاصطناعي، إنترنت الأشياء، تحليل البيانات، وأتمتة العمليات الروبوتية. نفذت عدة مشاريع بارزة مثل \"صلة\" لترجمة أحرف لغة الإشارة و\"غراس\" لاكتشاف أمراض النباتات. كما طورت نظام حجز مواقف ذكي يعتمد على الذكاء الاصطناعي وIoT. شاركت في هاكاثونات وتحديات تقنية وحصلت على المركز الثاني في هاكاثون المدن الذكية. أنجزت تدريبًا متنوعًا في مجموعة الخريف شمل تحليل البيانات، RPA، وتطوير الويب، إضافةً إلى معسكر سامسونج للذكاء الاصطناعي. وحصلت على شهادات احترافية مستقلة في الذكاء الاصطناعي، إنترنت الأشياء، وتحليل البيانات.",
        linkedin: "https://www.linkedin.com/in/aldajanii"
    },
    {
        name: "TARFAH ALDOSARI",
        nameAr: "طرفة الدوسري",
        role: "Frontend Developer",
        roleAr: "مطورة واجهات أمامية",
        image: "assets/tarfah_logo.jpeg",
        description: "I am Software Engineering student at King Saud University, with a strong interest in Artificial Intelligence and Software Architecture. I am passionate about developing intelligent solutions that simplify daily life and enhance user experience. My notable projects include \"Sila\", which translates Arabic Sign Language letters in real-time, and SmartPay, where I wrote project requirements, designed UML diagrams, and chose the appropriate system architecture. I cured working on a Travel Planning project, providing AI-based recommendations for organizing trips. I participated in the AI Bootcamp by Samsung and Misk to enhance my practical and applied skills in the field. I have completed advanced Machine Learning courses on Coursera and DataCamp to deepen my knowledge and expertise. I am skilled at problem analysis and designing efficient software solutions, with a focus on innovation and quality.",
        descriptionAr: "أنا طالبة هندسة برمجيات من جامعة الملك سعود، مهتمة بالذكاء الاصطناعي ومعمارية البرمجيات. لدي شغف بتطوير حلول ذكية تسهّل الحياة اليومية وتحسّن تجربة المستخدم. من أبرز مشاريعي: \"صلة\" لترجمة حروف لغة الإشارة العربية في الوقت الفعلي، وSmartPay حيث كتبت متطلبات المشروع، صممت UML diagrams واخترت المعمارية المناسبة للنظام. اعمل حالياً على مشروع Travel Planning لتقديم توصيات الذكاء الاصطناعي في تنظيم الرحلات. شاركت في معسكر الذكاء الاصطناعي التابع لسامسونج و مسك لتعزيز مهاراتي العملية والتطبيقية في المجال. أخذت كورسات متقدمة في Machine Learning على Coursera وDataCamp لتعميق معرفتي وخبرتي في المجال. أتقن تحليل المشكلات وتصميم حلول برمجية فعّالة مع التركيز على الابتكار والجودة.",
        linkedin: "https://linkedin.com/in/tarfahsaeed"
    },
    {
        name: "SALEH ALWAKEEL",
        nameAr: "صالح الوكيل",
        role: "Backend Developer",
        roleAr: "مطور خلفية",
        image: "assets/saleh_photoi.jpeg",
        description: "A Mechatronics and Robotics Engineering student at the University of Sheffield with hands-on experience in both software development and entrepreneurship. As a Software Engineering Intern at Mekaaz, I contributed to developing the company's application, strengthening my technical and teamwork skills. In parallel, my entrepreneurial journey has enhanced my leadership, problem-solving, and adaptability, allowing me to grow professionally while pursuing my studies.",
        descriptionAr: "أدرس في هندسة الميكاترونكس والروبوتات بجامعة شيفيلد أمتلك خبرة عملية في تطوير البرمجيات وريادة الأعمال. خلال عملي كـ متدرب في هندسة البرمجيات بشركة Mekaaz ساهمت في تطوير تطبيق الشركة، مما عزز مهاراتي التقنية والعمل الجماعي. وبالتوازي، ساعدتني رحلتي الريادية على تنمية مهارات القيادة وحل المشكلات والقدرة على التكيف، مما مكنني من التطور المهني إلى جانب دراستي.",
        linkedin: "https://www.linkedin.com/in/saleh-alwakeel-403291298"
    },
    {
        name: "SAUD BIN SAMHAN",
        nameAr: "سعود بن سمحان",
        role: "AI Engineer",
        roleAr: "مهندس ذكاء اصطناعي",
        image: "assets/saud_photo.JPG",
        description: "Final-year Computer Science student specializing in Artificial Intelligence, Data Science, and Full-Stack Development. Graduate of intensive Backend Development Program (Misk & MCIT) and currently pursuing IBM Data Science Specialist certification on Coursera alongside Samsung Innovation Campus. Skilled in AI/ML, Python, JavaScript, React, TensorFlow, and end-to-end web development with proven expertise in CNN, NLP, and PWA technologies. Developed key projects including SILA for AI-powered sign language translation with my team, HopeHub charity management platform with integration of 15+ APIs, and contributed to RAFEEQ educational platform for Imam University as my graduation project. Engineered comprehensive solutions from database design and system architecture to AI model implementation and modern user interfaces. Completed diverse training programs covering Backend Development, AI/ML, and earned professional certifications from IBM SkillsBuild in Cybersecurity and Data Fundamentals. Passionate about leveraging cutting-edge technology to create meaningful social impact and bridge communication gaps through innovative AI solutions.",
        descriptionAr: "طالب في السنة الأخيرة في تخصص علوم الحاسب متخصص في الذكاء الاصطناعي وعلوم البيانات وتطوير المواقع المتكامل. متخرج من البرنامج المكثف لتطوير Backend (مسك و MCIT) وحالياً أحضر دورة IBM Data Science Specialist على Coursera مع معسكر سامسونج للابتكار. ماهر في الذكاء الاصطناعي والتعلم الآلي و Python وJavaScript وReact وTensorFlow مع خبرة مثبتة في CNN وNLP وPWA. طورت مشاريع رئيسية تشمل مشروع صلة لترجمة لغة الإشارة بالذكاء الاصطناعي مع فريقي، منصة HopeHub لإدارة الجمعيات الخيرية مع تكامل 15+ API، وشاركت في منصة RAFEEQ التعليمية لجامعة الإمام كمشروع تخرج. أطور حلول شاملة من تصميم قواعد البيانات وهندسة الأنظمة إلى تنفيذ نماذج الذكاء الاصطناعي وواجهات المستخدم الحديثة. أكملت برامج تدريبية متنوعة في تطوير Backend والذكاء الاصطناعي وحصلت على شهادات مهنية من IBM SkillsBuild في الأمن السيبراني وأساسيات البيانات. شغوف بالاستفادة من التقنيات المتطورة لخلق تأثير اجتماعي هادف وسد فجوات التواصل من خلال حلول الذكاء الاصطناعي المبتكرة.",
        linkedin: "https://www.linkedin.com/in/saud-bin-samhan-278205343"
    },
    {
        name: "MAAN HALWANI",
        nameAr: "معن حلواني",
        role: "Quality Assurance",
        roleAr: "ضمان الجودة",
        image: "assets/maan_photo.jpeg",
        description: "I am a penultimate-year Data Science student at Umm Al-Qura University specializing in Artificial Intelligence, with advanced technical expertise and practical experience in developing intelligent solutions. I am proficient in Artificial Intelligence, Data Analytics, Internet of Things (IoT), and Software Development, and I have a strong record of building integrated systems that combine practical innovation with modern technologies. I led the development of several pioneering projects, including the Bitcoin Data Intelligence Dashboard for cryptocurrency analytics, the Health Aid platform enabling real-time blood donation, and the Jisr platform that connects entrepreneurs with investors to foster entrepreneurship. I actively participated in multiple national hackathons such as Hajjathon 3, Geo-Hackathon, and the Health Innovation Hackathon, where I achieved recognition and top placements for AI-powered innovative solutions. I hold three professional certifications from IBM in Applied Data Science, Artificial Intelligence, and Generative AI Fundamentals. In addition, I joined the Saudi Data Bootcamp and the Samsung Innovation Campus – AI Track, which enhanced my technical expertise and strengthened my practical skills. Currently, I am working at Ebdaat Al-Tajroba in the fields of Artificial Intelligence, Data Analytics, and Dashboard Development, where I apply state-of-the-art technologies to deliver business-driven solutions and support strategic decision-making.",
        descriptionAr: "متقدمة وخلفية عملية في تطوير الحلول الذكية. متمكن في مجالات الذكاء الاصطناعي، تحليل البيانات، إنترنت الأشياء، وتطوير البرمجيات، ولدي سجل متميز في بناء أنظمة متكاملة تجمع بين الابتكار العملي وأحدث التقنيات. قدت تطوير عدة مشاريع رائدة من أبرزها لوحة تحليلات البيتكوين الذكية لمتابعة وتحليل العملات الرقمية، ومنصة Health Aid التي تمكّن من التبرع بالدم بشكل فوري وفعّال، ومنصة جسر التي تربط رواد الأعمال بالمستثمرين لتعزيز ريادة الأعمال. شاركت في عدد من الهاكاثونات الوطنية مثل حجاثون 3، جيو هاكاثون، وهيلثون الابتكار الصحي، وحققت من خلالها إنجازات ومراكز متقدمة عبر حلول مبتكرة مدعومة بالذكاء الاصطناعي. كما حصلت على ثلاث شهادات احترافية من IBM في Applied Data Science وArtificial Intelligence وGenerative AI Fundamentals، بالإضافة إلى التحاقي بمعسكر البيانات السعودي ومعسكر سامسونج للابتكار في الذكاء الاصطناعي، مما عزز خبراتي التقنية وصقل مهاراتي العملية. أعمل حاليًا في شركة أبعاد التجربة بمجال الذكاء الاصطناعي وتحليل البيانات وتطوير لوحات المعلومات، حيث أطبق أحدث التقنيات لتقديم حلول عملية تدعم قطاع الأعمال وتسهم في صنع القرارات الاستراتيجية.",
        linkedin: "https://www.linkedin.com/in/maan-halawani-97a5a630a?trk=contact-info"
    }
];

// Open team member popup
function openTeamPopup(index) {
    const member = teamMembers[index];
    if (!member) return;
    
    // Create popup if it doesn't exist
    let popup = document.getElementById('teamPopupOverlay');
    if (!popup) {
        popup = createTeamPopup();
    }
    
    // Update popup content
    const popupImage = popup.querySelector('#popupImage');
    const popupName = popup.querySelector('#popupName');
    const popupDescription = popup.querySelector('#popupDescription');
    const popupLinkedin = popup.querySelector('#popupLinkedin');
    
    popupImage.src = member.image;
    popupImage.alt = member.name;
    popupName.textContent = currentLanguage === 'ar' ? member.nameAr : member.name;
    popupDescription.textContent = currentLanguage === 'ar' ? member.descriptionAr : member.description;
    popupLinkedin.href = member.linkedin;
    popupLinkedin.querySelector('span').textContent = currentLanguage === 'ar' ? 'الملف الشخصي على LinkedIn' : 'LinkedIn Profile';
    
    // Show popup
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Create team popup HTML
function createTeamPopup() {
    const popupHTML = `
        <div class="popup-overlay" id="teamPopupOverlay">
            <div class="popup-content">
                <button class="popup-close" onclick="closeTeamPopup()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="popup-image">
                    <img id="popupImage" src="" alt="">
                </div>
                <div class="popup-text">
                    <h3 id="popupName">Name</h3>
                    <p id="popupDescription" style="color: #666; line-height: 1.6; margin-bottom: 20px; max-height: 200px; overflow-y: auto; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9; box-sizing: border-box;">Description</p>
                    <a id="popupLinkedin" href="#" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; color: #0077b5; text-decoration: none; margin-bottom: 20px; font-weight: 500;">
                        <i class="fab fa-linkedin"></i>
                        <span>LinkedIn Profile</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    return document.getElementById('teamPopupOverlay');
}

// Close team popup
function closeTeamPopup() {
    const popup = document.getElementById('teamPopupOverlay');
    if (popup) {
        popup.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close popup when clicking outside
document.addEventListener('click', function(e) {
    const popup = document.getElementById('teamPopupOverlay');
    if (popup && e.target === popup) {
        closeTeamPopup();
    }
});

// Close popup with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTeamPopup();
    }
});

// Update popup content when language changes
function updateTeamPopupLanguage() {
    const popup = document.getElementById('teamPopupOverlay');
    if (!popup || !popup.classList.contains('active')) return;
    
    // Find which team member is currently displayed
    const popupName = popup.querySelector('#popupName');
    const currentName = popupName.textContent;
    
    // Find the team member index
    let memberIndex = -1;
    teamMembers.forEach((member, index) => {
        if (member.name === currentName || member.nameAr === currentName) {
            memberIndex = index;
        }
    });
    
    if (memberIndex !== -1) {
        // Update the popup with new language
        const member = teamMembers[memberIndex];
        const popupDescription = popup.querySelector('#popupDescription');
        const popupLinkedin = popup.querySelector('#popupLinkedin');
        
        popupName.textContent = currentLanguage === 'ar' ? member.nameAr : member.name;
        popupDescription.textContent = currentLanguage === 'ar' ? member.descriptionAr : member.description;
        popupLinkedin.querySelector('span').textContent = currentLanguage === 'ar' ? 'الملف الشخصي على LinkedIn' : 'LinkedIn Profile';
    }
}