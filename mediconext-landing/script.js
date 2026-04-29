document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      const icon = hamburger.querySelector('i');
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    });
  });

  // Navbar Scroll Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Fade-in Animation on Scroll
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const fadeObserverOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, fadeObserverOptions);

  fadeElements.forEach(element => {
    fadeObserver.observe(element);
  });

  // Stats Counter Animation
  const counters = document.querySelectorAll('.counter');
  const counterSuffixes = document.querySelectorAll('.counter-suffix');
  const speed = 200; // lower is faster

  const startCounter = (counter, isFloat = false) => {
    const target = +counter.getAttribute('data-target');
    const updateCount = () => {
      const count = isFloat ? parseFloat(counter.innerText) : parseInt(counter.innerText);
      const inc = target / speed;

      if (count < target) {
        let newCount = count + inc;
        if (isFloat) {
          // keep one decimal place
          counter.innerText = (newCount > target ? target : newCount).toFixed(1) + '%';
        } else {
          counter.innerText = Math.ceil(newCount) + (target >= 1000 ? '+' : '');
        }
        setTimeout(updateCount, 10);
      } else {
        counter.innerText = target + (isFloat ? '%' : (target >= 1000 ? '+' : ''));
      }
    };
    updateCount();
  };

  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    let countersStarted = false;
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(counter => startCounter(counter, false));
        counterSuffixes.forEach(counter => startCounter(counter, true));
      }
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
  }
});
