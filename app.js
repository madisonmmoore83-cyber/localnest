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

const defaultJobs = [
  { id: 'demo-1', service: 'Lawn care', location: 'Local area', timing: 'This weekend', budget: '$45 fixed', desc: 'Front and back yard mowing plus light edging. Standard-size residential lot.', demo: true },
  { id: 'demo-2', service: 'Babysitting', location: 'Local area', timing: 'Friday evening', budget: '$20/hr', desc: 'Looking for date-night care for two children for about four hours.', demo: true },
  { id: 'demo-3', service: 'House cleaning', location: 'Local area', timing: 'Next week', budget: '$120 fixed', desc: 'One-time cleaning for a two-bedroom home, including kitchen and bathrooms.', demo: true }
];

const config = window.LOCALNEST_CONFIG || {};
const backendReady =
  typeof window.supabase !== 'undefined' &&
  config.supabaseUrl &&
  config.supabaseKey &&
  !config.supabaseUrl.includes('PASTE_') &&
  !config.supabaseKey.includes('PASTE_');

const db = backendReady ? window.supabase.createClient(config.supabaseUrl, config.supabaseKey) : null;
let currentUser = null;
let currentProfile = null;
let liveJobs = [];

const providerGrid = document.getElementById('providerGrid');
const emptyState = document.getElementById('emptyState');
const locationPill = document.getElementById('locationPill');
const serviceInput = document.getElementById('serviceInput');
const locationInput = document.getElementById('locationInput');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');
const authButton = document.getElementById('authButton');
const mobileAuthButton = document.getElementById('mobileAuthButton');
const backendBanner = document.getElementById('backendBanner');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function badgeHtml(badge) {
  return `<span class="badge ${badge === 'Care Plus' ? 'care' : ''}">${badge === 'Care Plus' ? '🛡️ ' : '✓ '}${badge}</span>`;
}

