if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
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
  if (document.getElementById('discoveries').open) { secret = ''; return; }
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
  const replies = { pspsps: '?', hello: 'hi.', bye: 'bye.', purr: 'prrr.', sit: 'no.', '?': '?' };
  const greeting = Object.keys(replies).find((word) => secret.endsWith(word));
  if (greeting) {
    secret = '';
    say(replies[greeting]);
    return;
  }
  const action = ['fetch', 'rain', 'uemaim', 'uamuim'].find((word) => secret.endsWith(word));
  if (action) {
    secret = '';
    if (action === 'fetch') {
      clearTimeout(pawTimer);
      period.classList.remove('is-paw');
      briefly(period, 'is-missing');
      say('mine.');
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

// Keep a selectable username when JavaScript or the clipboard is unavailable.
const discordContact = document.getElementById('discord-contact');
const discordStatus = document.getElementById('discord-status');
if (navigator.clipboard?.writeText && window.isSecureContext) {
  const copyDiscord = document.createElement('button');
  copyDiscord.type = 'button';
  copyDiscord.className = 'discord-row';
  copyDiscord.setAttribute('aria-label', 'Discord: copy username thejeme');
  copyDiscord.title = 'Copy Discord username';
  copyDiscord.append(...[...discordContact.children].map((child) => child.cloneNode(true)));
  const confirmation = copyDiscord.querySelector('.discord-username');
  const check = document.createElement('span');
  check.className = 'copy-check';
  check.textContent = '✓';
  confirmation.setAttribute('aria-hidden', 'true');
  confirmation.replaceChildren(check, document.createTextNode('Copied'));
  discordContact.replaceWith(copyDiscord);
  let copying = false;
  let copiedTimer;
  copyDiscord.addEventListener('click', async () => {
    if (copying) return;
    copying = true;
    clearTimeout(copiedTimer);
    try {
      await navigator.clipboard.writeText('thejeme');
      copyDiscord.classList.add('is-copied');
      discordStatus.textContent = 'Discord username thejeme copied. Paste it into Add Friend in Discord.';
      copiedTimer = setTimeout(() => {
        copyDiscord.classList.remove('is-copied');
        discordStatus.textContent = '';
      }, 2400);
    } catch {
      copyDiscord.replaceWith(discordContact);
      discordContact.tabIndex = 0;
      discordContact.focus();
      discordStatus.className = 'discord-feedback';
      discordStatus.textContent = 'Select the username to copy it manually.';
    } finally {
      copying = false;
    }
  });
}


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
// Native button activation gives keyboard and assistive-tech users the same discovery.
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
  const valid = ['birthday', 'easter', 'halloween', 'christmas', 'newyear', 'none'];
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
