if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((error) => {
      console.warn('Offline support could not be enabled.', error);
    });
  });
}

console.info(String.raw` /\_/\
( o.o )
 > ^ <

you found me.`);

const avatar = document.querySelector('.avatar');
const pet = document.querySelector('.pet');
const message = document.querySelector('.cat-message');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let petCount = 0;
let tilt;
let messageTimer;
let replyAnimation;
let sleepTimer;
let hoverTimer;
let hiddenSince = document.hidden ? Date.now() : null;

function wake() {
  avatar.classList.remove('is-sleeping');
  clearTimeout(sleepTimer);
  if (!document.hidden) {
    sleepTimer = setTimeout(() => {
      avatar.classList.remove('is-speaking');
      avatar.classList.add('is-sleeping');
    }, 60_000);
  }
}

function say(text) {
  wake();
  clearTimeout(messageTimer);
  message.replaceChildren(document.createTextNode(text));
  avatar.classList.add('is-speaking');
  replyAnimation?.cancel();
  if (!reducedMotion.matches) {
    replyAnimation = message.animate([
      { opacity: 0.45, transform: 'translateY(2px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 160, easing: 'ease-out' });
  }
  messageTimer = setTimeout(() => avatar.classList.remove('is-speaking'), 2400);
}

window.addEventListener('season-reply', (event) => say(event.detail));

pet.disabled = false;
pet.addEventListener('click', () => {
  clearTimeout(hoverTimer);
  wake();
  tilt?.cancel();
  if (!reducedMotion.matches) {
    const angle = petCount % 2 ? 5 : -5;
    tilt = pet.animate([
      { transform: 'rotate(0deg)' },
      { transform: `rotate(${angle}deg)`, offset: 0.4 },
      { transform: 'rotate(0deg)' },
    ], { duration: 340, easing: 'ease-in-out' });
  }
  petCount += 1;
  if (!window.dispatchEvent(new Event('season-pet', { cancelable: true }))) return;
  const hour = new Date().getHours();
  if (hour < 5 && Math.random() < 0.25) {
    say('still awake?');
  } else if (petCount % 3 === 0) {
    say(document.documentElement.dataset.seasonReply || 'mrrp.');
  }
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    tilt?.cancel();
    replyAnimation?.cancel();
  }
});

for (const type of ['pointermove', 'pointerdown', 'keydown', 'scroll', 'focusin']) {
  window.addEventListener(type, wake, { passive: true });
}
document.addEventListener('visibilitychange', () => {
  clearTimeout(hoverTimer);
  if (document.hidden) {
    hiddenSince = Date.now();
    wake();
    return;
  }
  const away = hiddenSince === null ? 0 : Date.now() - hiddenSince;
  hiddenSince = null;
  wake();
  if (away >= 5 * 60_000) say('oh. you.');
});

pet.addEventListener('pointerenter', (event) => {
  if (event.pointerType !== 'mouse') return;
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (!document.hidden) say('yes?');
  }, 4000);
});
for (const type of ['pointerleave', 'pointerdown', 'pointercancel']) {
  pet.addEventListener(type, () => clearTimeout(hoverTimer));
}
wake();

let secret = '';
let lastKey = 0;
window.addEventListener('keydown', (event) => {
  if (document.querySelector('dialog[open]')) { secret = ''; return; }
  // Never intercept shortcuts, composed text, or typing into form fields.
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing ||
      event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) {
    secret = '';
    return;
  }
  if (event.repeat) return;
  if (event.key.length !== 1) {
    secret = '';
    return;
  }
  if (Date.now() - lastKey > 2000) secret = '';
  lastKey = Date.now();
  secret = (secret + event.key.toLowerCase()).slice(-7);
  const panel = ['help', 'seasons'].find((word) => secret.endsWith(word));
  if (panel) {
    secret = '';
    openDiscoveries(panel);
    return;
  }
  const replies = { jeme: 'that’s me.', pspsps: '?', hello: 'hi.', bye: 'bye.', purr: 'prrr.', sit: 'no.', '?': '?' };
  const greeting = Object.keys(replies).find((word) => secret.endsWith(word));
  if (greeting) {
    secret = '';
    say(replies[greeting]);
    return;
  }
  const action = ['fetch', 'rain', 'snow', 'uemaim', 'uamuim'].find((word) => secret.endsWith(word));
  if (action) {
    secret = '';
    if (action === 'fetch') {
      clearTimeout(pawTimer);
      period.classList.remove('is-paw');
      briefly(period, 'is-missing');
      say('mine.');
    } else if (action === 'snow') {
      briefly(avatar, 'is-snowing');
      say('first snow.');
    } else if (action === 'rain') {
      briefly(avatar, 'is-raining');
      say('…');
    } else {
      briefly(avatar, 'is-mirrored');
    }
    return;
  }
  if (!secret.endsWith('miumau')) return;
  secret = '';
  const blue = document.documentElement.classList.toggle('blue-mode');
  document.getElementById('blue-avatar').media = blue ? 'all' : 'not all';
  window.dispatchEvent(new Event('themechange'));
});

