// Modern UX & conversion-focused JS
document.addEventListener('DOMContentLoaded', function() {
  // Set year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  
  // Initialize trial start date if user is logged in but no trial date exists
  if (localStorage.getItem('userLoggedIn') === 'true' && !localStorage.getItem('trialStartDate')) {
    localStorage.setItem('trialStartDate', new Date().toISOString());
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Header scroll effect
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }
    
    lastScrollY = currentScrollY;
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.features-grid article, .plan, blockquote, .hero-visual').forEach(el => {
    observer.observe(el);
  });

  // Enhanced form handling
  const form = document.getElementById('signup-form');
  const msg = document.getElementById('form-message');
  if (!form) return;

  function track(event, payload) {
    window._boostly = window._boostly || { events: [] };
    window._boostly.events.push({ event, payload, ts: Date.now() });
    console.log('Analytics event:', event, payload);
  }

  // Real-time validation
  const emailInput = form.querySelector('input[name="email"]');
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      const email = this.value.trim();
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        this.style.borderColor = '#f56565';
        showMessage('Please enter a valid email address.', true);
      } else {
        this.style.borderColor = '';
        hideMessage();
      }
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());

    // Enhanced validation
    if (!values.fullName?.trim()) {
      showMessage('Please enter your full name.', true);
      track('signup_validation_failed', { field: 'fullName' });
      return;
    }

    if (!values.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
      showMessage('Please enter a valid work email.', true);
      track('signup_validation_failed', { field: 'email' });
      return;
    }

    // Simulate A/B variant tracking
    const activeAB = document.querySelector('[data-ab].active')?.getAttribute('data-ab') || null;
    track('signup_attempt', { email: values.email, plan: values.plan || null, variant: activeAB });

    // Enhanced loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Starting trial...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Start free trial';
      showMessage('Welcome aboard! Check your inbox for setup instructions.', false);
      track('signup_success', { email: values.email });
      form.reset();
      
      // Confetti effect
      createConfetti();
    }, 1500);
  });

  function showMessage(text, isError) {
    if (!msg) return;
    msg.hidden = false;
    msg.textContent = text;
    msg.style.color = isError ? 'crimson' : 'green';
    msg.classList.add('animate-fade-in');
  }

  function hideMessage() {
    if (!msg) return;
    msg.hidden = true;
    msg.classList.remove('animate-fade-in');
  }

  // Simple confetti effect
  function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#38b2ac', '#48bb78'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: confetti-fall 3s linear forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  }

  // Add confetti animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confetti-fall {
      to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Enhanced A/B testing tracking
  document.querySelectorAll('[data-ab]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('[data-ab]').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      track('cta_clicked', { variant: el.getAttribute('data-ab') });
    });
  });

  // Pricing plan selection tracking
  document.querySelectorAll('[data-plan]').forEach(el => {
    el.addEventListener('click', () => {
      track('plan_selected', { plan: el.getAttribute('data-plan') });
    });
  });

  // Mouse parallax effect for hero visual
  const heroVisual = document.querySelector('.hero-visual .card');
  if (heroVisual) {
    document.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth - 0.5) * 20;
      const yPos = (clientY / innerHeight - 0.5) * 20;
      
      heroVisual.style.transform = `perspective(1000px) rotateY(${-5 + xPos}deg) rotateX(${5 + yPos}deg)`;
    });
  }

  // Dark Mode Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  if (currentTheme === 'dark') {
    themeToggle.textContent = '☀️';
  }
  
  themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    track('theme_changed', { theme: newTheme });
  });

  // Live User Counter Animation
  const userCount = document.getElementById('user-count');
  if (userCount) {
    let count = 2847;
    setInterval(() => {
      count += Math.floor(Math.random() * 3);
      userCount.textContent = count.toLocaleString();
    }, 30000);
  }

  // Real-time Trial Days Counter
  function updateTrialDays() {
    const trialStartDate = localStorage.getItem('trialStartDate');
    if (!trialStartDate) return;
    
    const startDate = new Date(trialStartDate);
    const now = new Date();
    const trialEndDate = new Date(startDate);
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    const timeDiff = trialEndDate - now;
    const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    const trialDaysElements = document.querySelectorAll('#trial-days');
    trialDaysElements.forEach(element => {
      element.textContent = daysLeft;
    });
  }
  
  // Update trial days on page load and every hour
  updateTrialDays();
  setInterval(updateTrialDays, 3600000);



  // ROI Calculator
  const monthlyVisitors = document.getElementById('monthly-visitors');
  const conversionRate = document.getElementById('conversion-rate');
  const avgRevenue = document.getElementById('avg-revenue');
  const additionalRevenue = document.getElementById('additional-revenue');
  const additionalCustomers = document.getElementById('additional-customers');
  const roiPercentage = document.getElementById('roi-percentage');
  
  function calculateROI() {
    const visitors = parseInt(monthlyVisitors.value) || 0;
    const currentRate = parseFloat(conversionRate.value) || 0;
    const revenue = parseInt(avgRevenue.value) || 0;
    
    const currentCustomers = visitors * (currentRate / 100);
    const improvedRate = currentRate * 1.22; // 22% improvement
    const newCustomers = visitors * (improvedRate / 100);
    const additionalCust = Math.round(newCustomers - currentCustomers);
    const additionalRev = additionalCust * revenue;
    const roi = Math.round(((additionalRev - 79) / 79) * 100); // Assuming £79 plan
    
    additionalRevenue.textContent = additionalRev.toLocaleString();
    additionalCustomers.textContent = additionalCust.toLocaleString();
    roiPercentage.textContent = Math.max(roi, 0).toLocaleString();
    
    track('roi_calculated', { visitors, currentRate, revenue, additionalRev });
  }
  
  if (monthlyVisitors && conversionRate && avgRevenue) {
    [monthlyVisitors, conversionRate, avgRevenue].forEach(input => {
      input.addEventListener('input', calculateROI);
    });
    calculateROI(); // Initial calculation
  }

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isActive = question.classList.contains('active');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.classList.remove('active');
      });
      
      if (!isActive) {
        question.classList.add('active');
        answer.classList.add('active');
        track('faq_opened', { question: question.textContent });
      }
    });
  });

  // Sticky CTA Bar
  const stickyCta = document.getElementById('sticky-cta');
  const closeSticky = document.getElementById('close-sticky');
  let stickyShown = false;
  
  window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent > 50 && !stickyShown) {
      stickyCta.hidden = false;
      stickyCta.classList.add('show');
      stickyShown = true;
      track('sticky_cta_shown', { scroll_percent: scrollPercent });
    }
  });
  
  if (closeSticky) {
    closeSticky.addEventListener('click', () => {
      stickyCta.classList.remove('show');
      setTimeout(() => stickyCta.hidden = true, 300);
      track('sticky_cta_closed');
    });
  }

  // Exit Intent Popup
  const exitPopup = document.getElementById('exit-popup');
  const closePopup = document.getElementById('close-popup');
  let exitShown = false;
  
  function closeExitPopup() {
    if (exitPopup) {
      exitPopup.classList.remove('show');
      exitPopup.style.display = 'none';
      exitPopup.hidden = true;
      track('exit_intent_closed');
    }
  }
  
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0 && !exitShown && exitPopup) {
      exitPopup.hidden = false;
      exitPopup.style.display = 'flex';
      exitPopup.classList.add('show');
      exitShown = true;
      track('exit_intent_shown');
    }
  });
  
  if (closePopup) {
    closePopup.addEventListener('click', closeExitPopup);
  }
  
  // Close popup when clicking outside
  if (exitPopup) {
    exitPopup.addEventListener('click', (e) => {
      if (e.target === exitPopup) {
        closeExitPopup();
      }
    });
  }
  
  // Close popup with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && exitPopup && !exitPopup.hidden) {
      closeExitPopup();
    }
  });


  const chatToggle = document.getElementById('chat-toggle');
  const chatWindow = document.getElementById('chat-window');
  const closeChat = document.getElementById('close-chat');
  const chatInput = document.getElementById('chat-input');
  const sendMessage = document.getElementById('send-message');
  const chatMessages = document.querySelector('.chat-messages');
  
  if (chatToggle) {
    chatToggle.addEventListener('click', () => {
      chatWindow.hidden = !chatWindow.hidden;
      if (!chatWindow.hidden) {
        track('chat_opened');
        chatInput.focus();
      }
    });
  }
  
  if (closeChat) {
    closeChat.addEventListener('click', () => {
      chatWindow.hidden = true;
      track('chat_closed');
    });
  }
  
  function addMessage(text, isUser = false) {
    const message = document.createElement('div');
    message.className = `message ${isUser ? 'user' : 'bot'}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage(text, true);
    chatInput.value = '';
    track('chat_message_sent', { message: text });
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = '<span class="typing-dots">●●●</span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Smart bot responses based on keywords
    setTimeout(() => {
      typingDiv.remove();
      const lowerText = text.toLowerCase();
      let response;
      
      if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('pricing')) {
        response = "Our Growth plan starts at £79/month. You can start a free 14-day trial to see how we can help your specific use case!";
      } else if (lowerText.includes('demo') || lowerText.includes('trial')) {
        response = "I'd love to show you Boostly in action! You can start a free 14-day trial to explore all features.";
      } else if (lowerText.includes('integration') || lowerText.includes('setup')) {
        response = "Setup takes less than 5 minutes! We integrate with Segment, HubSpot, Salesforce, and most major tools. What's your current tech stack?";
      } else if (lowerText.includes('help') || lowerText.includes('support')) {
        response = "I'm here to help! You can also check our Help Center or I can connect you with our support team. What specific question do you have?";
      } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        response = "Hello! I'm Sarah from Boostly. How can I help you increase your conversion rates today?";
      } else {
        response = "Thanks for reaching out! A team member will get back to you within 2 hours. In the meantime, feel free to explore our demo or start a free trial.";
      }
      
      addMessage(response);
      
      // Add quick action buttons for relevant responses
      if (lowerText.includes('demo') || lowerText.includes('trial') || lowerText.includes('price')) {
        setTimeout(() => {
          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'message bot actions';
          actionsDiv.innerHTML = `
            <div class="quick-actions">
              <button onclick="window.open('demo.html', '_blank')" class="quick-btn">📺 View Demo</button>
              <button onclick="window.open('pricing.html', '_blank')" class="quick-btn">💰 See Pricing</button>
              <button onclick="window.open('trial-setup.html', '_blank')" class="quick-btn">🚀 Start Trial</button>
            </div>
          `;
          chatMessages.appendChild(actionsDiv);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);
      }
    }, Math.random() * 2000 + 1000); // Random delay 1-3 seconds
  }
  
  if (sendMessage) {
    sendMessage.addEventListener('click', sendChatMessage);
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  // Cookie Preferences
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookies = document.getElementById('accept-cookies');
  const declineCookies = document.getElementById('decline-cookies');
  const customizeCookies = document.getElementById('customize-cookies');
  const savePreferences = document.getElementById('save-preferences');
  const cookieDetails = document.getElementById('cookie-details');
  const analyticsCookies = document.getElementById('analytics-cookies');
  const marketingCookies = document.getElementById('marketing-cookies');
  
  if (!localStorage.getItem('cookies-accepted')) {
    setTimeout(() => {
      if (cookieBanner) cookieBanner.classList.add('show');
    }, 3000);
  }
  
  if (acceptCookies) {
    acceptCookies.addEventListener('click', () => {
      localStorage.setItem('cookies-accepted', 'true');
      localStorage.setItem('analytics-cookies', 'true');
      localStorage.setItem('marketing-cookies', 'true');
      cookieBanner.classList.remove('show');
      track('cookies_accepted_all');
    });
  }
  
  if (declineCookies) {
    declineCookies.addEventListener('click', () => {
      localStorage.setItem('cookies-accepted', 'false');
      localStorage.setItem('analytics-cookies', 'false');
      localStorage.setItem('marketing-cookies', 'false');
      cookieBanner.classList.remove('show');
      track('cookies_declined_all');
    });
  }
  
  if (customizeCookies) {
    customizeCookies.addEventListener('click', () => {
      cookieDetails.hidden = !cookieDetails.hidden;
      customizeCookies.textContent = cookieDetails.hidden ? 'Customize' : 'Hide Options';
      track('cookies_customize_opened');
    });
  }
  
  if (savePreferences) {
    savePreferences.addEventListener('click', () => {
      const analyticsEnabled = analyticsCookies.checked;
      const marketingEnabled = marketingCookies.checked;
      
      localStorage.setItem('cookies-accepted', 'custom');
      localStorage.setItem('analytics-cookies', analyticsEnabled.toString());
      localStorage.setItem('marketing-cookies', marketingEnabled.toString());
      
      cookieBanner.classList.remove('show');
      track('cookies_preferences_saved', {
        analytics: analyticsEnabled,
        marketing: marketingEnabled
      });
    });
  }
  
  // Load saved preferences
  if (analyticsCookies && localStorage.getItem('analytics-cookies') === 'false') {
    analyticsCookies.checked = false;
  }
  if (marketingCookies && localStorage.getItem('marketing-cookies') === 'true') {
    marketingCookies.checked = true;
  }

  // Performance Monitoring (Core Web Vitals)
  function measureWebVitals() {
    // Measure Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      track('web_vital_lcp', { value: lastEntry.startTime });
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Measure First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        track('web_vital_fid', { value: entry.processingStart - entry.startTime });
      });
    }).observe({ entryTypes: ['first-input'] });
  }
  
  // Initialize performance monitoring
  if ('PerformanceObserver' in window) {
    measureWebVitals();
  }

  // A/B Testing Framework
  const abTests = {
    hero_cta_text: {
      variants: ['Start free trial', 'Try Boostly free', 'Get started now'],
      weights: [0.4, 0.3, 0.3]
    },
    pricing_highlight: {
      variants: ['most_popular', 'best_value', 'recommended'],
      weights: [0.5, 0.25, 0.25]
    }
  };
  
  function getABVariant(testName) {
    const test = abTests[testName];
    if (!test) return null;
    
    const stored = localStorage.getItem(`ab_${testName}`);
    if (stored) return stored;
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < test.variants.length; i++) {
      cumulative += test.weights[i];
      if (random <= cumulative) {
        const variant = test.variants[i];
        localStorage.setItem(`ab_${testName}`, variant);
        track('ab_test_assigned', { test: testName, variant });
        return variant;
      }
    }
  }
  
  // Apply A/B tests
  const heroCta = getABVariant('hero_cta_text');
  if (heroCta) {
    const ctaButton = document.querySelector('[data-ab="hero_primary"]');
    if (ctaButton) ctaButton.textContent = heroCta;
  }

  // Conversion Funnel Tracking
  const funnelSteps = {
    page_view: false,
    hero_cta_click: false,
    pricing_view: false,
    form_start: false,
    form_submit: false
  };
  
  // Track page view
  funnelSteps.page_view = true;
  track('funnel_step', { step: 'page_view' });
  
  // Track pricing section view
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    observer.observe(pricingSection);
    const pricingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !funnelSteps.pricing_view) {
          funnelSteps.pricing_view = true;
          track('funnel_step', { step: 'pricing_view' });
        }
      });
    });
    pricingObserver.observe(pricingSection);
  }
  
  // Track form interactions
  if (form) {
    form.addEventListener('focusin', () => {
      if (!funnelSteps.form_start) {
        funnelSteps.form_start = true;
        track('funnel_step', { step: 'form_start' });
      }
    });
  }

  // Mobile menu toggle functionality
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');

  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
    
    // Close menu when clicking nav links
    mainNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
      }
    });
  }
});
