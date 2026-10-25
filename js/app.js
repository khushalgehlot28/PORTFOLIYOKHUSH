// Global API helper resolving relative or configurable host endpoints
window.API_BASE_URL = window.API_BASE_URL || window.location.origin;
window.apiUrl = function(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${window.API_BASE_URL}${cleanPath}`;
};

const config = {
  name: 'Khushal Gehlot',
  email: 'khushalgehlot28@gmail.com',
  location: 'India / working worldwide',
  socialLinks: { 
    github: 'https://github.com/khushalgehlot28', 
    linkedin: 'https://www.linkedin.com/in/khushal-gehlot-68a2162ba/', 
    instagram: 'https://www.instagram.com/khushalgehlot28/', 
    youtube: '', 
    x: 'https://x.com/I_am_strnger_ji',
    facebook: 'https://www.facebook.com/khushal.gehlot.33'
  }
};

const state = {
  routes: ['home', 'about', 'work', 'blog', 'testimonials', 'contact'],
  skills: ['Frontend Development', 'Responsive UI', 'JavaScript', 'Accessible Design', 'Product Thinking', 'Clean Systems'],
  projects: [], // Replaced with live DB fetch
  posts: [],    // Replaced with live DB fetch
  testimonials: []
};

const nav = document.querySelector('#navLinks');
const menuButton = document.querySelector('#menuBtn');
const navButtons = [...document.querySelectorAll('[data-page]')];
const pages = [...document.querySelectorAll('.page')];
let dialogTrigger = null;

function addText(parent, tagName, text, className = '') {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderHeroTitle() {
  document.querySelectorAll('#heroTitle .word').forEach((word, wordIndex) => {
    [...word.dataset.word].forEach((letter, letterIndex) => {
      const element = addText(word, 'span', letter, 'letter');
      element.style.animationDelay = `${wordIndex * 0.4 + letterIndex * 0.045}s`;
    });
  });
}

function renderMarquee() {
  const track = document.querySelector('#marqueeTrack');
  if (!track) return;
  state.skills.concat(state.skills).forEach((skill, index) => {
    addText(track, 'span', skill, index % state.skills.length % 2 === 0 ? 'pop' : '');
  });
}

function renderTiles(container, projects) {
  if (!container) return;
  projects.forEach((project, index) => {
    const tile = document.createElement('article');
    const gridClass = project.className || `tile-${(index % 7) + 1}`;
    tile.className = `tile ${gridClass}`;
    tile.tabIndex = 0;
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', `View case study: ${project.title}`);
    
    // Render project image if available
    if (project.image) {
      const img = document.createElement('img');
      img.className = 'tile-image';
      img.src = project.image;
      img.alt = project.title;
      img.loading = 'lazy';
      tile.append(img);
    }

    addText(tile, 'span', project.category, 'tag');
    addText(tile, 'span', String(index + 1).padStart(2, '0'), 'tile-index').setAttribute('aria-hidden', 'true');
    addText(tile, 'h3', project.title);
    addText(tile, 'p', project.description);
    addText(tile, 'span', '->', 'tile-arrow').setAttribute('aria-hidden', 'true');
    const open = () => openCaseStudy(project, tile);
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
    container.append(tile);
  });
  container.classList.remove('is-loading');
  container.setAttribute('aria-busy', 'false');
}

function renderWorkFilters() {
  const filterBar = document.querySelector('#workFilters');
  if (!filterBar || !state.projects.length) return;
  const categories = ['All', ...new Set(state.projects.map((project) => project.category))];
  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-button${index === 0 ? ' active' : ''}`;
    button.textContent = category;
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-button').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const filteredProjects = category === 'All'
        ? state.projects
        : state.projects.filter((project) => project.category === category);
      const workGrid = document.querySelector('#workGridFull');
      workGrid.replaceChildren();
      renderTiles(workGrid, filteredProjects);
      initRevealObserver(workGrid);
    });
    filterBar.append(button);
  });
}

