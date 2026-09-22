const config = {
  name: 'Khushal Gehlot',
  email: '',
  location: 'India / working worldwide',
  formspreeEndpoint: '',
  socialLinks: { github: '', linkedin: '', instagram: '', youtube: '', x: '' }
};

const state = {
  routes: ['home', 'about', 'work', 'blog', 'testimonials', 'contact'],
  skills: ['Frontend Development', 'Responsive UI', 'JavaScript', 'Accessible Design', 'Product Thinking', 'Clean Systems'],
  projects: [
    { className: 'tile-1', category: 'Frontend', title: 'StudioNova Identity', description: 'A visual identity system and responsive landing page concept for a creative studio.', image: 'IMG_3426.JPG', imageAlt: 'Portrait photograph used as a creative portfolio visual', technologies: ['HTML', 'CSS', 'JavaScript'], goal: 'Create a confident digital home for a small creative studio.', process: 'Defined the visual direction, built reusable layout patterns, and tuned responsive states.', features: ['Responsive layout', 'Reusable visual tokens', 'Accessible navigation'], github: '', liveDemo: '' },
    { className: 'tile-2', category: 'Product UI', title: 'Finly Mobile UI', description: 'A calm personal-finance interface concept focused on clarity and quick daily decisions.', image: 'IMG_3161.JPG', imageAlt: 'Creative project photograph for the Finly interface concept', technologies: ['HTML', 'CSS', 'JavaScript'], goal: 'Make everyday money tracking feel approachable.', process: 'Mapped the core flow, designed key states, and implemented a mobile-first interface.', features: ['Mobile-first UI', 'Clear data hierarchy', 'Empty and active states'], github: '', liveDemo: '' },
    { className: 'tile-3', category: 'Content', title: 'Behind the Build', description: 'A content format for documenting design decisions, experiments, and the work behind the screen.', image: 'IMG_3154.JPG', imageAlt: 'Creative process photograph for Behind the Build', technologies: ['Content systems', 'Editing', 'Storytelling'], goal: 'Turn the making process into useful, honest content.', process: 'Outlined repeatable formats, created a visual rhythm, and documented the workflow.', features: ['Repeatable format', 'Process storytelling', 'Consistent visual language'], github: '', liveDemo: '' },
    { className: 'tile-4', category: 'Web', title: 'Portfolio Redesign', description: 'This portfolio: a lightweight single-page experience with accessible navigation and an editable data layer.', image: 'IMG_2225.JPG', imageAlt: 'Portfolio workspace photograph', technologies: ['HTML', 'CSS', 'JavaScript'], goal: 'Build a personal site that is easy to update and pleasant to explore.', process: 'Separated styles, centralized content, and added responsive interaction patterns.', features: ['Hash navigation', 'Theme persistence', 'Case-study modal', 'Reduced-motion support'], github: '', liveDemo: '' },
    { className: 'tile-5', category: 'Campaign', title: 'Launch Week Content', description: 'A short-form content system designed to keep a product launch coherent across several posts.', technologies: ['Content strategy', 'Visual design', 'Editing'], goal: 'Create a clear narrative across a fast launch schedule.', process: 'Grouped the story into stages, created a repeatable template, and refined the publishing rhythm.', features: ['Content framework', 'Campaign consistency', 'Fast production workflow'], github: '', liveDemo: '' },
    { className: 'tile-6', category: 'Tooling', title: 'CLI Helper', description: 'A small developer-tool concept focused on removing repetitive setup steps from daily work.', technologies: ['JavaScript', 'Node.js'], goal: 'Make a repetitive developer workflow shorter and easier to remember.', process: 'Identified the repeated path, shaped a small command surface, and tested edge cases.', features: ['Focused commands', 'Clear feedback', 'Expandable structure'], github: '', liveDemo: '' },
    { className: 'tile-7', category: 'Systems', title: 'Aster Design System', description: 'A component foundation for keeping a growing product interface consistent and flexible.', technologies: ['CSS', 'Accessibility', 'Documentation'], goal: 'Give a small team shared patterns without slowing them down.', process: 'Audited repeated UI, defined tokens, and documented behavior rather than only appearance.', features: ['Design tokens', 'Component states', 'Usage documentation'], github: '', liveDemo: '' }
  ],
  posts: [],
  testimonials: []
};

const root = document.documentElement;
const nav = document.querySelector('#navLinks');
const menuButton = document.querySelector('#menuBtn');
const themeButton = document.querySelector('#themeToggle');
const navButtons = [...document.querySelectorAll('[data-page]')];
const pages = [...document.querySelectorAll('.page')];

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
  state.skills.concat(state.skills).forEach((skill, index) => {
    addText(track, 'span', skill, index % state.skills.length % 2 === 0 ? 'pop' : '');
  });
}

function renderTiles(container, projects) {
  projects.forEach((project, index) => {
    const tile = document.createElement('article');
    tile.className = `tile ${project.className}`;
    tile.tabIndex = 0;
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', `View case study: ${project.title}`);
    if (project.image) {
      const image = document.createElement('img');
      image.className = 'tile-image';
      image.src = project.image;
      image.alt = project.imageAlt;
      image.loading = 'lazy';
      image.addEventListener('error', () => image.remove());
      tile.append(image);
    }
    addText(tile, 'span', project.category, 'tag');
    addText(tile, 'span', String(index + 1).padStart(2, '0'), 'tile-index').setAttribute('aria-hidden', 'true');
    addText(tile, 'h3', project.title);
    addText(tile, 'p', project.description);
    addText(tile, 'span', '->', 'tile-arrow').setAttribute('aria-hidden', 'true');
    const open = () => openCaseStudy(project);
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
    container.append(tile);
  });
}

