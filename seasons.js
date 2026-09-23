(() => {
  const root = document.documentElement;
  const seasons = {
    christmas: { label: 'Merry Christmas', reply: 'merry meow.', art: '<path d="m8 23 9-17 9 17Z" fill="#a33e42"/><path d="M7 23h20v5H7z" fill="#fff9ed"/><circle cx="17" cy="6" r="3" fill="#fff9ed"/>' },
    birthday: { label: 'Birthday · 17 March', reply: 'cake?', art: '<path d="m7 27 9-23 10 23Z" fill="#8264a5"/><path d="m10 20 12-4m-9-5 7-2" stroke="#f8df9e" stroke-width="2"/><circle cx="16" cy="4" r="2" fill="#c7836a"/>' },
    easter: { label: 'Easter weekend', reply: 'found an egg.', art: '<path d="M25 21c0 12-18 12-18 0 0-7 6-17 9-17s9 10 9 17Z" fill="#b8c59a"/><path d="m8 18 4-3 4 3 4-3 4 3M8 24h16" stroke="#596a43" stroke-width="2" fill="none"/>' },
    halloween: { label: 'Halloween', reply: 'boo.', art: '<path d="m16 10 2-6" stroke="#71834c" stroke-width="3"/><path d="M16 11C2 4 0 29 13 28h6C32 29 30 4 16 11Z" fill="#cc792f"/><path d="m8 18 4-4 2 5m4 0 2-5 4 4M11 23l5 3 5-3" stroke="#40271e" stroke-width="1.5" fill="none"/>' },
    newyear: { label: 'Happy New Year', reply: 'new year. same cat.', art: '<path d="m16 3 3 9 10 4-10 4-3 9-3-9-10-4 10-4Z" fill="#ad8b39"/><path d="M26 2v6m-3-3h6" stroke="#ad8b39" stroke-width="1.5"/>' },
  };

  // Gregorian Easter: Oudin's algorithm, published by the US Naval Observatory.
  // https://aa.usno.navy.mil/faq/easter
  function easterDate(year) {
    const c = Math.floor(year / 100);
    const n = year % 19;
    const k = Math.floor((c - 17) / 25);
    let i = (c - Math.floor(c / 4) - Math.floor((c - k) / 3) + 19 * n + 15) % 30;
    i -= Math.floor(i / 28) * (1 - Math.floor(i / 28) * Math.floor(29 / (i + 1)) * Math.floor((21 - n) / 11));
    const j = (year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4)) % 7;
    const l = i - j;
    const month = 3 + Math.floor((l + 40) / 44);
    return new Date(year, month - 1, l + 28 - 31 * Math.floor(month / 4));
  }

  function seasonFor(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (month === 3 && day === 17) return 'birthday';
    if (month === 12 && day >= 24 && day <= 26) return 'christmas';
    if (month === 10 && day === 31) return 'halloween';
    if (month === 1 && day === 1) return 'newyear';
    const sunday = easterDate(date.getFullYear());
    const start = new Date(sunday); start.setDate(sunday.getDate() - 2);
    const end = new Date(sunday); end.setDate(sunday.getDate() + 2);
    if (date >= start && date < end) return 'easter';
    return '';
  }

  let preview = new URLSearchParams(location.search).get('season');
  const ornament = document.createElement('span');
  ornament.className = 'season-ornament';
  ornament.setAttribute('aria-hidden', 'true');
  const avatar = document.querySelector('.avatar');
  if (avatar?.tagName === 'PICTURE') avatar.parentElement.append(ornament);
  else avatar?.append(ornament);
  const label = document.createElement('p');
  label.className = 'season-label';
  document.querySelector('.introduction')?.append(label);
  let midnightTimer;
  const period = document.querySelector('.period');
  const canPlay = !!document.querySelector('.pet');
  const discovered = new Set();
  const candle = '<path d="M12 14h8v15h-8z" fill="#8264a5"/><path d="m12 20 8-3m-8 10 8-3" stroke="#f8df9e" stroke-width="2"/><path d="M16 10v4" stroke="currentColor"/>';
  const flame = '<path d="M16 1c-7 9-3 12 0 12s7-3 0-12Z" fill="#d78b2c"/>';
  const gift = '<path d="M5 13h22v15H5zM3 10h26v5H3z" fill="#a33e42"/><path d="M16 10v18" stroke="#f5d9a2" stroke-width="3"/><path d="M16 10C3 10 6-3 16 10c10-13 13 0 0 0Z" stroke="#f5d9a2" stroke-width="2" fill="none"/>';
  const fish = '<path d="M23 16c-7-11-17-6-19 0 2 6 12 11 19 0l6 6V10Z" fill="#87aaa1"/><circle cx="9" cy="15" r="1.5" fill="#203537"/>';
  const egg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  egg.setAttribute('viewBox', '0 0 32 32');
  egg.setAttribute('aria-hidden', 'true');
  egg.classList.add('season-egg');
  egg.innerHTML = seasons.easter.art;
  period?.append(egg);

  function discoveryKey(kind) { return `jeme-${kind}-${new Date().getFullYear()}`; }
  function hasFound(kind) {
    const key = discoveryKey(kind);
    try { return discovered.has(key) || sessionStorage.getItem(key) === 'yes'; }
    catch { return discovered.has(key); }
  }
  function remember(kind) {
    const key = discoveryKey(kind);
    discovered.add(key);
    try { sessionStorage.setItem(key, 'yes'); } catch { /* In-memory fallback. */ }
  }
  function reply(text) { window.dispatchEvent(new CustomEvent('season-reply', { detail: text })); }

  function renderDiscovery() {
    const key = root.dataset.season;
    const actionable = canPlay && (key === 'birthday' || key === 'christmas');
    ornament.removeAttribute('aria-hidden');
    if (actionable) {
      let button = ornament.querySelector('button');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'season-action';
        ornament.replaceChildren(button);
        button.addEventListener('click', () => {
          const current = root.dataset.season;
          if (hasFound(current)) return;
          remember(current);
          renderDiscovery();
          reply(current === 'birthday' ? 'wish made.' : 'for me?');
        });
      }
      const done = hasFound(key);
      button.setAttribute('aria-label', key === 'birthday' ? (done ? 'Birthday wish made' : 'Blow out the birthday candle') : (done ? 'A fish for em' : 'Open the Christmas present'));
      button.setAttribute('aria-disabled', String(done));
      const art = key === 'birthday' ? candle + (done ? '' : flame) : done ? fish : gift;
      button.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${art}</svg>`;
    } else {
      ornament.setAttribute('aria-hidden', 'true');
      ornament.innerHTML = seasons[key] ? `<svg viewBox="0 0 32 32" aria-hidden="true">${seasons[key].art}</svg>` : '';
    }
    ornament.classList.toggle('is-interactive', actionable);
    root.classList.toggle('egg-found', hasFound('easter'));
    if (period) period.setAttribute('aria-label', key === 'easter' && !hasFound('easter') ? 'Find the Easter egg' : 'Reveal a paw print');
  }
  window.addEventListener('season-egg', () => {
    if (root.dataset.season !== 'easter' || hasFound('easter')) return;
    remember('easter');
    renderDiscovery();
    reply('found it.');
  });


  function syncThemeColor() {
    const blue = root.classList.contains('blue-mode');
    const style = getComputedStyle(root);
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      const dark = meta.media.includes('dark');
      meta.content = blue ? (dark ? '#142225' : '#f0f6f7') :
        style.getPropertyValue(dark ? '--season-paper-dark' : '--season-paper-light').trim() || (dark ? '#191a18' : '#f7f6f2');
    }
  }

  function updateSeason() {
    const now = new Date();
    const key = preview === 'none' ? '' : Object.hasOwn(seasons, preview) ? preview : seasonFor(now);
    const season = seasons[key];
    if (season) {
      root.dataset.season = key;
      root.dataset.seasonReply = season.reply;
      label.textContent = key === 'christmas' && now.getMonth() === 11 && now.getDate() === 24 ? 'Christmas Eve' : season.label;
      ornament.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${season.art}</svg>`;
    } else {
      delete root.dataset.season;
      delete root.dataset.seasonReply;
      label.textContent = '';
      ornament.replaceChildren();
    }
    renderDiscovery();
    ornament.hidden = !season;
    label.hidden = !season;
    syncThemeColor();
    clearTimeout(midnightTimer);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    midnightTimer = setTimeout(updateSeason, midnight - now + 100);
  }

  updateSeason();
  window.addEventListener('season-preview', (event) => {
    const choice = event.detail;
    if (choice !== 'today' && choice !== 'none' && !Object.hasOwn(seasons, choice)) return;
    preview = choice === 'today' ? null : choice;
    const url = new URL(location.href);
    if (preview === null) url.searchParams.delete('season');
    else url.searchParams.set('season', preview);
    history.replaceState(history.state, '', url);
    root.classList.remove('blue-mode');
    const blueAvatar = document.getElementById('blue-avatar');
    if (blueAvatar) blueAvatar.media = 'not all';
    updateSeason();
  });
  window.addEventListener('themechange', syncThemeColor);
  window.addEventListener('pageshow', updateSeason);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateSeason(); });
})();