function renderPosts() {
  const list = document.querySelector('#postList');
  if (!list) return;
  if (!state.posts || !state.posts.length) {
    list.innerHTML = '';
    const emptyState = addText(list, 'div', '', 'empty-state');
    addText(emptyState, 'h3', 'Writing is taking shape.');
    addText(emptyState, 'p', 'I am collecting practical notes on frontend development, interface decisions, and the process behind the work.');
    const link = document.createElement('a');
    link.className = 'btn btn-ghost';
    link.href = '#work';
    link.dataset.nav = 'work';
    link.textContent = 'Explore the work ->';
    emptyState.append(link);
    list.classList.remove('is-loading');
    list.setAttribute('aria-busy', 'false');
    link.addEventListener('click', (event) => { event.preventDefault(); showPage('work'); });
    return;
  }
  list.innerHTML = ''; 
  state.posts.forEach((post) => {
    const item = document.createElement('article');
    item.className = 'post';
    if (post.image) {
      const image = document.createElement('img');
      image.className = 'post-image';
      image.src = post.image;
      image.alt = post.imageAlt || post.title;
      image.loading = 'lazy';
      image.decoding = 'async';
      item.append(image);
    }
    addText(item, 'span', post.date || new Date().toLocaleDateString(), 'date');
    const content = document.createElement('div');
    addText(content, 'h3', post.title);
    addText(content, 'p', `${post.excerpt} — ${post.category} / ${post.readingTime}`);
    item.append(content);
    addText(item, 'span', 'Read experience', 'post-link');
    list.append(item);
  });
  list.classList.remove('is-loading');
  list.setAttribute('aria-busy', 'false');
}

function renderTestimonials() {
  const list = document.querySelector('#testiRow');
  if (!list) return;
  if (!state.testimonials.length) {
    const emptyState = addText(list, 'div', '', 'empty-state');
    addText(emptyState, 'h3', 'The work comes first.');
    addText(emptyState, 'p', 'Verified feedback will be added as collaborations become public.');
    const link = document.createElement('a');
    link.className = 'btn btn-primary';
    link.href = '#contact';
    link.dataset.nav = 'contact';
    link.textContent = 'Start a conversation ->';
    emptyState.append(link);
    list.classList.remove('is-loading');
    list.setAttribute('aria-busy', 'false');
    link.addEventListener('click', (event) => { event.preventDefault(); showPage('contact'); });
    return;
  }
  state.testimonials.forEach((testimonial) => {
    const card = document.createElement('article');
    card.className = 'testi-card';
    addText(card, 'p', `"${testimonial.quote}"`, 'quote');
    const person = document.createElement('div');
    person.className = 'testi-who';
    const avatar = document.createElement('div');
    avatar.className = 'testi-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    const identity = document.createElement('div');
    addText(identity, 'b', testimonial.name);
    addText(identity, 'span', testimonial.role);
    person.append(avatar, identity);
    card.append(person);
    list.append(card);
  });
  list.classList.remove('is-loading');
  list.setAttribute('aria-busy', 'false');
}

function renderSocials() {
  const icons = {
    github: {
      label: 'GitHub',
      path: 'M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.85.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.24 9.24 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.93.68 1.88v2.79c0 .27.18.59.69.49A10.27 10.27 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z'
    },
    linkedin: {
      label: 'LinkedIn',
      path: 'M5.2 7.8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3.5 9.3h3.4v11.2H3.5zM9 9.3h3.3v1.5h.1a3.6 3.6 0 0 1 3.2-1.8c3.4 0 4 2.2 4 5v6.5h-3.4v-5.8c0-1.4 0-3.2-2-3.2s-2.2 1.5-2.2 3.1v5.9H9z'
    },
    instagram: {
      label: 'Instagram',
      path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z'
    },
    facebook: {
      label: 'Facebook',
      path: 'M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.5 1.6-1.5h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4Z'
    },
    youtube: {
      label: 'YouTube',
      path: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z'
    },
    x: {
      label: 'X / Twitter',
      path: 'M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-7.1L5.7 22H2.5l7.3-8.4L1.9 2h6.5l4.5 6.5L18.9 2Zm-1.1 18h1.7L7.4 3.9H5.6L17.8 20Z'
    }
  };
  document.querySelectorAll('.social-strip[id]').forEach((container) => {
    container.replaceChildren();
    Object.entries(config.socialLinks).forEach(([key, url]) => {
      if (!url) return;
      const icon = icons[key];
      if (!icon) return;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', icon.label);
      link.title = icon.label;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', icon.path);
      path.setAttribute('fill', 'currentColor');
      svg.append(path);
      link.append(svg);
      container.append(link);
    });
    if (!container.children.length) container.hidden = true;
    else container.hidden = false;
  });
}

