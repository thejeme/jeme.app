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
  messageTimer = setTimeout(() => avatar.classList.remove('is-speaking'), 2400);
}

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
    say('mrrp.');
  }
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) tilt?.cancel();
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
const themeColors = [...document.querySelectorAll('meta[name="theme-color"]')]
  .map((meta) => ({ meta, original: meta.content }));

window.addEventListener('keydown', (event) => {
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
  secret = (secret + event.key.toLowerCase()).slice(-6);
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
  if (secret !== 'miumau') return;
  secret = '';
  const blue = document.documentElement.classList.toggle('blue-mode');
  document.getElementById('blue-avatar').media = blue ? 'all' : 'not all';
  for (const { meta, original } of themeColors) {
    meta.content = blue ? (meta.media.includes('dark') ? '#142225' : '#f0f6f7') : original;
  }
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
  copyDiscord.querySelector('.discord-username').textContent = '';
  discordContact.replaceWith(copyDiscord);
  let copying = false;
  let copiedTimer;
  copyDiscord.addEventListener('click', async () => {
    if (copying) return;
    copying = true;
    clearTimeout(copiedTimer);
    try {
      await navigator.clipboard.writeText('thejeme');
      copyDiscord.querySelector('.discord-username').textContent = 'Copied';
      discordStatus.textContent = 'Discord username thejeme copied. Paste it into Add Friend in Discord.';
      copiedTimer = setTimeout(() => {
        copyDiscord.querySelector('.discord-username').textContent = '';
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
  clearTimeout(pawTimer);
  period.classList.remove('is-missing');
  period.classList.add('is-paw');
  pawTimer = setTimeout(() => period.classList.remove('is-paw'), 2400);
}
period.disabled = false;
period.addEventListener('dblclick', revealPaw);
// Native button activation gives keyboard and assistive-tech users the same discovery.
period.addEventListener('click', (event) => {
  if (event.detail === 0) revealPaw();
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
