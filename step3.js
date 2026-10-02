// LocalNest Step 3 — provider profiles layered on top of Step 2.
let ln3Providers = [];
const ln3BaseOpenModal = openModal;

function ln3Initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return (parts.map(x => x[0]).join('') || 'LN').toUpperCase();
}

function ln3Photo(profile) {
  if (profile.profile_photo_url) {
    return `<img class="ln3-provider-photo" src="${escapeHtml(profile.profile_photo_url)}" alt="${escapeHtml(profile.full_name || 'Provider')} profile photo">`;
  }
  return `<div class="avatar avatar-a">${escapeHtml(ln3Initials(profile.full_name))}</div>`;
}

function ln3Rate(profile) {
  return profile.hourly_rate == null ? 'Quote' : `$${Number(profile.hourly_rate).toFixed(0)}/hr`;
}

function ln3LiveCard(profile) {
  const badge = profile.verification_status === 'verified' ? '✓ Verified provider' : 'Live provider';
  return `
    <article class="provider-card ln3-live-card">
      <div class="provider-top">
        ${ln3Photo(profile)}
        <div>
          <h3>${escapeHtml(profile.full_name || 'Local provider')}</h3>
          <div class="provider-service">${escapeHtml(profile.service_category || 'Local service')}</div>
          <div class="ln3-live-label">● ${escapeHtml(badge)}</div>
        </div>
      </div>
      <div class="provider-meta"><span class="badge">${escapeHtml(badge)}</span></div>
      ${profile.headline ? `<strong>${escapeHtml(profile.headline)}</strong>` : ''}
      <p class="provider-desc">${escapeHtml(profile.bio || 'Local provider on LocalNest.')}</p>
      <div class="ln3-provider-facts">
        ${profile.service_radius_miles ? `<span>📍 ${profile.service_radius_miles} mi radius</span>` : ''}
        ${profile.availability_text ? `<span>🗓️ ${escapeHtml(profile.availability_text)}</span>` : ''}
      </div>
      <div class="provider-bottom">
        <div class="provider-rate"><small>Rate</small><strong>${escapeHtml(ln3Rate(profile))}</strong></div>
        <button class="card-btn" data-ln3-provider="${escapeHtml(profile.id)}">View profile</button>
      </div>
    </article>`;
}

function ln3ExampleCard(p) {
  const idx = providers.indexOf(p);
  return `
    <article class="provider-card">
      <div class="provider-top">
        <div class="avatar ${p.avatar}">${p.initials}</div>
        <div>
          <h3>${p.name}</h3>
          <div class="provider-service">${p.service}</div>
          <div class="stars">★★★★★ <span>${p.rating} (${p.reviews})</span></div>
        </div>
      </div>
      <div class="provider-meta"><span class="badge">Example profile</span></div>
      <p class="provider-desc">${p.desc}</p>
      <div class="provider-bottom">
        <div class="provider-rate"><small>Example rate</small><strong>${p.price}</strong></div>
        <button class="card-btn" data-profile="${idx}">View profile</button>
      </div>
    </article>`;
}

function ln3Render(service = '', location = '') {
  const q = String(service).trim().toLowerCase();
  const place = String(location).trim().toLowerCase();

  let live = ln3Providers.filter(p => {
    const serviceMatch = !q ||
      String(p.service_category || '').toLowerCase().includes(q) ||
      String(p.headline || '').toLowerCase().includes(q) ||
      String(p.bio || '').toLowerCase().includes(q);
    const placeMatch = !place ||
      String(p.city || '').toLowerCase().includes(place) ||
      String(p.zip || '').toLowerCase().includes(place);
    return serviceMatch && placeMatch;
  });

  let examples = providers.filter(p =>
    !q || p.service.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  );

  const cards = [
    ...live.map(ln3LiveCard),
    ...examples.slice(0, Math.max(0, 6 - live.length)).map(ln3ExampleCard)
  ];

  providerGrid.innerHTML = cards.join('');
  emptyState.classList.toggle('hidden', cards.length > 0);
  providerGrid.classList.toggle('hidden', cards.length === 0);

  if (place) locationPill.textContent = `📍 Providers matching ${location}`;
  else if (q) locationPill.textContent = `🔎 Results for “${service}”`;
  else locationPill.textContent = live.length ? `● ${live.length} live provider${live.length === 1 ? '' : 's'} plus examples` : '📍 Showing example listings';
}

async function ln3LoadProviders() {
  if (!backendReady) return;
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, city, zip, service_category, headline, bio, hourly_rate, service_radius_miles, availability_text, profile_photo_url, years_experience, verification_status, is_published')
    .eq('role', 'provider')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Provider load failed', error);
    return;
  }
  ln3Providers = data || [];
  ln3Render(serviceInput.value, locationInput.value);
}