function renderPosts() {
  const list = document.querySelector('#postList');
  if (!state.posts.length) {
    addText(list, 'p', 'New notes on development and product work are coming soon.', 'empty-state');
    return;
  }
  state.posts.forEach((post) => {
    const item = document.createElement('article');
    item.className = 'post';
    addText(item, 'span', post.date, 'date');
    const content = document.createElement('div');
    addText(content, 'h3', post.title);
    addText(content, 'p', `${post.excerpt} ${post.category} / ${post.readingTime}`);
    item.append(content);
    addText(item, 'span', 'Coming soon', 'post-link');
    list.append(item);
  });
}

function renderTestimonials() {
  const list = document.querySelector('#testiRow');
  if (!state.testimonials.length) {
    addText(list, 'p', 'Verified feedback will appear here as projects are completed.', 'empty-state');
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
}

function renderSocials() {
  const labels = { github: 'GitHub', linkedin: 'LinkedIn', instagram: 'Instagram', youtube: 'YouTube', x: 'X / Twitter' };
  document.querySelectorAll('.social-strip[id]').forEach((container) => {
    Object.entries(config.socialLinks).forEach(([key, url]) => {
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', labels[key]);
      link.textContent = key === 'linkedin' ? 'in' : key === 'x' ? 'X' : key.slice(0, 2).toUpperCase();
      container.append(link);
    });
    if (!container.children.length) container.hidden = true;
  });
}

function renderContact() {
  const card = document.querySelector('#contactEmailCard');
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

function openCaseStudy(project) {
  const dialog = document.querySelector('#caseStudy');
  const content = document.querySelector('#caseStudyContent');
  content.replaceChildren();
  const wrapper = document.createElement('div');
  wrapper.className = 'case-study-content';
  addText(wrapper, 'p', project.category, 'kicker');
  addText(wrapper, 'h2', project.title).id = 'caseStudyTitle';
  if (project.image) {
    const image = document.createElement('img');
    image.className = 'case-study-image';
    image.src = project.image;
    image.alt = project.imageAlt;
    image.loading = 'lazy';
    image.addEventListener('error', () => image.remove());
    wrapper.append(image);
  }
  addText(wrapper, 'p', project.description);
  addText(wrapper, 'h3', 'Goal');
  addText(wrapper, 'p', project.goal);
  addText(wrapper, 'h3', 'Process');
  addText(wrapper, 'p', project.process);
  addText(wrapper, 'h3', 'Tools and technologies');
  const techList = document.createElement('div');
  techList.className = 'tech-list';
  project.technologies.forEach((technology) => addText(techList, 'span', technology));
  wrapper.append(techList);
  addText(wrapper, 'h3', 'Key features');
  addText(wrapper, 'p', project.features.join(' / '));
  const actions = document.createElement('div');
  actions.className = 'case-actions';
  createLink(actions, 'GitHub', project.github);
  createLink(actions, 'Live demo', project.liveDemo, 'btn btn-primary');
  wrapper.append(actions);
  content.append(wrapper);
  dialog.showModal();
  dialog.querySelector('.case-close').focus();
}

function setMenu(open) {
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
  document.querySelector(`#page-${nextRoute}`).focus({ preventScroll: true });
}

function setTheme(theme) {
  const dark = theme === 'dark';
  if (dark) root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}

function initTheme() {
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('kg-theme') || 'light'; } catch (error) { /* Storage can be unavailable in privacy mode. */ }
  setTheme(savedTheme);
  themeButton.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try { localStorage.setItem('kg-theme', nextTheme); } catch (error) { /* Keep the toggle usable without storage. */ }
  });
}

function initNavigation() {
  navButtons.forEach((button) => button.addEventListener('click', () => showPage(button.dataset.page)));
  document.querySelectorAll('[data-nav]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showPage(link.dataset.nav);
  }));
  document.querySelector('.brand').addEventListener('click', (event) => {
    event.preventDefault();
    showPage('home');
  });
  menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { setMenu(false); document.querySelector('#caseStudy')?.close(); }
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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending...';
    if (!config.formspreeEndpoint) {
      status.textContent = 'The form is ready. Add your Formspree endpoint in js/app.js to receive messages.';
      button.disabled = false;
      button.textContent = 'Send message';
      return;
    }
    try {
      const response = await fetch(config.formspreeEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Submission failed');
      status.textContent = 'Thanks! Your message has been sent successfully.';
      form.reset();
    } catch (error) {
      status.textContent = 'Something went wrong. Please try again or use email.';
    } finally { button.disabled = false; button.textContent = 'Send message'; }
  });
}

function initEnhancements() {
  document.querySelector('.case-close').addEventListener('click', () => document.querySelector('#caseStudy').close());
  document.querySelector('#caseStudy').addEventListener('click', (event) => { if (event.target === event.currentTarget) event.currentTarget.close(); });
  document.querySelector('.back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('revealed')), { threshold: 0.12 });
  document.querySelectorAll('.tile, .testi-card, .post').forEach((element) => { element.classList.add('reveal'); observer.observe(element); });
}

function init() {
  initTheme();
  initNavigation();
  renderHeroTitle();
  renderMarquee();
  renderTiles(document.querySelector('#homeWorkPreview'), state.projects.slice(0, 4));
  renderTiles(document.querySelector('#workGridFull'), state.projects);
  renderPosts();
  renderTestimonials();
  renderSocials();
  renderContact();
  initForm();
  initEnhancements();
}

document.addEventListener('DOMContentLoaded', init, { once: true });
