'use strict';

/**
 * Renderer: paints the clock rows, drives the settings panel, and reports the
 * measured card size back to the main process (the window is sized to content).
 *
 * If `window.clock` is missing the page is being opened directly in a browser, so a
 * mock bridge takes over -- handy for iterating on the styling without launching
 * Electron.
 */

(function () {
  const { Zones, Format } = window;

  /** Must stay in sync with --pad in styles.css. */
  const CARD_PADDING = 14;

  // -------------------------------------------------------------------------
  // Bridge
  // -------------------------------------------------------------------------

  function createMockBridge() {
    const mock = {
      zones: ['Asia/Shanghai', 'America/Los_Angeles', 'Europe/London'],
      opacity: 1,
      density: 'comfortable',
      alwaysOnTop: true,
      autoLaunch: false,
      maxZones: 12,
      minOpacity: 0.3
    };
    const listeners = new Set();
    setInterval(() => listeners.forEach((fn) => fn(Date.now())), 1000);
    return {
      getState: async () => ({ ...mock, now: Date.now() }),
      setZones: async (zones) => {
        mock.zones = zones;
        return zones;
      },
      setOpacity: async (value) => {
        mock.opacity = value;
        return value;
      },
      setDensity: async (value) => {
        mock.density = value;
        return value;
      },
      setAlwaysOnTop: async (value) => {
        mock.alwaysOnTop = value;
        return value;
      },
      setAutoLaunch: async (value) => {
        mock.autoLaunch = value;
        return value;
      },
      resize: async () => {},
      resetPosition: async () => {},
      quit: async () => {},
      onTick: (callback) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
      }
    };
  }

  const bridge = window.clock || createMockBridge();

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const state = {
    zones: [],
    opacity: 1,
    density: 'comfortable',
    alwaysOnTop: true,
    autoLaunch: false,
    maxZones: 12,
    minOpacity: 0.3
  };

  /** @type {Array<{tz:string, time:HTMLElement, dateText:HTMLElement, chip:HTMLElement}>} */
  let rowRefs = [];
  let panelOpen = false;

  // -------------------------------------------------------------------------
  // DOM
  // -------------------------------------------------------------------------

  const byId = (id) => document.getElementById(id);

  const card = byId('card');
  const zoneList = byId('zoneList');
  const emptyState = byId('emptyState');
  const settingsBtn = byId('settingsBtn');
  const panel = byId('panel');
  const searchInput = byId('searchInput');
  const searchResults = byId('searchResults');
  const presetChips = byId('presetChips');
  const manageList = byId('manageList');
  const toggleOnTop = byId('toggleOnTop');
  const toggleAutoLaunch = byId('toggleAutoLaunch');
  const densitySeg = byId('densitySeg');
  const opacityRange = byId('opacityRange');
  const opacityValue = byId('opacityValue');
  const resetBtn = byId('resetBtn');
  const quitBtn = byId('quitBtn');

  // -------------------------------------------------------------------------
  // Clock rows
  // -------------------------------------------------------------------------

  function buildRows() {
    zoneList.textContent = '';
    rowRefs = [];

    for (const tz of state.zones) {
      const label = Zones.labelFor(tz);

      const row = document.createElement('div');
      row.className = 'zone';
      row.title = `${label.city} · ${tz}`;

      const head = document.createElement('div');
      head.className = 'zone-head';

      const place = document.createElement('span');
      place.className = 'zone-place';
      const code = document.createElement('span');
      code.className = 'zone-code';
      code.textContent = label.code;
      place.append(code);
      if (label.country) {
        const country = document.createElement('span');
        country.className = 'zone-country';
        country.textContent = `, ${label.country}`;
        place.append(country);
      }

      const dateWrap = document.createElement('span');
      dateWrap.className = 'zone-date';
      const dateText = document.createElement('span');
      dateText.className = 'zone-date-text';
      const chip = document.createElement('span');
      chip.className = 'day-chip';
      chip.hidden = true;
      dateWrap.append(dateText, chip);

      head.append(place, dateWrap);

      const time = document.createElement('div');
      time.className = 'zone-time';

      row.append(head, time);
      zoneList.append(row);

      rowRefs.push({ tz, time, dateText, chip });
    }

    const isEmpty = rowRefs.length === 0;
    emptyState.hidden = !isEmpty;
    zoneList.hidden = isEmpty;
  }

  /** Refresh every row's text for a given instant. */
  function paint(now) {
    if (rowRefs.length === 0) return;
    const localDate = new Date(now);

    for (const ref of rowRefs) {
      const parts = Format.zoneParts(ref.tz, localDate);
      ref.time.textContent = Format.formatTime(parts);
      ref.dateText.textContent = `${Format.formatDate(parts)} ${Format.weekdayCN(parts)}`;

      const chipText = Format.formatDayOffset(Format.dayOffset(parts, localDate));
      ref.chip.textContent = chipText;
      ref.chip.hidden = chipText === '';
    }
  }

  // -------------------------------------------------------------------------
  // Zones: add / remove / reorder
  // -------------------------------------------------------------------------

  async function commitZones(next) {
    state.zones = next.slice(0, state.maxZones);
    await bridge.setZones(state.zones);
    buildRows();
    renderChips();
    renderManage();
    paint(Date.now());
    scheduleMeasure();
  }

  function addZone(tz) {
    if (state.zones.includes(tz) || state.zones.length >= state.maxZones) return;
    searchInput.value = '';
    renderSearchResults();
    commitZones([...state.zones, tz]);
  }

  function removeZone(tz) {
    commitZones(state.zones.filter((zone) => zone !== tz));
  }

  function moveZone(index, delta) {
    const next = [...state.zones];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    commitZones(next);
  }

  // -------------------------------------------------------------------------
  // Panel: preset chips
  // -------------------------------------------------------------------------

  function renderChips() {
    presetChips.textContent = '';
    const full = state.zones.length >= state.maxZones;

    for (const tz of Zones.PRESETS) {
      const label = Zones.labelFor(tz);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = label.city || label.code;
      chip.title = `${label.code}, ${label.country} · ${tz}`;

      const selected = state.zones.includes(tz);
      chip.disabled = selected || full;
      if (!selected) chip.addEventListener('click', () => addZone(tz));

      presetChips.append(chip);
    }
  }

  // -------------------------------------------------------------------------
  // Panel: selected-zone manager
  // -------------------------------------------------------------------------

  function renderManage() {
    manageList.textContent = '';
    const count = state.zones.length;

    if (count === 0) {
      const hint = document.createElement('div');
      hint.className = 'result-none';
      hint.textContent = '尚未选择时区';
      manageList.append(hint);
      return;
    }

    state.zones.forEach((tz, index) => {
      const label = Zones.labelFor(tz);

      const row = document.createElement('div');
      row.className = 'manage-row';

      const name = document.createElement('span');
      name.className = 'manage-name';
      name.textContent = Zones.displayName(tz);
      name.title = tz;

      const code = document.createElement('span');
      code.className = 'manage-code';
      code.textContent = label.code;

      row.append(name, code);

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'mini';
      up.textContent = '↑';
      up.title = '上移';
      up.disabled = index === 0;
      up.addEventListener('click', () => moveZone(index, -1));

      const down = document.createElement('button');
      down.type = 'button';
      down.className = 'mini';
      down.textContent = '↓';
      down.title = '下移';
      down.disabled = index === count - 1;
      down.addEventListener('click', () => moveZone(index, 1));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'mini remove';
      remove.textContent = '×';
      remove.title = '移除';
      remove.addEventListener('click', () => removeZone(tz));

      row.append(up, down, remove);
      manageList.append(row);
    });
  }

  // -------------------------------------------------------------------------
  // Panel: search
  // -------------------------------------------------------------------------

  function renderSearchResults() {
    const query = searchInput.value;
    searchResults.textContent = '';

    if (query.trim() === '') {
      searchResults.hidden = true;
      return;
    }

    const results = Zones.searchZones(query, 8);

    if (results.length === 0) {
      const none = document.createElement('div');
      none.className = 'result-none';
      none.textContent = '没有匹配的时区';
      searchResults.append(none);
      searchResults.hidden = false;
      return;
    }

    const full = state.zones.length >= state.maxZones;

    for (const item of results) {
      const selected = state.zones.includes(item.tz);
      const label = item.label;

      const row = document.createElement('div');
      row.className = 'result';
      row.title = item.tz;

      const place = document.createElement('span');
      place.className = 'result-place';
      place.textContent = label.city || label.code;

      const meta = document.createElement('span');
      meta.className = 'result-tz';
      const tag = [label.code, label.country].filter(Boolean).join(', ');
      meta.textContent = selected
        ? '已添加'
        : full
          ? '已达上限'
          : [tag, item.hint].filter(Boolean).join(' · ');

      row.append(place, meta);

      if (selected || full) {
        row.style.opacity = '0.55';
      } else {
        row.addEventListener('click', () => addZone(item.tz));
      }

      searchResults.append(row);
    }

    searchResults.hidden = false;
  }

  /** Enter adds the top match, matching the keyboard-first feel of a search box. */
  function addFirstMatch() {
    const first = Zones.searchZones(searchInput.value, 1)[0];
    if (first) addZone(first.tz);
  }

  // -------------------------------------------------------------------------
  // Panel: toggles, density, opacity
  // -------------------------------------------------------------------------

  function setSwitch(element, on) {
    element.setAttribute('aria-checked', String(!!on));
  }

  function applyDensity(density) {
    state.density = density === 'compact' ? 'compact' : 'comfortable';
    card.classList.toggle('compact', state.density === 'compact');
    for (const button of densitySeg.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.density === state.density));
    }
    scheduleMeasure();
  }

  function applyOpacity(value) {
    const clamped = Math.min(1, Math.max(state.minOpacity, Number(value) || 1));
    state.opacity = clamped;
    document.documentElement.style.setProperty('--alpha', String(clamped));
    const percent = Math.round(clamped * 100);
    opacityRange.value = String(percent);
    opacityValue.textContent = `${percent}%`;
  }

  // -------------------------------------------------------------------------
  // Window sizing
  // -------------------------------------------------------------------------

  let lastReported = { width: 0, height: 0 };
  let measureFrame = 0;

  function scheduleMeasure() {
    if (measureFrame) return;
    measureFrame = requestAnimationFrame(() => {
      measureFrame = 0;
      measure();
    });
  }

  function measure() {
    const width = Math.ceil(card.offsetWidth) + CARD_PADDING * 2;
    const height = Math.ceil(card.offsetHeight) + CARD_PADDING * 2;
    if (width === lastReported.width && height === lastReported.height) return;
    lastReported = { width, height };
    bridge.resize({ width, height });
  }

  // -------------------------------------------------------------------------
  // Panel visibility
  // -------------------------------------------------------------------------

  function setPanelOpen(open) {
    panelOpen = !!open;
    panel.hidden = !panelOpen;
    card.classList.toggle('panel-open', panelOpen);
    settingsBtn.setAttribute('aria-expanded', String(panelOpen));

    if (panelOpen) {
      renderChips();
      renderManage();
      // Wait a frame: focusing an element that was just unhidden can be ignored.
      requestAnimationFrame(() => searchInput.focus());
    } else {
      searchInput.value = '';
      searchResults.hidden = true;
    }

    scheduleMeasure();
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  settingsBtn.addEventListener('click', () => setPanelOpen(!panelOpen));

  searchInput.addEventListener('input', renderSearchResults);

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addFirstMatch();
    }
  });

  // Clicking anywhere outside the search field dismisses the suggestion list.
  document.addEventListener('mousedown', (event) => {
    if (!searchResults.hidden && !event.target.closest('.field')) {
      searchResults.hidden = true;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panelOpen) setPanelOpen(false);
  });

  toggleOnTop.addEventListener('click', async () => {
    const next = toggleOnTop.getAttribute('aria-checked') !== 'true';
    setSwitch(toggleOnTop, next); // optimistic
    setSwitch(toggleOnTop, await bridge.setAlwaysOnTop(next));
  });

  toggleAutoLaunch.addEventListener('click', async () => {
    const next = toggleAutoLaunch.getAttribute('aria-checked') !== 'true';
    setSwitch(toggleAutoLaunch, next); // optimistic
    setSwitch(toggleAutoLaunch, await bridge.setAutoLaunch(next));
  });

  densitySeg.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-density]');
    if (!button) return;
    applyDensity(button.dataset.density);
    bridge.setDensity(state.density);
  });

  opacityRange.addEventListener('input', () => {
    applyOpacity(Number(opacityRange.value) / 100);
  });
  opacityRange.addEventListener('change', () => {
    bridge.setOpacity(state.opacity);
  });

  resetBtn.addEventListener('click', () => {
    bridge.resetPosition();
    setPanelOpen(false);
  });

  quitBtn.addEventListener('click', () => bridge.quit());

  new ResizeObserver(scheduleMeasure).observe(card);

  // -------------------------------------------------------------------------
  // Boot
  // -------------------------------------------------------------------------

  async function init() {
    const loaded = await bridge.getState();
    Object.assign(state, loaded);

    applyDensity(state.density);
    applyOpacity(state.opacity);
    setSwitch(toggleOnTop, state.alwaysOnTop);
    setSwitch(toggleAutoLaunch, state.autoLaunch);

    buildRows();
    renderChips();
    renderManage();
    paint(loaded.now || Date.now());
    scheduleMeasure();

    bridge.onTick((timestamp) => paint(timestamp || Date.now()));
  }

  init();

  // Fonts can settle after first paint and change the measured height.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure);
  }
})();