// The row has its final markup before scripts load, avoiding a username flash.
const discordContact = document.getElementById('discord-contact');
const discordStatus = document.getElementById('discord-status');
const discordUsername = discordContact.dataset.username;
let copyingDiscord = false;
let copiedTimer;
discordContact.disabled = false;
discordContact.addEventListener('click', async () => {
  if (copyingDiscord) return;
  copyingDiscord = true;
  clearTimeout(copiedTimer);
  discordContact.classList.remove('is-copied');
  discordStatus.className = 'sr-only';
  discordStatus.textContent = '';
  try {
    await navigator.clipboard.writeText(discordUsername);
    discordContact.classList.add('is-copied');
    discordStatus.textContent = `Discord username ${discordUsername} copied. Paste it into Add Friend in Discord.`;
    copiedTimer = setTimeout(() => {
      discordContact.classList.remove('is-copied');
      discordStatus.textContent = '';
    }, 2400);
  } catch {
    discordStatus.className = 'discord-feedback';
    discordStatus.textContent = `Couldn’t copy. Add ${discordUsername} as a friend in Discord, or try again.`;
  } finally {
    copyingDiscord = false;
  }
});


const period = document.querySelector('.period');
let pawTimer;
function revealPaw() {
  if (document.documentElement.dataset.season === 'easter' && !document.documentElement.classList.contains('egg-found')) {
    window.dispatchEvent(new Event('season-egg'));
    return;
  }
  clearTimeout(pawTimer);
  period.classList.remove('is-missing');
  period.classList.add('is-paw');
  pawTimer = setTimeout(() => period.classList.remove('is-paw'), 2400);
}
period.disabled = false;
period.addEventListener('dblclick', revealPaw);
period.addEventListener('click', (event) => {
  if (document.documentElement.dataset.season === 'easter' && !document.documentElement.classList.contains('egg-found')) {
    period.classList.remove('is-missing', 'is-paw');
    window.dispatchEvent(new Event('season-egg'));
  } else if (event.detail === 0) revealPaw();
});

// Repeating a discovery extends it instead of letting an older timer end it early.
const effectTimers = new Map();
function briefly(element, className) {
  clearTimeout(effectTimers.get(className));
  element.classList.add(className);
  effectTimers.set(className, setTimeout(() => {
    element.classList.remove(className);
    effectTimers.delete(className);
  }, 2400));
}


const discoveries = document.getElementById('discoveries');
function openDiscoveries(view) {
  const seasons = view === 'seasons';
  document.getElementById('command-guide').hidden = seasons;
  document.getElementById('season-guide').hidden = !seasons;
  document.getElementById('discovery-title').textContent = seasons ? 'A change of season.' : 'A few secrets.';
  const selected = new URLSearchParams(location.search).get('season');
  const valid = [...discoveries.querySelectorAll('[data-preview]')].map((button) => button.dataset.preview);
  for (const button of discoveries.querySelectorAll('[data-preview]')) {
    button.setAttribute('aria-pressed', String(button.dataset.preview === (valid.includes(selected) ? selected : 'today')));
  }
  if (!discoveries.open) discoveries.showModal();
  else discoveries.querySelector('.panel-close').focus();
}
discoveries.querySelector('.panel-close').addEventListener('click', () => discoveries.close());
discoveries.addEventListener('cancel', () => { secret = ''; });
document.getElementById('browse-seasons').addEventListener('click', () => openDiscoveries('seasons'));
document.getElementById('browse-commands').addEventListener('click', () => openDiscoveries('help'));
for (const button of discoveries.querySelectorAll('[data-preview]')) {
  button.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('season-preview', { detail: button.dataset.preview }));
    discoveries.close();
  });
}
// Keep Tab cycling inside the panel rather than moving into browser chrome.
discoveries.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const buttons = [...discoveries.querySelectorAll('button')].filter((button) => !button.disabled && button.getClientRects().length);
  const first = buttons[0];
  const last = buttons[buttons.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});


const corner = document.querySelector('.page-corner');
const sketchbook = document.getElementById('sketchbook');
sketchbook.querySelector('[data-close]').addEventListener('click', () => sketchbook.close());
sketchbook.addEventListener('close', () => { secret = ''; });
let cornerDrag;
let suppressCornerClick = false;
corner.hidden = false;
function resetCorner() {
  cornerDrag = null;
  document.body.classList.remove('is-peeking');
  document.body.style.removeProperty('--peel-size');
}
corner.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  suppressCornerClick = false;
  cornerDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
  corner.setPointerCapture(event.pointerId);
});
corner.addEventListener('pointermove', (event) => {
  if (!cornerDrag || cornerDrag.id !== event.pointerId) return;
  cornerDrag.distance = Math.max(0, cornerDrag.x - event.clientX, cornerDrag.y - event.clientY);
  if (cornerDrag.distance < 6) return;
  document.body.classList.add('is-peeking');
  document.body.style.setProperty('--peel-size', `${Math.min(420, 64 + cornerDrag.distance * 1.4)}px`);
});
corner.addEventListener('pointerup', (event) => {
  if (!cornerDrag || cornerDrag.id !== event.pointerId) return;
  const distance = cornerDrag.distance;
  suppressCornerClick = distance >= 6;
  resetCorner();
  if (distance >= 45) sketchbook.showModal();
});
for (const type of ['pointercancel', 'lostpointercapture']) corner.addEventListener(type, resetCorner);
corner.addEventListener('click', (event) => {
  if (suppressCornerClick && event.detail !== 0) { suppressCornerClick = false; return; }
  sketchbook.showModal();
});

