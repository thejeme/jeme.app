(() => {
  const root = document.documentElement;
  // Add confirmed personal dates here: { month, day, label, year? }.
  const personalDates = { anniversary: null, milestones: [] };
  const seasons = {
    valentine: { label: 'Valentine’s Day', reply: 'fine. you’re alright.', firstPet: 'fine. you’re alright.', art: '<path d="M16 28 4 16C-4 5 10-2 16 8 22-2 36 5 28 16Z" fill="#b76780"/>' },
    aprilfools: { label: 'April Fools', firstPet: 'woof.', quiet: true, art: '' },
    vappu: { label: 'Hyvää vappua', reply: 'sima?', art: '<path d="M4 14Q16 3 28 14v7H4Z" fill="#f8f6ee" stroke="#76796e"/><path d="M4 20h24v4H4zM8 24q8 8 16 0" fill="#303632"/><circle cx="16" cy="20" r="2" fill="#b79d4c"/>' },
    catday: { label: 'International Cat Day', reply: 'finally. recognition.', firstPet: 'finally. recognition.', art: '<path d="m4 9 6 6 6-11 6 11 6-6-3 18H7Z" fill="#bea153"/><path d="M8 23h16" stroke="#705b2b" stroke-width="2"/>' },
    newyearseve: { label: 'New Year’s Eve', reply: 'see you next year.', firstPet: 'see you next year.', art: '<circle cx="16" cy="16" r="12" fill="none" stroke="#ad8b39" stroke-width="2"/><path d="M16 7v9l5 3" fill="none" stroke="#ad8b39" stroke-width="2"/>' },
    friday13: { label: 'Friday the 13th', firstPet: 'not my fault.', quiet: true, art: '' },
    anniversary: { label: 'Site anniversary', reply: 'still here.', art: '<path d="M12 14h8v15h-8z" fill="#8264a5"/><path d="M16 1c-7 9-3 12 0 12s7-3 0-12Z" fill="#d78b2c"/>' },
    milestone: { label: 'A little milestone', reply: 'worth celebrating.', art: '<path d="m16 3 4 8 9 2-7 6 2 10-8-5-8 5 2-10-7-6 9-2Z" fill="#bea153"/>' },
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
    const matches = (entry) => entry && entry.month === month && entry.day === day && (!entry.year || date.getFullYear() >= entry.year);
    if (matches(personalDates.anniversary)) return 'anniversary';
    if (personalDates.milestones.some(matches)) return 'milestone';
    if (month === 2 && day === 14) return 'valentine';
    if (month === 4 && day === 1) return 'aprilfools';
    if ((month === 4 && day === 30) || (month === 5 && day === 1)) return 'vappu';
    if (month === 8 && day === 8) return 'catday';
    if (month === 12 && day === 31) return 'newyearseve';
    if (month === 12 && day >= 24 && day <= 26) return 'christmas';
    if (month === 10 && day === 31) return 'halloween';
    if (month === 1 && day === 1) return 'newyear';
    const sunday = easterDate(date.getFullYear());
    const start = new Date(sunday); start.setDate(sunday.getDate() - 2);
    const end = new Date(sunday); end.setDate(sunday.getDate() + 2);
    if (date >= start && date < end) return 'easter';
    if (day === 13 && date.getDay() === 5) return 'friday13';
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
  let activeSeason;
  let manualBlue = null;
  const period = document.querySelector('.period');
  const canPlay = !!document.querySelector('.pet');
  const discovered = new Set();
  const candle = '<path d="M12 14h8v15h-8z" fill="#8264a5"/><path d="m12 20 8-3m-8 10 8-3" stroke="#f8df9e" stroke-width="2"/><path d="M16 10v4" stroke="currentColor"/>';
  const flame = '<path d="M16 1c-7 9-3 12 0 12s7-3 0-12Z" fill="#d78b2c"/>';
  const gift = '<path d="M5 13h22v15H5zM3 10h26v5H3z" fill="#a33e42"/><path d="M16 10v18" stroke="#f5d9a2" stroke-width="3"/><path d="M16 10C3 10 6-3 16 10c10-13 13 0 0 0Z" stroke="#f5d9a2" stroke-width="2" fill="none"/>';
  const fish = '<path d="M23 16c-7-11-17-6-19 0 2 6 12 11 19 0l6 6V10Z" fill="#87aaa1"/><circle cx="9" cy="15" r="1.5" fill="#203537"/>';
  const balloon = '<ellipse cx="16" cy="11" rx="8" ry="10" fill="#b76780"/><path d="m16 21-2 3h4Zm0 3q-4 3 0 7" stroke="#827b6b" fill="none"/>';
  const cap = document.createElement('span');
  cap.className = 'vappu-cap';
  cap.setAttribute('aria-hidden', 'true');
  cap.innerHTML = `<svg viewBox="0 0 32 32">${seasons.vappu.art}</svg>`;
  if (canPlay) avatar.append(cap);
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
    const actionable = canPlay && ['birthday', 'christmas', 'vappu', 'anniversary'].includes(key);
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
          reply(current === 'vappu' ? 'pop.' : current === 'christmas' ? 'for me?' : 'wish made.');
        });
      }
      const done = hasFound(key);
      const names = {
        birthday: ['Blow out the birthday candle', 'Birthday wish made'],
        anniversary: ['Blow out the anniversary candle', 'Anniversary wish made'],
        christmas: ['Open the Christmas present', 'A fish for em'],
        vappu: ['Pop the Vappu balloon', 'Balloon popped'],
      };
      button.setAttribute('aria-label', names[key][Number(done)]);
      button.setAttribute('aria-disabled', String(done));
      const art = ['birthday', 'anniversary'].includes(key) ? candle + (done ? '' : flame) : key === 'vappu' ? (done ? seasons.vappu.art : balloon) : done ? fish : gift;
      button.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${art}</svg>`;
    } else {
      ornament.setAttribute('aria-hidden', 'true');
      ornament.innerHTML = seasons[key] ? `<svg viewBox="0 0 32 32" aria-hidden="true">${seasons[key].art}</svg>` : '';
    }
    ornament.classList.toggle('is-interactive', actionable);
    root.classList.toggle('egg-found', hasFound('easter'));
    if (period) period.setAttribute('aria-label', key === 'easter' && !hasFound('easter') ? 'Find the Easter egg' : 'Peek inside the dot');
  }
  window.addEventListener('season-pet', (event) => {
    const key = root.dataset.season;
    const text = seasons[key]?.firstPet;
    if (!text) return;
    const now = new Date();
    const marker = `first-${key}-${now.getMonth() + 1}-${now.getDate()}`;
    if (hasFound(marker)) return;
    remember(marker);
    event.preventDefault();
    reply(text);
  });
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
    if (key !== activeSeason) manualBlue = null;
    activeSeason = key;
    const blue = manualBlue ?? (!season || !!season.quiet);
    root.classList.toggle('blue-mode', blue);
    const blueAvatar = document.getElementById('blue-avatar');
    if (blueAvatar) blueAvatar.media = blue ? 'all' : 'not all';
    if (season) {
      root.dataset.season = key;
      if (season.reply) root.dataset.seasonReply = season.reply;
      else delete root.dataset.seasonReply;
      label.textContent = key === 'christmas' && now.getMonth() === 11 && now.getDate() === 24 ? 'Christmas Eve' : season.label;
      ornament.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${season.art}</svg>`;
    } else {
      delete root.dataset.season;
      delete root.dataset.seasonReply;
      label.textContent = '';
      ornament.replaceChildren();
    }
    if (key === 'milestone') {
      const milestone = personalDates.milestones.find((entry) => entry.month === now.getMonth() + 1 && entry.day === now.getDate());
      if (milestone) label.textContent = milestone.label;
    }
    renderDiscovery();
    ornament.hidden = !season || !!season.quiet;
    label.hidden = !season || !!season.quiet;
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
    manualBlue = null;
    updateSeason();
  });
  window.addEventListener('themechange', () => {
    manualBlue = root.classList.contains('blue-mode');
    syncThemeColor();
  });
  window.addEventListener('pageshow', updateSeason);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateSeason(); });
})();
