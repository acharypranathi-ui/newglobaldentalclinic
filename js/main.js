/**
 * NEW GLOBAL DENTAL CLINIC - INTERACTIVE ACTIONS JS
 * Handles navigation, filters, pre-fills, form validation, and accessibility.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. STICKY HEADER & SCROLL BEHAVIOR
  // ==========================================================================
  const header = document.getElementById('navbar-sticky');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    // Update active navigation state based on current viewport
    highlightActiveNavLink();
  });

  // Smooth scroll helper for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      // Ignore if it's just a placeholder or doesn't target an element
      if (this.getAttribute('href') === '#') return;
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // If mobile drawer is open, close it first
        if (mobileDrawer.classList.contains('open')) {
          closeMobileDrawer();
        }
        
        const headerOffset = 90; // account for sticky header height
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active Link Highlighting on Scroll
  const navLinks = document.querySelectorAll('#desktop-menu a');
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveNavLink() {
    let scrollPosition = window.scrollY + 120; // offset for triggers

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ==========================================================================
  // 2. MOBILE NAVIGATION DRAWER
  // ==========================================================================
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  
  // Set initial ARIA state
  if (mobileDrawer) {
    mobileDrawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.setAttribute('aria-hidden', 'true');
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeMobileDrawer);
  }

  // Close drawer on hitting escape key (a11y)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeMobileDrawer();
    }
  });

  function openMobileDrawer() {
    mobileMenuToggle.classList.add('open');
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  }

  function closeMobileDrawer() {
    mobileMenuToggle.classList.remove('open');
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock scrolling
  }

  // ==========================================================================
  // 3. TREATMENT GRID FILTERING & DYNAMICS
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const treatmentCards = document.querySelectorAll('.treatment-card');
  const viewAllBtn = document.getElementById('btn-view-all-treatments');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filter = e.target.getAttribute('data-filter');
      
      // Update active state in tabs
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      e.target.classList.add('active');
      e.target.setAttribute('aria-selected', 'true');
      
      filterTreatments(filter);
    });
  });

  function filterTreatments(filter) {
    treatmentCards.forEach(card => {
      const category = card.getAttribute('data-category');
      
      if (filter === 'all' || category === filter) {
        card.style.display = 'flex';
        // Add subtle microanimation entry
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Trigger specializations links to filter treatments and scroll
  const specFilterTriggers = document.querySelectorAll('.filter-trigger');
  specFilterTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const filterValue = trigger.getAttribute('data-filter');
      
      // Find corresponding filter tab button
      const targetBtn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);
      if (targetBtn) {
        targetBtn.click();
      }
      
      // Smooth scroll to treatments
      const treatmentsSection = document.getElementById('treatments');
      if (treatmentsSection) {
        const headerOffset = 90;
        const elementPosition = treatmentsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // View All Treatments Button resets filter to all and scrolls to section
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      const allFilterBtn = document.getElementById('btn-filter-all');
      if (allFilterBtn) {
        allFilterBtn.click();
      }
      const list = document.getElementById('treatment-list');
      if (list) {
        list.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ==========================================================================
  // 4. FORM PRE-FILLING & PATIENT JOURNEY ROUTING
  // ==========================================================================
  const concernDropdown = document.getElementById('form-concern');

  // Helper function to direct user to the form and pre-fill concern
  function prefillConcernAndScroll(concernName) {
    if (concernDropdown) {
      // Find matching option in select
      let optionFound = false;
      for (let i = 0; i < concernDropdown.options.length; i++) {
        if (concernDropdown.options[i].value === concernName) {
          concernDropdown.selectedIndex = i;
          optionFound = true;
          break;
        }
      }
      
      // Fallback: If not exact, set to 'Other' or similar
      if (!optionFound) {
        concernDropdown.value = 'Other';
      }
    }
    
    // Smooth scroll to consultation card
    const consultationSection = document.getElementById('consultation');
    if (consultationSection) {
      const headerOffset = 90;
      const elementPosition = consultationSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Shift focus to form name for accessibility
      setTimeout(() => {
        document.getElementById('form-name').focus();
      }, 500);
    }
  }

  // Pathway triggers ("How Can We Help You Today?")
  const quickPathTriggers = document.querySelectorAll('.quick-path-trigger');
  quickPathTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const concern = btn.getAttribute('data-concern');
      prefillConcernAndScroll(concern);
    });
  });

  // Treatment card appointment CTAs
  const treatmentCTAs = document.querySelectorAll('.treatment-cta');
  treatmentCTAs.forEach(cta => {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const prefillVal = cta.getAttribute('data-prefill');
      prefillConcernAndScroll(prefillVal);
    });
  });

  // Doctor card consultation booking CTAs
  const docConsultationBtns = document.querySelectorAll('.book-doc-consultation');
  docConsultationBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const doctorName = btn.getAttribute('data-doc');
      
      // Auto-prefill the text area with doctor preference
      const messageField = document.getElementById('form-message');
      if (messageField) {
        messageField.value = `I would like to request a consultation with ${doctorName}.`;
      }
      
      // Determine probable concern
      if (doctorName.includes('Uroof')) {
        prefillConcernAndScroll('Dental Implant'); // Dr. Uroof MDS Oral Surgery
      } else {
        prefillConcernAndScroll('Smile Designing'); // Dr. Anil Cosmetic Dentistry
      }
    });
  });

  // Popular treatments trigger in footer
  const footerPrefillTriggers = document.querySelectorAll('.prefill-trigger');
  footerPrefillTriggers.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const treatment = link.getAttribute('data-treatment');
      prefillConcernAndScroll(treatment);
    });
  });

  // Dialog profiles expander helper
  const viewProfileBtns = document.querySelectorAll('.view-doc-profile');
  viewProfileBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = btn.getAttribute('data-doc');
      const doctorCard = document.getElementById(docId);
      
      // Toggle a visually highlighted expanded profile state
      if (doctorCard) {
        const list = doctorCard.querySelector('.doctor-expertise-list');
        if (list) {
          list.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          // Flash animation to show highlight
          doctorCard.style.boxShadow = '0 0 15px rgba(15, 164, 132, 0.4)';
          setTimeout(() => {
            doctorCard.style.boxShadow = '';
          }, 1500);
        }
      }
    });
  });

  // ==========================================================================
  // 5. CONSULTATION FORM VALIDATION & SUBMISSION
  // ==========================================================================
  const form = document.getElementById('clinic-consultation-form');
  const formContainer = document.getElementById('form-container');
  const successState = document.getElementById('form-success-state');
  const resetFormBtn = document.getElementById('btn-reset-form');

  // Input elements
  const inputName = document.getElementById('form-name');
  const inputPhone = document.getElementById('form-phone');
  const inputEmail = document.getElementById('form-email');
  const inputConcern = document.getElementById('form-concern');
  
  // Error elements
  const errorName = document.getElementById('name-error');
  const errorPhone = document.getElementById('phone-error');
  const errorEmail = document.getElementById('email-error');
  const errorConcern = document.getElementById('concern-error');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Run validation
      const isFormValid = validateForm();
      
      if (isFormValid) {
        submitConsultationForm();
      }
    });
  }

  function validateForm() {
    let isValid = true;
    
    // Validate Name
    if (inputName.value.trim() === '') {
      showError(inputName, errorName, 'Name is required');
      isValid = false;
    } else {
      hideError(inputName, errorName);
    }
    
    // Validate Phone (10+ digits, numbers, spaces, plus signs only)
    const phoneValue = inputPhone.value.trim();
    const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
    if (phoneValue === '') {
      showError(inputPhone, errorPhone, 'Phone number is required');
      isValid = false;
    } else if (!phoneRegex.test(phoneValue)) {
      showError(inputPhone, errorPhone, 'Please enter a valid 10-digit phone number');
      isValid = false;
    } else {
      hideError(inputPhone, errorPhone);
    }
    
    // Validate Email (optional, but if provided, must be valid)
    const emailValue = inputEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailValue !== '' && !emailRegex.test(emailValue)) {
      showError(inputEmail, errorEmail, 'Please enter a valid email address');
      isValid = false;
    } else {
      hideError(inputEmail, errorEmail);
    }
    
    // Validate Concern Dropdown
    if (inputConcern.value === '') {
      showError(inputConcern, errorConcern, 'Please select your primary concern');
      isValid = false;
    } else {
      hideError(inputConcern, errorConcern);
    }
    
    return isValid;
  }

  function showError(input, errorElement, message) {
    input.style.borderColor = 'red';
    input.setAttribute('aria-invalid', 'true');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  function showErrorForEvent(input, errorElement) {
    input.addEventListener('input', function handler() {
      if (input.value.trim() !== '') {
        hideError(input, errorElement);
        input.removeEventListener('input', handler);
      }
    });
  }

  function hideError(input, errorElement) {
    input.style.borderColor = '';
    input.removeAttribute('aria-invalid');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  // Clear errors when typing
  [inputName, inputPhone, inputEmail, inputConcern].forEach(input => {
    input.addEventListener('focus', () => {
      // Find the corresponding error span
      let errorSpan;
      if (input === inputName) errorSpan = errorName;
      if (input === inputPhone) errorSpan = errorPhone;
      if (input === inputEmail) errorSpan = errorEmail;
      if (input === inputConcern) errorSpan = errorConcern;
      
      hideError(input, errorSpan);
    });
  });

  // Simulated API post request
  function submitConsultationForm() {
    const submitBtn = document.getElementById('btn-submit-consultation');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Request...';
    
    // Gather details
    const formData = {
      name: inputName.value.trim(),
      phone: inputPhone.value.trim(),
      email: inputEmail.value.trim(),
      concern: inputConcern.value,
      date: document.getElementById('form-date').value,
      message: document.getElementById('form-message').value
    };
    
    console.log('Submitting Patient Consultation Request:', formData);
    
    // Simulate secure 1s network turnaround time
    setTimeout(() => {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      // Toggle display containers
      if (formContainer && successState) {
        formContainer.style.display = 'none';
        successState.classList.add('show');
        successState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 1200);
  }

  // Reset success state to form state
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      form.reset();
      
      // Hide success, show form container
      if (formContainer && successState) {
        successState.classList.remove('show');
        formContainer.style.display = 'block';
        
        // Scroll to form top
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
});
