const providers = [
  { name: 'Emma R.', initials: 'ER', service: 'Babysitting', price: '$18/hr', rating: '4.9', reviews: 42, badges: ['ID verified', 'Care Plus'], desc: 'Evening and weekend babysitting, homework help, and date-night care.', avatar: 'avatar-a' },
  { name: 'Marcus T.', initials: 'MT', service: 'Lawn care', price: '$35/job', rating: '4.8', reviews: 31, badges: ['ID verified'], desc: 'Mowing, edging, leaf cleanup, and basic yard maintenance for local homes.', avatar: 'avatar-b' },
  { name: 'Sofia L.', initials: 'SL', service: 'House cleaning', price: '$28/hr', rating: '5.0', reviews: 27, badges: ['ID verified'], desc: 'Detailed home cleaning with recurring, move-out, and deep-clean options.', avatar: 'avatar-c' },
  { name: 'Jordan P.', initials: 'JP', service: 'Pet care', price: '$16/visit', rating: '4.9', reviews: 55, badges: ['ID verified'], desc: 'Dog walking, drop-ins, feeding, and weekend pet sitting for cats and dogs.', avatar: 'avatar-d' },
  { name: 'Daniel K.', initials: 'DK', service: 'Tutoring', price: '$24/hr', rating: '4.8', reviews: 19, badges: ['ID verified'], desc: 'Math and science tutoring for middle-school and high-school students.', avatar: 'avatar-b' },
  { name: 'Avery & Co.', initials: 'AC', service: 'Moving help', price: '$45/hr', rating: '4.7', reviews: 36, badges: ['Business verified'], desc: 'Local loading, unloading, furniture moving, and small apartment moves.', avatar: 'avatar-a' },
  { name: 'Chris M.', initials: 'CM', service: 'Handyman', price: '$42/hr', rating: '4.9', reviews: 48, badges: ['ID verified'], desc: 'Furniture assembly, wall mounting, minor repairs, and odd jobs around the house.', avatar: 'avatar-c' },
  { name: 'Nina B.', initials: 'NB', service: 'Errands', price: '$20/hr', rating: '4.9', reviews: 21, badges: ['ID verified'], desc: 'Grocery pickup, pharmacy runs, returns, local delivery, and everyday errands.', avatar: 'avatar-d' },
  { name: 'WashWorks', initials: 'WW', service: 'Car washing', price: '$55/car', rating: '4.8', reviews: 63, badges: ['Business verified'], desc: 'Mobile exterior wash, interior refresh, and full-detail packages at your home.', avatar: 'avatar-b' },
  { name: 'Maya C.', initials: 'MC', service: 'Photography', price: '$125/session', rating: '5.0', reviews: 16, badges: ['ID verified'], desc: 'Family mini-sessions, events, portraits, and simple real-estate photography.', avatar: 'avatar-a' }
];

const providerGrid = document.getElementById('providerGrid');
const emptyState = document.getElementById('emptyState');
const locationPill = document.getElementById('locationPill');
const serviceInput = document.getElementById('serviceInput');
const locationInput = document.getElementById('locationInput');

function badgeHtml(badge) {
  return `<span class="badge ${badge === 'Care Plus' ? 'care' : ''}">${badge === 'Care Plus' ? '🛡️ ' : '✓ '}${badge}</span>`;
}

function renderProviders(list = providers.slice(0, 6)) {
  providerGrid.innerHTML = list.map((p, i) => `
    <article class="provider-card">
      <div class="provider-top">
        <div class="avatar ${p.avatar}">${p.initials}</div>
        <div>
          <h3>${p.name}</h3>
          <div class="provider-service">${p.service}</div>
          <div class="stars">★★★★★ <span>${p.rating} (${p.reviews})</span></div>
        </div>
      </div>
      <div class="provider-meta">${p.badges.map(badgeHtml).join('')}</div>
      <p class="provider-desc">${p.desc}</p>
      <div class="provider-bottom">
        <div class="provider-rate"><small>Starting at</small><strong>${p.price}</strong></div>
        <button class="card-btn" data-profile="${providers.indexOf(p)}">View profile</button>
      </div>
    </article>
  `).join('');
  emptyState.classList.toggle('hidden', list.length > 0);
  providerGrid.classList.toggle('hidden', list.length === 0);
}
renderProviders();