// Let the browser open links normally; the goodbye never delays navigation.
let waveTimer;
function waveGoodbye() {
  clearTimeout(hoverTimer);
  clearTimeout(waveTimer);
  say('see you around.');
  avatar.classList.remove('is-waving');
  void avatar.offsetWidth;
  avatar.classList.add('is-waving');
  waveTimer = setTimeout(() => avatar.classList.remove('is-waving'), 1800);
}
for (const link of document.querySelectorAll('.links a[target="_blank"]')) {
  link.addEventListener('click', waveGoodbye);
  link.addEventListener('auxclick', (event) => { if (event.button === 1) waveGoodbye(); });
}

// One quiet chance per tab session; a sighting earns a day of peace.
(() => {
  const visitors = {
    cat: {
      label: 'A shy cat', reply: 'oh. you brought a friend.',
      drawing: '<path d="m9 31 1-23 15 12q9-3 17 0L55 8l1 25v18H9Z"/><path d="m20 34 3 1m19-1-3 1m-10 7 4 3 4-3"/>',
    },
    fox: {
      label: 'A curious fox', reply: 'just passing through.',
      drawing: '<path d="m8 30 2-24 18 17h10L55 6l2 25-12 21H21Z"/><path d="m10 31 23 17 23-17M21 31h3m18 0h3m-15 13h6"/>',
    },
    owl: {
      label: 'A little night owl', reply: 'another night person.',
      drawing: '<path d="M10 52V13l12 8q11-5 22 0l12-8v39Z"/><circle cx="23" cy="33" r="8"/><circle cx="43" cy="33" r="8"/><path d="M23 32v2m20-2v2m-13 9 3 5 3-5"/>',
    },
  };
  const preview = new URLSearchParams(location.search).get('visitor');
  const isPreview = Object.hasOwn(visitors, preview);
  const cooldownKey = 'jeme-visitor-last-seen';
  const rollKey = 'jeme-visitor-rolled';
  const day = 24 * 60 * 60 * 1000;
  if (!isPreview) {
    try {
      if (sessionStorage.getItem(rollKey)) return;
      sessionStorage.setItem(rollKey, 'yes');
      const lastSeen = Number(localStorage.getItem(cooldownKey));
      if (lastSeen > 0 && Date.now() - lastSeen < day) return;
    } catch { /* A private browser still gets one chance during this page visit. */ }
    if (Math.random() >= 0.08) return;
  }
  const hour = new Date().getHours();
  const choices = hour >= 21 || hour < 6 ? ['cat', 'owl'] : ['cat', 'fox'];
  const kind = isPreview ? preview : choices[Math.floor(Math.random() * choices.length)];
  const visitor = visitors[kind];
  let timer;
  let guest;
  let finished = false;
  function leave() {
    clearTimeout(timer);
    guest?.remove();
    finished = true;
    document.removeEventListener('visibilitychange', onVisibility);
  }
  function appear() {
    if (document.hidden || finished) return;
    const bounds = avatar.getBoundingClientRect();
    if (document.querySelector('dialog[open]') || avatar.matches('.is-speaking, .is-waving') || bounds.top < 32 || bounds.bottom > innerHeight) {
      timer = setTimeout(appear, 3000);
      return;
    }
    // Another tab may have hosted a visitor while this one was waiting.
    if (!isPreview) {
      try {
        const lastSeen = Number(localStorage.getItem(cooldownKey));
        if (lastSeen > 0 && Date.now() - lastSeen < day) { leave(); return; }
        localStorage.setItem(cooldownKey, String(Date.now()));
      } catch { /* Storage is optional. */ }
    }
    guest = document.createElement('button');
    guest.type = 'button';
    guest.tabIndex = -1;
    guest.className = `rare-visitor visitor-${kind}`;
    guest.setAttribute('aria-label', visitor.label);
    guest.innerHTML = `<svg viewBox="0 0 66 60" aria-hidden="true">${visitor.drawing}</svg>`;
    guest.addEventListener('click', () => { say(visitor.reply); leave(); });
    avatar.prepend(guest);
    timer = setTimeout(leave, 12_000);
  }
  function schedule() { timer = setTimeout(appear, isPreview ? 1000 : 8000 + Math.random() * 12_000); }
  function onVisibility() {
    clearTimeout(timer);
    if (guest) { leave(); return; }
    if (!document.hidden && !finished) schedule();
  }
  document.addEventListener('visibilitychange', onVisibility);
  if (!document.hidden) schedule();
})();
