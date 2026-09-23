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

pet.disabled = false;
pet.addEventListener('click', () => {
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
  if (petCount % 3 === 0) {
    clearTimeout(messageTimer);
    message.replaceChildren(document.createTextNode('mrrp.'));
    avatar.classList.add('is-speaking');
    messageTimer = setTimeout(() => avatar.classList.remove('is-speaking'), 2400);
  }
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) tilt?.cancel();
});

for (const type of ['pointermove', 'pointerdown', 'keydown', 'scroll', 'focusin']) {
  window.addEventListener(type, wake, { passive: true });
}
document.addEventListener('visibilitychange', wake);
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
        copyDiscord.querySelector('.discord-username').textContent = 'thejeme';
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