function searchProviders(service, location) {
  const query = service.trim().toLowerCase();
  let list = providers;
  if (query) {
    list = providers.filter(p => p.service.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
  }
  renderProviders(list);
  document.querySelector('.providers-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (location.trim()) locationPill.textContent = `📍 Showing prototype results near ${location.trim()}`;
  else locationPill.textContent = query ? `🔎 Results for “${service.trim()}”` : '📍 Showing example listings';
}

document.getElementById('heroSearch').addEventListener('submit', e => {
  e.preventDefault();
  searchProviders(serviceInput.value, locationInput.value);
});

document.getElementById('footerSearch').addEventListener('submit', e => {
  e.preventDefault();
  const value = document.getElementById('footerService').value;
  serviceInput.value = value;
  searchProviders(value, locationInput.value);
});

document.getElementById('categoryGrid').addEventListener('click', e => {
  const card = e.target.closest('[data-category]');
  if (!card) return;
  serviceInput.value = card.dataset.category;
  searchProviders(card.dataset.category, locationInput.value);
});

document.getElementById('showAllBtn').addEventListener('click', e => {
  const extras = [...document.querySelectorAll('.extra-category')];
  const opening = extras.some(x => x.classList.contains('hidden'));
  extras.forEach(x => x.classList.toggle('hidden', !opening));
  e.currentTarget.textContent = opening ? 'Show fewer services ↑' : 'View all services →';
});

const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');
function openModal(type, payload) {
  if (type === 'provider') {
    modalContent.innerHTML = `
      <span class="kicker">Provider signup</span>
      <h2>Offer a service locally</h2>
      <p>This prototype collects the core information a provider would use to create a listing.</p>
      <form class="form-grid" id="providerForm">
        <label>Full name or business name<input required placeholder="Your name"></label>
        <label>Service category<select required><option value="">Choose one</option><option>Babysitting</option><option>Lawn care</option><option>House cleaning</option><option>Pet care</option><option>Tutoring</option><option>Moving help</option><option>Handyman</option><option>Other</option></select></label>
        <label>City or ZIP<input required placeholder="Where do you work?"></label>
        <label>Starting price<input required placeholder="Example: $25/hr"></label>
        <label>About your service<textarea rows="4" placeholder="What do you offer?"></textarea></label>
        <div class="form-note">For a real launch, identity checks, payment setup, terms, and category-specific screening would be added before a listing can go live.</div>
        <button class="primary-btn" type="submit">Create provider profile</button>
      </form>`;
  } else if (type === 'signin') {
    modalContent.innerHTML = `
      <span class="kicker">Welcome back</span>
      <h2>Sign in to LocalNest</h2>
      <p>Save providers, message local pros, and keep your bookings in one place.</p>
      <form class="form-grid" id="signinForm">
        <label>Email<input required type="email" placeholder="you@example.com"></label>
        <label>Password<input required type="password" placeholder="••••••••"></label>
        <button class="primary-btn" type="submit">Sign in</button>
      </form>`;
  } else if (type === 'profile') {
    const p = providers[payload];
    modalContent.innerHTML = `
      <span class="kicker">Local provider</span>
      <div class="provider-top" style="margin-top:14px">
        <div class="avatar ${p.avatar}">${p.initials}</div>
        <div><h2 style="margin:0;font-size:28px">${p.name}</h2><div class="provider-service">${p.service}</div><div class="stars">★★★★★ <span>${p.rating} (${p.reviews} reviews)</span></div></div>
      </div>
      <div class="provider-meta" style="margin-top:20px">${p.badges.map(badgeHtml).join('')}</div>
      <p>${p.desc}</p>
      <div class="form-note">Prototype note: profile content, price, availability, badges, and reviews are fictional examples for demonstrating the marketplace experience.</div>
      <form class="form-grid" id="bookingForm">
        <label>Requested date<input required type="date"></label>
        <label>Message<textarea rows="3" placeholder="Tell ${p.name} what you need help with."></textarea></label>
        <button class="primary-btn" type="submit">Request booking · ${p.price}</button>
      </form>`;
  }
  modalBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
  document.body.style.overflow = '';
}

document.body.addEventListener('click', e => {
  const open = e.target.closest('[data-open]');
  if (open) openModal(open.dataset.open);
  const profile = e.target.closest('[data-profile]');
  if (profile) openModal('profile', Number(profile.dataset.profile));
});

document.getElementById('modalClose').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

modalContent.addEventListener('submit', e => {
  e.preventDefault();
  modalContent.innerHTML = `<div class="success-box"><div class="big-check">✓</div><h2>Prototype action completed</h2><p>This is where the real website would save the information to the database and continue the workflow.</p><button class="primary-btn" onclick="document.getElementById('modalClose').click()">Done</button></div>`;
});

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});
document.querySelectorAll('#mobileMenu a').forEach(a => a.addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('open')));

// Step 1: Post a Job prototype
const defaultJobs = [
  { id: 'demo-1', service: 'Lawn care', location: 'Local area', timing: 'This weekend', budget: '$45 fixed', desc: 'Front and back yard mowing plus light edging. Standard-size residential lot.', owner: 'Demo request', demo: true },
  { id: 'demo-2', service: 'Babysitting', location: 'Local area', timing: 'Friday evening', budget: '$20/hr', desc: 'Looking for date-night care for two children for about four hours.', owner: 'Demo request', demo: true },
  { id: 'demo-3', service: 'House cleaning', location: 'Local area', timing: 'Next week', budget: '$120 fixed', desc: 'One-time cleaning for a two-bedroom home, including kitchen and bathrooms.', owner: 'Demo request', demo: true }
];