function renderContact() {
  const card = document.querySelector('#contactEmailCard');
  if (!card) return;
  if (!config.email) { card.hidden = true; return; }
  addText(card, 'p', 'Prefer email?');
  const title = addText(card, 'h3', '');
  const link = document.createElement('a');
  link.href = `mailto:${config.email}`;
  link.textContent = config.email;
  title.append(link);
}

function createLink(parent, label, url, className = 'btn btn-ghost') {
  if (!url) return;
  const link = document.createElement('a');
  link.className = className;
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  parent.append(link);
}

function closeCaseStudy() {
  const dialog = document.querySelector('#caseStudy');
  const trigger = dialogTrigger;
  dialogTrigger = null;
  if (dialog && dialog.open) dialog.close();
  setTimeout(() => trigger?.focus(), 0);
}

function openCaseStudy(project, trigger) {
  const dialog = document.querySelector('#caseStudy');
  const content = document.querySelector('#caseStudyContent');
  if (!dialog || !content) return;
  dialogTrigger = trigger;
  content.replaceChildren();
  const wrapper = document.createElement('div');
  wrapper.className = 'case-study-content';
  addText(wrapper, 'p', project.category, 'kicker');
  addText(wrapper, 'h2', project.title).id = 'caseStudyTitle';
  if (project.image) {
    const image = document.createElement('img');
    image.className = 'case-study-image';
    image.src = project.image;
    image.alt = project.imageAlt || project.title;
    image.width = project.imageWidth || 800;
    image.height = project.imageHeight || 600;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => image.remove());
    wrapper.append(image);
  }
  addText(wrapper, 'p', project.description);
  
  if (project.goal) {
    addText(wrapper, 'h3', 'Goal');
    addText(wrapper, 'p', project.goal);
  }
  if (project.process) {
    addText(wrapper, 'h3', 'Process');
    addText(wrapper, 'p', project.process);
  }
  if (project.technologies && project.technologies.length) {
    addText(wrapper, 'h3', 'Tools and technologies');
    const techList = document.createElement('div');
    techList.className = 'tech-list';
    project.technologies.forEach((technology) => addText(techList, 'span', technology));
    wrapper.append(techList);
  }
  if (project.features && project.features.length) {
    addText(wrapper, 'h3', 'Key features');
    addText(wrapper, 'p', project.features.join(' / '));
  }
  
  const actions = document.createElement('div');
  actions.className = 'case-actions';
  createLink(actions, 'GitHub', project.github);
  createLink(actions, 'Live demo', project.liveDemo, 'btn btn-primary');
  wrapper.append(actions);
  content.append(wrapper);
  dialog.showModal();
  dialog.querySelector('.case-close')?.focus();
}