renderProviders = function() {
  ln3Render(serviceInput.value, locationInput.value);
};

searchProviders = function(service, location) {
  ln3Render(service, location);
  document.querySelector('.providers-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

async function ln3OwnProfile() {
  if (!currentUser) return null;
  const { data, error } = await db
    .from('profiles')
    .select('id, role, full_name, city, zip, service_category, headline, bio, hourly_rate, service_radius_miles, availability_text, profile_photo_url, years_experience, verification_status, is_published')
    .eq('id', currentUser.id)
    .single();
  if (error) throw error;
  return data;
}

function ln3ServiceOptions(selected = '') {
  const items = ['Babysitting','Lawn care','House cleaning','Pet care','Tutoring','Moving help','Handyman','Errands','Car washing','Photography','Other'];
  return items.map(x => `<option ${x === selected ? 'selected' : ''}>${x}</option>`).join('');
}

async function ln3OpenProviderEditor() {
  if (!currentUser) {
    ln3BaseOpenModal('signup');
    const role = modalContent.querySelector('select[name="role"]');
    if (role) role.value = 'provider';
    return;
  }

  modalContent.innerHTML = '<span class="kicker">Provider profile</span><h2>Loading your profile…</h2>';
  modalBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  try {
    const p = await ln3OwnProfile();
    modalContent.innerHTML = `
      <span class="kicker">Provider profile</span>
      <h2>${p.role === 'provider' ? 'Edit your service profile' : 'Become a LocalNest provider'}</h2>
      <p>Build the profile customers will see when they look for local help.</p>
      <form class="form-grid" id="ln3ProviderForm">
        <label>Public name<input name="fullName" required maxlength="80" value="${escapeHtml(p.full_name || '')}"></label>
        <label>Service category<select name="serviceCategory" required><option value="">Choose a service</option>${ln3ServiceOptions(p.service_category || '')}</select></label>
        <label>Short headline<input name="headline" required maxlength="100" value="${escapeHtml(p.headline || '')}" placeholder="Reliable weekend lawn care"></label>
        <label>About your service<textarea name="bio" required minlength="30" maxlength="700" rows="5" placeholder="What do you offer and what should customers know?">${escapeHtml(p.bio || '')}</textarea></label>
        <div class="form-two">
          <label>Hourly rate ($)<input name="hourlyRate" type="number" min="0" max="10000" step="1" value="${p.hourly_rate ?? ''}" placeholder="35"></label>
          <label>Service radius (miles)<input name="radius" type="number" min="1" max="100" value="${p.service_radius_miles ?? ''}" placeholder="15"></label>
        </div>
        <div class="form-two">
          <label>Years of experience<input name="years" type="number" min="0" max="80" value="${p.years_experience ?? ''}" placeholder="2"></label>
          <label>Availability<input name="availability" maxlength="120" value="${escapeHtml(p.availability_text || '')}" placeholder="Evenings and weekends"></label>
        </div>
        <div class="form-two">
          <label>City<input name="city" maxlength="80" value="${escapeHtml(p.city || '')}"></label>
          <label>ZIP<input name="zip" maxlength="12" value="${escapeHtml(p.zip || '')}"></label>
        </div>
        <label>Profile photo<input name="photo" type="file" accept="image/png,image/jpeg,image/webp"></label>
        ${p.profile_photo_url ? `<div class="ln3-photo-preview"><img src="${escapeHtml(p.profile_photo_url)}" alt="Current profile photo"><span>Current photo</span></div>` : ''}
        <label class="ln3-publish-check">
          <input name="published" type="checkbox" ${p.is_published ? 'checked' : ''}>
          <span><strong>Publish my provider profile</strong><small>Customers can discover this profile in LocalNest.</small></span>
        </label>
        <div class="form-note">Publishing does not mean verified. Verification will be a separate trust-and-safety step later.</div>
        <button class="primary-btn" type="submit">Save provider profile</button>
      </form>`;
  } catch (err) {
    modalContent.innerHTML = `<span class="kicker">Provider profile</span><h2>Could not load profile</h2><p>${escapeHtml(err.message || 'Please try again.')}</p>`;
  }
}

openModal = function(type, payload) {
  if (type === 'provider') {
    ln3OpenProviderEditor();
    return;
  }
  if (type === 'account' && currentUser) {
    const role = currentProfile?.role === 'provider' ? 'Provider' : 'Customer';
    modalContent.innerHTML = `
      <span class="kicker">Your account</span>
      <h2>${escapeHtml(currentProfile?.full_name || currentUser.email || 'LocalNest member')}</h2>
      <p>${escapeHtml(currentUser.email || '')}</p>
      <div class="account-summary">
        <div><small>Account type</small><strong>${role}</strong></div>
        <div><small>Area</small><strong>${escapeHtml([currentProfile?.city, currentProfile?.zip].filter(Boolean).join(' ') || 'Not set')}</strong></div>
      </div>
      <button class="primary-btn" type="button" data-open="provider">${role === 'Provider' ? 'Edit provider profile' : 'Become a provider'}</button>
      <button class="danger-link" type="button" id="signOutBtn">Sign out</button>`;
    modalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    return;
  }
  ln3BaseOpenModal(type, payload);
};

async function ln3UploadPhoto(file) {
  if (!file || !file.size) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error('Please use a photo smaller than 5 MB.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${currentUser.id}/${Date.now()}.${ext}`;
  const { error } = await db.storage.from('provider-photos').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return db.storage.from('provider-photos').getPublicUrl(path).data.publicUrl;
}

async function ln3SaveProvider(form) {
  const existing = await ln3OwnProfile();
  const fd = new FormData(form);
  const uploaded = await ln3UploadPhoto(fd.get('photo'));

  const update = {
    role: 'provider',
    full_name: String(fd.get('fullName') || '').trim(),
    service_category: String(fd.get('serviceCategory') || '').trim(),
    headline: String(fd.get('headline') || '').trim(),
    bio: String(fd.get('bio') || '').trim(),
    hourly_rate: fd.get('hourlyRate') ? Number(fd.get('hourlyRate')) : null,
    service_radius_miles: fd.get('radius') ? Number(fd.get('radius')) : null,
    years_experience: fd.get('years') ? Number(fd.get('years')) : null,
    availability_text: String(fd.get('availability') || '').trim(),
    city: String(fd.get('city') || '').trim(),
    zip: String(fd.get('zip') || '').trim(),
    profile_photo_url: uploaded || existing.profile_photo_url || null,
    is_published: fd.get('published') === 'on',
    updated_at: new Date().toISOString()
  };

  const { error } = await db.from('profiles').update(update).eq('id', currentUser.id);
  if (error) throw error;

  const session = (await db.auth.getSession()).data.session;
  await syncSession(session);
  await ln3LoadProviders();

  modalContent.innerHTML = `
    <div class="success-box">
      <div class="big-check">✓</div>
      <h2>Provider profile saved</h2>
      <p>${update.is_published ? 'Your profile is published on LocalNest.' : 'Your profile is saved as a draft.'}</p>
      <button class="primary-btn" id="ln3ViewProviders">View providers</button>
    </div>`;
  document.getElementById('ln3ViewProviders')?.addEventListener('click', () => {
    closeModal();
    document.querySelector('.providers-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

modalContent.addEventListener('submit', async e => {
  if (e.target.id !== 'ln3ProviderForm') return;
  e.preventDefault();
  const form = e.target;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Saving…';
  try {
    await ln3SaveProvider(form);
  } catch (err) {
    let box = form.querySelector('.form-error');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-error';
      form.prepend(box);
    }
    box.textContent = err.message || 'Could not save the provider profile.';
    button.disabled = false;
    button.textContent = 'Save provider profile';
  }
});

document.body.addEventListener('click', e => {
  const btn = e.target.closest('[data-ln3-provider]');
  if (!btn) return;
  const profile = ln3Providers.find(p => p.id === btn.dataset.ln3Provider);
  if (!profile) return;

  e.preventDefault();
  e.stopPropagation();

  const badge = profile.verification_status === 'verified' ? 'Verified provider' : 'Live provider — not yet verified';
  modalContent.innerHTML = `
    <span class="kicker">${escapeHtml(badge)}</span>
    <div class="provider-top" style="margin-top:14px">
      ${ln3Photo(profile)}
      <div>
        <h2 style="margin:0;font-size:28px">${escapeHtml(profile.full_name || 'Local provider')}</h2>
        <div class="provider-service">${escapeHtml(profile.service_category || 'Local service')}</div>
      </div>
    </div>
    ${profile.headline ? `<h3 style="margin-top:20px">${escapeHtml(profile.headline)}</h3>` : ''}
    <p>${escapeHtml(profile.bio || '')}</p>
    <div class="account-summary">
      <div><small>Rate</small><strong>${escapeHtml(ln3Rate(profile))}</strong></div>
      <div><small>Area</small><strong>${escapeHtml([profile.city, profile.zip].filter(Boolean).join(' ') || 'Local area')}</strong></div>
      <div><small>Service radius</small><strong>${profile.service_radius_miles ? `${profile.service_radius_miles} miles` : 'Ask provider'}</strong></div>
      <div><small>Availability</small><strong>${escapeHtml(profile.availability_text || 'Ask provider')}</strong></div>
    </div>`;
  modalBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}, true);

ln3LoadProviders();