function getSavedJobs() {
  try {
    return JSON.parse(localStorage.getItem('localnestPostedJobs') || '[]');
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  localStorage.setItem('localnestPostedJobs', JSON.stringify(jobs));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function renderJobs() {
  const jobGrid = document.getElementById('jobGrid');
  if (!jobGrid) return;
  const saved = getSavedJobs();
  const jobs = [...saved, ...defaultJobs];
  jobGrid.innerHTML = jobs.map(job => `
    <article class="job-card ${job.demo ? '' : 'user-posted'}">
      <div class="job-card-top">
        <div class="job-service">${escapeHtml(job.service)}</div>
        <span class="job-status">Open</span>
      </div>
      <div class="job-meta">
        <span>📍 ${escapeHtml(job.location)}</span>
        <span>🗓️ ${escapeHtml(job.timing)}</span>
      </div>
      <p class="job-desc">${escapeHtml(job.desc)}</p>
      <div class="job-card-bottom">
        <div class="job-budget"><small>Budget</small><strong>${escapeHtml(job.budget)}</strong></div>
        <span class="job-owner-note">${job.demo ? 'Example' : 'Posted on this device'}</span>
      </div>
    </article>
  `).join('');
}

renderJobs();

const originalOpenModal = openModal;
openModal = function(type, payload) {
  if (type !== 'job') return originalOpenModal(type, payload);
  modalContent.innerHTML = `
    <span class="kicker">Post a job</span>
    <h2>What do you need help with?</h2>
    <p>Create a local request so providers can understand the job before they respond.</p>
    <form class="form-grid" id="jobForm">
      <label>Service category
        <select name="service" required>
          <option value="">Choose a service</option>
          <option>Babysitting</option><option>Lawn care</option><option>House cleaning</option><option>Pet care</option><option>Tutoring</option><option>Moving help</option><option>Handyman</option><option>Errands</option><option>Car washing</option><option>Photography</option><option>Other</option>
        </select>
      </label>
      <div class="form-two">
        <label>City or ZIP<input name="location" required autocomplete="postal-code" placeholder="Where is the job?"></label>
        <label>When do you need it?<input name="timing" required placeholder="Example: Saturday morning"></label>
      </div>
      <div class="form-two">
        <label>Budget type
          <select name="budgetType" required><option>Fixed</option><option>Per hour</option><option>Open to quotes</option></select>
        </label>
        <label>Budget amount<input name="budgetAmount" required placeholder="Example: 75"></label>
      </div>
      <label>Job details<textarea name="desc" required rows="4" maxlength="500" placeholder="Describe what needs to be done, anything the provider should bring, and important details."></textarea></label>
      <div class="form-two">
        <label>First name<input name="name" required autocomplete="given-name" placeholder="Your first name"></label>
        <label>Email<input name="email" required type="email" autocomplete="email" placeholder="you@example.com"></label>
      </div>
      <label class="form-choice"><input type="checkbox" required> I understand this is currently a prototype and the request is stored only on this device, not sent to real providers.</label>
      <div class="form-note">Next, we will connect this workflow to real customer accounts and a database so jobs can be securely published and matched with providers.</div>
      <button class="primary-btn" type="submit">Post job request</button>
    </form>`;
  modalBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

modalContent.addEventListener('submit', e => {
  if (e.target.id !== 'jobForm') return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const data = new FormData(e.target);
  const budgetType = data.get('budgetType');
  const amount = String(data.get('budgetAmount') || '').trim();
  const budget = budgetType === 'Per hour' ? `$${amount}/hr` : budgetType === 'Open to quotes' ? 'Open to quotes' : `$${amount} fixed`;
  const newJob = {
    id: `local-${Date.now()}`,
    service: String(data.get('service') || ''),
    location: String(data.get('location') || ''),
    timing: String(data.get('timing') || ''),
    budget,
    desc: String(data.get('desc') || ''),
    owner: String(data.get('name') || ''),
    demo: false
  };
  const saved = getSavedJobs();
  saved.unshift(newJob);
  saveJobs(saved.slice(0, 8));
  renderJobs();
  modalContent.innerHTML = `<div class="success-box"><div class="big-check">✓</div><h2>Your job is on the prototype board</h2><p>It is saved only on this device for now. The next build step will connect LocalNest to real accounts and a database.</p><button class="primary-btn" id="viewPostedJob">View posted job</button></div>`;
  document.getElementById('viewPostedJob').addEventListener('click', () => {
    closeModal();
    document.getElementById('jobs').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}, true);