function renderProviders(list = providers.slice(0, 6)) {
  providerGrid.innerHTML = list.map(p => `
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

function getSavedJobs() {
  try { return JSON.parse(localStorage.getItem('localnestPostedJobs') || '[]'); }
  catch { return []; }
}
function saveJobs(jobs) {
  localStorage.setItem('localnestPostedJobs', JSON.stringify(jobs));
}

function formatDbBudget(job) {
  if (job.budget_type === 'Open to quotes') return 'Open to quotes';
  const amount = Number(job.budget_amount || 0);
  if (!amount) return job.budget_type === 'Per hour' ? 'Hourly' : 'Fixed';
  return job.budget_type === 'Per hour' ? `$${amount}/hr` : `$${amount} fixed`;
}

function renderJobs() {
  const jobGrid = document.getElementById('jobGrid');
  if (!jobGrid) return;

  let jobs;
  if (backendReady) {
    const dbJobs = liveJobs.map(j => ({
      id: j.id,
      service: j.service,
      location: j.location,
      timing: j.timing,
      budget: formatDbBudget(j),
      desc: j.description,
      demo: false,
      mine: currentUser && j.customer_id === currentUser.id
    }));
    jobs = [...dbJobs, ...defaultJobs];
  } else {
    const local = getSavedJobs().map(j => ({...j, mine: true}));
    jobs = [...local, ...defaultJobs];
  }

  jobGrid.innerHTML = jobs.map(job => `
    <article class="job-card ${job.demo ? '' : 'user-posted'}">
      <div class="job-card-top">
        <div class="job-service">${escapeHtml(job.service)}</div>
        <span class="job-status">${job.demo ? 'Open' : 'Live'}</span>
      </div>
      <div class="job-meta">
        <span>📍 ${escapeHtml(job.location)}</span>
        <span>🗓️ ${escapeHtml(job.timing)}</span>
      </div>
      <p class="job-desc">${escapeHtml(job.desc)}</p>
      <div class="job-card-bottom">
        <div class="job-budget"><small>Budget</small><strong>${escapeHtml(job.budget)}</strong></div>
        <span class="job-owner-note">${job.demo ? 'Example' : job.mine ? 'Your job' : 'LocalNest job'}</span>
      </div>
    </article>
  `).join('');

  const note = document.getElementById('jobsNote');
  if (!backendReady) {
    note.textContent = 'Database is not connected yet, so jobs you post remain on this browser only. Connect Supabase to activate real accounts and cross-device storage.';
  } else if (!currentUser) {
    note.textContent = 'LocalNest database is connected. Sign in to see live open jobs and post a real request.';
  } else {
    note.textContent = 'Signed-in jobs are stored in the LocalNest database. Example listings are still fictional and labeled Example.';
  }
}

async function loadLiveJobs() {
  if (!backendReady || !currentUser) {
    liveJobs = [];
    renderJobs();
    return;
  }
  const { data, error } = await db
    .from('jobs')
    .select('id, customer_id, service, location, timing, budget_type, budget_amount, description, status, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Could not load jobs:', error);
    liveJobs = [];
  } else {
    liveJobs = data || [];
  }
  renderJobs();
}

function setBackendBanner() {
  if (!backendBanner) return;
  if (backendReady) {
    backendBanner.classList.add('connected');
    backendBanner.querySelector('span').innerHTML = '<strong>Database connected.</strong> Real accounts and signed-in job posting are active.';
    const btn = backendBanner.querySelector('button');
    if (btn) btn.textContent = 'Account help →';
  }
}

async function syncSession(session) {
  currentUser = session?.user || null;
  currentProfile = null;

  if (currentUser && backendReady) {
    const { data } = await db
      .from('profiles')
      .select('id, role, full_name, city, zip, service_category, bio, hourly_rate')
      .eq('id', currentUser.id)
      .maybeSingle();
    currentProfile = data || null;
  }

  updateAuthUI();
  await loadLiveJobs();
}

function updateAuthUI() {
  const firstName = currentProfile?.full_name?.trim().split(/\s+/)[0] || '';
  const label = currentUser ? (firstName ? `Hi, ${firstName}` : 'Account') : 'Sign in';
  [authButton, mobileAuthButton].forEach(btn => {
    if (!btn) return;
    btn.textContent = label;
    btn.dataset.open = currentUser ? 'account' : 'signin';
  });
}

async function initBackend() {
  setBackendBanner();
  renderProviders();
  renderJobs();

  if (!backendReady) return;

  const { data } = await db.auth.getSession();
  await syncSession(data.session);

  db.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => syncSession(session), 0);
  });
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
  document.body.style.overflow = '';
}

function showAuthGate() {
  modalContent.innerHTML = `
    <span class="kicker">Account required</span>
    <h2>Sign in before posting a live job</h2>
    <p>Step 2 connects each request to a real LocalNest customer account.</p>
    <div class="auth-choice-grid">
      <button class="primary-btn" type="button" data-open="signup">Create account</button>
      <button class="secondary-btn" type="button" data-open="signin">Sign in</button>
    </div>`;
  modalBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function openModal(type, payload) {
  if (type === 'setup') {
    modalContent.innerHTML = backendReady ? `
      <span class="kicker">Step 2 active</span>
      <h2>LocalNest is connected</h2>
      <p>Supabase is configured, so accounts and signed-in jobs can persist across devices.</p>
      <div class="form-note">Next build step: richer provider profiles with photos, service areas, availability, and pricing.</div>
      <button class="primary-btn" type="button" onclick="document.getElementById('modalClose').click()">Done</button>
    ` : `
      <span class="kicker">Step 2 setup</span>
      <h2>Connect the LocalNest backend</h2>
      <p>Create a Supabase project, run <strong>supabase-setup.sql</strong>, then paste your Project URL and Publishable key into <strong>config.js</strong>.</p>
      <div class="form-note">Use only the public Publishable/anon key in the browser. Never place a service_role or secret key in LocalNest files.</div>
    `;
  } else if (type === 'signup') {
    modalContent.innerHTML = `
      <span class="kicker">Create an account</span>
      <h2>Join LocalNest</h2>
      <p>Create a customer account to post jobs, or a provider account to prepare for offering services.</p>
      <form class="form-grid" id="signupForm">
        <label>Full name<input name="fullName" required autocomplete="name" placeholder="Your name"></label>
        <div class="form-two">
          <label>Email<input name="email" required type="email" autocomplete="email" placeholder="you@example.com"></label>
          <label>Password<input name="password" required type="password" minlength="8" autocomplete="new-password" placeholder="At least 8 characters"></label>
        </div>
        <label>I want to use LocalNest as
          <select name="role" required>
            <option value="customer">A customer — I need local help</option>
            <option value="provider">A provider — I want to offer services</option>
          </select>
        </label>
        <div class="form-two">
          <label>City<input name="city" autocomplete="address-level2" placeholder="Your city"></label>
          <label>ZIP<input name="zip" autocomplete="postal-code" placeholder="ZIP code"></label>
        </div>
        <div class="form-note">Your email is used for account access. Public job cards do not display your email address.</div>
        <button class="primary-btn" type="submit">Create LocalNest account</button>
        <button class="text-link auth-switch" type="button" data-open="signin">Already have an account? Sign in →</button>
      </form>`;
  } else if (type === 'signin') {
    modalContent.innerHTML = `
      <span class="kicker">Welcome back</span>
      <h2>Sign in to LocalNest</h2>
      <p>Access your account and post jobs that are stored in the LocalNest database.</p>
      <form class="form-grid" id="signinForm">
        <label>Email<input name="email" required type="email" autocomplete="email" placeholder="you@example.com"></label>
        <label>Password<input name="password" required type="password" autocomplete="current-password" placeholder="••••••••"></label>
        <button class="primary-btn" type="submit">Sign in</button>
        <button class="text-link auth-switch" type="button" data-open="signup">Need an account? Create one →</button>
      </form>`;
  } else if (type === 'account') {
    const role = currentProfile?.role === 'provider' ? 'Provider' : 'Customer';
    modalContent.innerHTML = `
      <span class="kicker">Your account</span>
      <h2>${escapeHtml(currentProfile?.full_name || currentUser?.email || 'LocalNest member')}</h2>
      <p>${escapeHtml(currentUser?.email || '')}</p>
      <div class="account-summary">
        <div><small>Account type</small><strong>${role}</strong></div>
        <div><small>Area</small><strong>${escapeHtml([currentProfile?.city, currentProfile?.zip].filter(Boolean).join(' ') || 'Not set')}</strong></div>
      </div>
      <div class="form-note">Step 3 will add full provider profiles, service radius, availability, photos, and detailed pricing.</div>
      <button class="danger-link" type="button" id="signOutBtn">Sign out</button>`;
  } else if (type === 'provider') {
    if (!backendReady) {
      modalContent.innerHTML = `
        <span class="kicker">Provider accounts</span>
        <h2>Backend setup comes first</h2>
        <p>Connect Supabase in Step 2, then providers can create real accounts. Full provider profiles are Step 3.</p>`;
    } else if (!currentUser) {
      openModal('signup');
      setTimeout(() => {
        const role = modalContent.querySelector('select[name="role"]');
        if (role) role.value = 'provider';
      }, 0);
      return;
    } else {
      modalContent.innerHTML = `
        <span class="kicker">Provider setup</span>
        <h2>${currentProfile?.role === 'provider' ? 'Your provider account is ready' : 'Switching roles comes next'}</h2>
        <p>${currentProfile?.role === 'provider' ? 'Step 3 will turn this account into a complete public service profile.' : 'This account is currently a customer account. We will add managed provider onboarding in Step 3.'}</p>`;
    }
  } else if (type === 'profile') {
    const p = providers[payload];
    modalContent.innerHTML = `
      <span class="kicker">Example local provider</span>
      <div class="provider-top" style="margin-top:14px">
        <div class="avatar ${p.avatar}">${p.initials}</div>
        <div><h2 style="margin:0;font-size:28px">${p.name}</h2><div class="provider-service">${p.service}</div><div class="stars">★★★★★ <span>${p.rating} (${p.reviews} reviews)</span></div></div>
      </div>
      <div class="provider-meta" style="margin-top:20px">${p.badges.map(badgeHtml).join('')}</div>
      <p>${p.desc}</p>
      <div class="form-note">This provider is a fictional example. Real provider profiles are the next LocalNest build stage.</div>`;
  } else if (type === 'job') {
    if (backendReady && !currentUser) {
      showAuthGate();
      return;
    }
    modalContent.innerHTML = `
      <span class="kicker">Post a job</span>
      <h2>What do you need help with?</h2>
      <p>${backendReady ? 'This request will be connected to your signed-in LocalNest account.' : 'Local browser mode is active until Supabase is connected.'}</p>
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
          <label>Budget amount<input name="budgetAmount" inputmode="decimal" placeholder="Example: 75"></label>
        </div>
        <label>Job details<textarea name="desc" required rows="4" minlength="10" maxlength="1000" placeholder="Describe what needs to be done, anything the provider should bring, and important details."></textarea></label>
        <div class="form-note">${backendReady ? 'Your email is not shown on the public job card.' : 'This is still local browser storage until the backend is connected.'}</div>
        <button class="primary-btn" type="submit">Post job request</button>
      </form>`;
  }

  modalBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

async function handleSignup(form) {
  if (!backendReady) {
    throw new Error('Supabase is not connected yet. Complete the Step 2 backend setup first.');
  }
  const data = new FormData(form);
  const fullName = String(data.get('fullName') || '').trim();
  const email = String(data.get('email') || '').trim();
  const password = String(data.get('password') || '');
  const role = String(data.get('role') || 'customer');
  const city = String(data.get('city') || '').trim();
  const zip = String(data.get('zip') || '').trim();

  const { data: result, error } = await db.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { full_name: fullName, role, city, zip }
    }
  });
  if (error) throw error;

  if (result.session) {
    await syncSession(result.session);
    modalContent.innerHTML = `<div class="success-box"><div class="big-check">✓</div><h2>Account created</h2><p>You are signed in. Your LocalNest account is now backed by the database.</p><button class="primary-btn" data-open="account">View account</button></div>`;
  } else {
    modalContent.innerHTML = `<div class="success-box"><div class="big-check">✉</div><h2>Check your email</h2><p>Supabase email confirmation is enabled. Confirm the account from your email, then return to LocalNest and sign in.</p><button class="primary-btn" data-open="signin">Go to sign in</button></div>`;
  }
}

async function handleSignin(form) {
  if (!backendReady) throw new Error('Supabase is not connected yet.');
  const data = new FormData(form);
  const { data: result, error } = await db.auth.signInWithPassword({
    email: String(data.get('email') || '').trim(),
    password: String(data.get('password') || '')
  });
  if (error) throw error;
  await syncSession(result.session);
  closeModal();
}

async function handleJob(form) {
  const data = new FormData(form);
  const budgetType = String(data.get('budgetType') || 'Fixed');
  const rawAmount = String(data.get('budgetAmount') || '').trim();
  const numericAmount = rawAmount ? Number(rawAmount.replace(/[$,]/g, '')) : null;
  if (rawAmount && (!Number.isFinite(numericAmount) || numericAmount < 0)) {
    throw new Error('Enter a valid budget amount.');
  }
  if (budgetType !== 'Open to quotes' && !rawAmount) {
    throw new Error('Add a budget amount or choose Open to quotes.');
  }

  const jobPayload = {
    service: String(data.get('service') || ''),
    location: String(data.get('location') || ''),
    timing: String(data.get('timing') || ''),
    budget_type: budgetType,
    budget_amount: budgetType === 'Open to quotes' ? null : numericAmount,
    description: String(data.get('desc') || '').trim()
  };

  if (backendReady) {
    if (!currentUser) throw new Error('Please sign in first.');
    const { error } = await db.from('jobs').insert({
      ...jobPayload,
      customer_id: currentUser.id
    });
    if (error) throw error;
    await loadLiveJobs();
    modalContent.innerHTML = `<div class="success-box"><div class="big-check">✓</div><h2>Your job is live</h2><p>The request is stored in the LocalNest database and tied to your account.</p><button class="primary-btn" id="viewPostedJob">View posted job</button></div>`;
  } else {
    const budget = budgetType === 'Per hour' ? `$${numericAmount}/hr` : budgetType === 'Open to quotes' ? 'Open to quotes' : `$${numericAmount} fixed`;
    const saved = getSavedJobs();
    saved.unshift({
      id: `local-${Date.now()}`,
      service: jobPayload.service,
      location: jobPayload.location,
      timing: jobPayload.timing,
      budget,
      desc: jobPayload.description,
      demo: false
    });
    saveJobs(saved.slice(0, 8));
    renderJobs();
    modalContent.innerHTML = `<div class="success-box"><div class="big-check">✓</div><h2>Saved on this browser</h2><p>Connect Supabase to turn this into a real database-backed job.</p><button class="primary-btn" id="viewPostedJob">View posted job</button></div>`;
  }

  document.getElementById('viewPostedJob')?.addEventListener('click', () => {
    closeModal();
    document.getElementById('jobs').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
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

document.body.addEventListener('click', async e => {
  const open = e.target.closest('[data-open]');
  if (open) {
    openModal(open.dataset.open);
    return;
  }
  const profile = e.target.closest('[data-profile]');
  if (profile) {
    openModal('profile', Number(profile.dataset.profile));
    return;
  }
  if (e.target.id === 'signOutBtn') {
    await db?.auth.signOut();
    closeModal();
  }
});

document.getElementById('modalClose').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

modalContent.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const submit = form.querySelector('button[type="submit"]');
  if (submit) {
    submit.disabled = true;
    submit.dataset.originalText = submit.textContent;
    submit.textContent = 'Please wait…';
  }
  try {
    if (form.id === 'signupForm') await handleSignup(form);
    else if (form.id === 'signinForm') await handleSignin(form);
    else if (form.id === 'jobForm') await handleJob(form);
  } catch (err) {
    const old = form.querySelector('.form-error');
    if (old) old.remove();
    const box = document.createElement('div');
    box.className = 'form-error';
    box.textContent = err?.message || 'Something went wrong. Please try again.';
    form.prepend(box);
  } finally {
    if (submit && document.body.contains(submit)) {
      submit.disabled = false;
      submit.textContent = submit.dataset.originalText || 'Submit';
    }
  }
});

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});
document.querySelectorAll('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.remove('open');
}));

initBackend();