function setMenu(open) {
  if (!nav || !menuButton) return;
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

function showPage(route, updateHash = true) {
  const nextRoute = state.routes.includes(route) ? route : 'home';
  pages.forEach((page) => {
    const active = page.id === `page-${nextRoute}`;
    page.classList.toggle('active', active);
    page.setAttribute('aria-hidden', String(!active));
  });
  navButtons.forEach((button) => {
    const active = button.dataset.page === nextRoute;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  setMenu(false);
  if (updateHash && history.replaceState) history.replaceState(null, '', `#${nextRoute}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
  const targetPage = document.querySelector(`#page-${nextRoute}`);
  targetPage?.focus({ preventScroll: true });
}

function initNavigation() {
  navButtons.forEach((button) => button.addEventListener('click', () => showPage(button.dataset.page)));
  document.querySelectorAll('[data-nav]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showPage(link.dataset.nav);
  }));
  document.querySelector('.brand')?.addEventListener('click', (event) => {
    event.preventDefault();
    showPage('home');
  });
  menuButton?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('click', (event) => {
    if (nav?.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenu(false);
      if (document.querySelector('#caseStudy')?.open) {
        event.preventDefault();
        closeCaseStudy();
      }
    }
    if (!event.target.matches('[role="tab"]')) return;
    const index = navButtons.indexOf(event.target);
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % navButtons.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + navButtons.length) % navButtons.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = navButtons.length - 1;
    if (nextIndex !== index) {
      event.preventDefault();
      navButtons[nextIndex].focus();
      showPage(navButtons[nextIndex].dataset.page);
    }
  });
  window.addEventListener('hashchange', () => showPage(location.hash.slice(1), false));
  showPage(location.hash.slice(1) || 'home', false);
}

function initForm() {
  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#contactStatus');
  const errors = document.querySelector('#formErrors');

  if (!form) return;

  function clearFormErrors() {
    if (errors) errors.replaceChildren();
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach((message) => message.remove());
  }

  function showFormErrors(formErrors = []) {
    clearFormErrors();
    const messages = Array.isArray(formErrors) ? formErrors : [];
    messages.forEach(({ field, message }) => {
      const input = field ? form.elements[field] : null;
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        const messageElement = document.createElement('span');
        messageElement.className = 'field-error';
        messageElement.textContent = message;
        input.closest('.field')?.append(messageElement);
      }
    });
    const generalMessages = messages.filter(({ field }) => !field).map(({ message }) => message);
    if (generalMessages.length && errors) addText(errors, 'p', generalMessages.join(' '));
    if (status) status.textContent = 'Please review the highlighted fields and try again.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) { 
      form.reportValidity(); 
      return; 
    }

    // Fixed Honeypot Check
    const honeypotField = form.elements.website;
    if (honeypotField && honeypotField.value.trim() !== '') {
      console.warn('Submission cancelled by honeypot spam filter.');
      if (status) status.textContent = 'Spam filter triggered. Please try again.';
      return;
    }

    clearFormErrors();
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }

    const rawFormData = new FormData(form);
    const payload = {
      name: rawFormData.get('name') || '',
      email: rawFormData.get('email') || '',
      subject: rawFormData.get('subject') || '',
      projectType: rawFormData.get('projectType') || '',
      timeline: rawFormData.get('timeline') || 'Not sure yet',
      message: rawFormData.get('message') || ''
    };

    try {
      const response = await fetch(window.apiUrl('/api/submit'), {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        }, 
        body: JSON.stringify(payload) 
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        showFormErrors(result.errors || [{ message: result.error || 'The message could not be sent.' }]);
        return;
      }

      if (status) status.textContent = 'Thanks! Your message has been saved successfully.';
      form.reset();
      clearFormErrors();
    } catch (error) {
      console.error('Fetch error:', error);
      if (status) status.textContent = 'Something went wrong. Please try again or use email.';
    } finally { 
      if (button) {
        button.disabled = false; 
        button.textContent = 'Send message'; 
      }
    }
  });
}

function initRevealObserver(scope = document) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('revealed')), { threshold: 0.12 });
  scope.querySelectorAll('.tile, .testi-card, .post').forEach((element) => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

function initEnhancements() {
  const dialog = document.querySelector('#caseStudy');
  if (dialog) {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dialog.open) {
        event.preventDefault();
        closeCaseStudy();
      }
    }, true);
    dialog.querySelector('.case-close')?.addEventListener('click', closeCaseStudy);
    dialog.addEventListener('close', () => {
      dialogTrigger = null;
    });
    dialog.addEventListener('click', (event) => { if (event.target === event.currentTarget) closeCaseStudy(); });
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeCaseStudy(); });
  }
  document.querySelector('.back-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  initRevealObserver();
}

// -----------------------------------------------------
// DATABASE FETCHING LOGIC (PROJECTS & BLOGS)
// -----------------------------------------------------
async function loadLiveProjects() {
  try {
    const response = await fetch(window.apiUrl('/api/projects'));
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        state.projects = data; 
        const homeGrid = document.querySelector('#homeWorkPreview');
        const workGrid = document.querySelector('#workGridFull');
        if (homeGrid) { homeGrid.replaceChildren(); renderTiles(homeGrid, state.projects.slice(0, 4)); }
        if (workGrid) { workGrid.replaceChildren(); renderTiles(workGrid, state.projects); }
        const filterBar = document.querySelector('#workFilters');
        if (filterBar) { filterBar.replaceChildren(); renderWorkFilters(); }
      }
    }
  } catch (error) { console.error("Could not load database projects.", error); }
}

async function loadLivePosts() {
  try {
    const response = await fetch(window.apiUrl('/api/posts'));
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        state.posts = data; 
        const postList = document.querySelector('#postList');
        if (postList) { postList.replaceChildren(); renderPosts(); }
      }
    }
  } catch (error) { console.error("Could not load database posts.", error); }
}

function init() {
  initNavigation();
  renderHeroTitle();
  renderMarquee();
  
  // Triggers API pulls to populate your CMS content
  loadLiveProjects();
  loadLivePosts();
  
  renderTestimonials();
  renderSocials();
  renderContact();
  initForm();
  initEnhancements();
}

document.addEventListener('DOMContentLoaded', init, { once: true });