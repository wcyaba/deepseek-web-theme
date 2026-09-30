/* ==========================================================================
   ORCA LINK · DeepSeek 官网版（Edge 扩展）内容脚本
   行为与参数移植自 @smalltailqwq/dsh-client-ui-skin-orca-link（MIT 代码 /
   美术 CC BY-NC-SA 4.0，禁止商用）。官网没有 DSH 的插件接口，这里用
   DOM 无关的启发式手段达成同样的视觉效果。
   ========================================================================== */
(() => {
  'use strict';

  const MARK = 'data-orca-link';
  const DEFAULTS = { scene: true, character: true, square: true, reveal: false };

  /* ------------------------------------------------ 皮肤原始常量（照搬） */
  const STATUS_LABELS = {
    standby: 'LINK ACTIVE',
    syncing: 'LINK SYNC',
    working: 'TASK RUNNING',
    approval: 'AUTH REQUEST',
    input: 'INPUT REQUIRED',
    review: 'PLAN REVIEW',
    complete: 'TASK COMPLETE',
    fault: 'LINK FAULT',
    offline: 'LINK OFFLINE',
    ready: 'SESSION READY',
  };
  const STATUS_ROWS = {
    standby: 0, syncing: 1, working: 2, approval: 3, input: 4,
    review: 5, complete: 6, fault: 7, offline: 8, ready: 9,
  };
  const FRAME_SEQUENCES = {
    standby: [0, 0, 0, 0, 1, 2, 3, 2, 1],
  };
  const FRAME_DURATIONS_MS_BY_STATUS = {
    standby: [700, 700, 700, 700, 130, 90, 110, 90, 130],
  };
  const STATUS_FRAME_INTERVAL = 83;
  // 源图 236px 单元下的逐帧质心补偿（皮肤原表）
  const STATUS_FRAME_ALIGNMENT = {
    standby: [[0, 0], [5, -0.2], [2.6, 0.1], [0.8, -0.2], [0.9, 2.2], [2.6, 2.1], [2.9, 1.9], [0, 0]],
    syncing: [[-3.5, 1], [-2.9, 0.8], [0.4, 0.6], [1.3, 0.4], [-1.1, 3.9], [-2, 4.2], [0.8, 3.4], [-3.5, 1]],
    working: [[5.4, -1.6], [5, -1.8], [5.5, -1.6], [6.2, -1.7], [5.2, 0.9], [4.5, 0.6], [6.3, 0.4], [5.4, -1.6]],
    approval: [[3.2, -1.8], [2.6, -1.6], [3.3, -0.1], [4.2, 1.3], [4.2, 1.1], [3, 1.1], [3.3, 0.6], [5.3, 1]],
    input: [[9.6, 9.8], [8.8, 9.7], [8.5, 10.7], [8.7, 12.5], [7.3, 12.6], [7.3, 12.4], [8.1, 12.5], [7.3, 12.4]],
    review: [[11.8, -2.5], [5.8, 2], [8.4, 2.1], [9.1, -0.1], [6.4, 1.1], [13.7, 1.8], [10.8, -0.2], [11.8, -2.5]],
    complete: [[1.8, -2.3], [-0.1, -2.7], [-0.9, -2.7], [0.8, -1.3], [10, -2.4], [-1.3, -1.1], [-0.8, -0.8], [8.1, -0.2]],
    fault: [[9.7, -0.8], [10.2, -0.8], [9.7, -0.4], [16.6, -0.2], [12.4, -0.1], [12.8, 0.7], [14.3, -0.7], [11.8, 1.4]],
    offline: [[10.4, -1.8], [9.7, -2], [10, -2], [11.7, -2], [11.1, -1.5], [9.5, -1.5], [10.8, -1.9], [10.4, -1.8]],
    ready: [[6.1, -0.1], [5.7, -0.4], [5.2, -1.1], [7.1, -1.2], [5.9, 0.9], [5.7, 0.8], [5.6, 0.6], [7.1, 0.6]],
  };
  const ATLAS_CELL = 236;

  /* -------------------------------------------------------------- 运行时 */
  const asset = (p) => chrome.runtime.getURL('assets/' + p);
  const state = {
    settings: { ...DEFAULTS },
    scene: null,
    widgets: null,
    character: null,
    sprite: null,
    chipLabel: null,
    status: 'ready',
    frame: 0,
    frameTimer: 0,
    statusResetTimer: 0,
    cleared: new Set(),
    anchors: new WeakSet(),
    favicon: [],
    dark: false,
    sceneMode: 'hero',
    contentMo: null,
    themeMo: null,
    observerTimer: 0,
    href: location.href,
    drag: null,
  };

  /* ------------------------------------------------------- 主题（亮/暗） */
  function detectDark() {
    const html = document.documentElement;
    const body = document.body;
    if (!body) return null;
    // 站点实证机制：深色 = body.dark 且 body[data-ds-dark-theme="dark"]；浅色 = body.light
    if (body.hasAttribute('data-ds-dark-theme')) return true;
    if (body.classList.contains('dark')) return true;
    if (body.classList.contains('light')) return false;
    const attrs = [
      html.getAttribute('data-theme'), html.getAttribute('data-color-mode'),
      html.getAttribute('theme'), body.getAttribute('data-theme'),
      body.getAttribute('data-color-mode'), body.className,
    ].filter((v) => typeof v === 'string' && v.length < 200).join(' ');
    if (/dark|night/i.test(attrs)) return true;
    if (/light|day/i.test(attrs)) return false;
    // 兜底：采样站点自身底色亮度（要在我清透明之前采）
    for (const el of [body, document.querySelector('#root'), html]) {
      if (!el || state.cleared.has(el)) continue;
      const bg = getComputedStyle(el).backgroundColor;
      const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(bg);
      if (!m) continue;
      const [r, g, b] = [+m[1], +m[2], +m[3]];
      if (r + g + b === 0 && /rgba\(\s*0,\s*0,\s*0,\s*0/.test(bg)) continue;
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return lum < 0.45;
    }
    return null; // 无法判定，沿用上一次结果
  }

  function applyTheme() {
    const detected = detectDark();
    if (detected !== null) state.dark = detected;
    document.documentElement.toggleAttribute('data-orca-dark', state.dark);
    if (state.scene) state.scene.dataset.theme = state.dark ? 'dark' : 'light';
  }

  /* --------------------------------------------------- 场景（空态/工作态） */
  function resolveSceneMode() {
    // 官网会话 URL 形如 /a/chat/s/<id>；新建页是空态
    if (/\/a\/chat\/s\//.test(location.pathname)) return 'active';
    const bubbles = document.querySelectorAll('[class*="message"], [class*="chat-item"], [data-message-id]');
    return bubbles.length > 2 ? 'active' : 'hero';
  }

  function applySceneMode() {
    const mode = resolveSceneMode();
    if (mode === state.sceneMode && state.scene.dataset.scene === mode) return;
    state.sceneMode = mode;
    if (state.scene) state.scene.dataset.scene = mode;
  }

  function mountScene() {
    const scene = document.createElement('div');
    scene.id = 'orca-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.dataset.theme = state.dark ? 'dark' : 'light';
    scene.dataset.scene = state.sceneMode;
    const layers = [
      ['light', 'hero', 'scene-light-hero.webp'],
      ['light', 'active', 'scene-light-active.webp'],
      ['dark', 'hero', 'scene-dark-hero.webp'],
      ['dark', 'active', 'scene-dark-active.webp'],
    ];
    for (const [theme, role, file] of layers) {
      const layer = document.createElement('div');
      layer.className = 'orca-scene-layer';
      layer.dataset.role = role;
      layer.dataset.theme = theme;
      layer.style.backgroundImage = `url("${asset(file)}")`;
      if (theme === 'dark') layer.style.display = 'none';
      scene.append(layer);
    }
    document.body.prepend(scene);
    state.scene = scene;
  }

  function syncSceneTheme() {
    if (!state.scene) return;
    state.scene.dataset.theme = state.dark ? 'dark' : 'light';
    for (const layer of state.scene.children) {
      layer.style.display = layer.dataset.theme === (state.dark ? 'dark' : 'light') ? '' : 'none';
    }
  }

  /* ------------------------------------- 背景兜底透明化（站改版遮挡时启用）
     正常情况下由宿主令牌层负责（--dsw-alias-bg-base 本身就是半透明值），
     这里只是站方结构变化导致背景被盖住时的手动保险，默认关闭。 */
  const ANCHOR_SELECTORS = [
    '.ds-textarea', 'textarea', '._27c9245', '[contenteditable="true"]', '[role="textbox"]',
    '.b8812f16', '._55ff781', '.the-header', '.ds-scroll-area',
    'nav', '[role="navigation"]', 'aside', '[role="complementary"]', 'main', 'header',
    '[class*="sidebar" i]', '[class*="sider" i]',
  ];

  function clearAncestors() {
    if (!state.settings.reveal) return;
    for (const sel of ANCHOR_SELECTORS) {
      const node = document.querySelector(sel);
      if (!node || state.anchors.has(node)) continue;
      state.anchors.add(node);
      let el = node;
      let depth = 0;
      while (el && el !== document.documentElement && depth < 14) {
        if (!state.cleared.has(el)) {
          const cs = getComputedStyle(el);
          const opaque = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none';
          if (opaque && !el.hasAttribute('data-orca-surface')) {
            el.setAttribute('data-orca-cleared', '');
            state.cleared.add(el);
          }
        }
        el = el.parentElement;
        depth++;
      }
      // 输入框最近的那层当作 composer 卡片，给它皮肤的暖白/暗面
      if (sel === 'textarea' || sel === '[contenteditable="true"]' || sel === '[role="textbox"]') {
        let card = node;
        for (let i = 0; i < 5 && card && card !== document.body; i++) {
          card = card.parentElement;
          if (!card) break;
          const h = card.getBoundingClientRect().height;
          if (h >= 40 && h <= 260 && !card.hasAttribute('data-orca-cleared')) {
            card.setAttribute('data-orca-surface-soft', '');
            break;
          }
        }
      }
    }
  }

  function restoreCleared() {
    for (const el of state.cleared) {
      el.removeAttribute('data-orca-cleared');
      el.removeAttribute('data-orca-surface-soft');
    }
    state.cleared.clear();
    document.querySelectorAll('[data-orca-cleared]').forEach((el) => el.removeAttribute('data-orca-cleared'));
    document.querySelectorAll('[data-orca-surface-soft]').forEach((el) => el.removeAttribute('data-orca-surface-soft'));
  }

  /* ------------------------------------------------------------ 状态角色 */
  function sequenceFor(status) {
    return FRAME_SEQUENCES[status] || [0, 1, 2, 3, 4, 5, 6, 7];
  }

  function renderFrame() {
    if (!state.sprite) return;
    const status = state.status;
    const seq = sequenceFor(status);
    const row = STATUS_ROWS[status] ?? 0;
    const frame = seq[state.frame % seq.length];
    const scale = (state.settings.charSize || 118) / ATLAS_CELL;
    const align = (STATUS_FRAME_ALIGNMENT[status] || [])[state.frame % seq.length] || [0, 0];
    state.sprite.style.setProperty('--orca-col', String(frame));
    state.sprite.style.setProperty('--orca-row', String(row));
    state.sprite.style.setProperty('--orca-ax', (align[0] * scale).toFixed(2) + 'px');
    state.sprite.style.setProperty('--orca-ay', (align[1] * scale).toFixed(2) + 'px');
  }

  function tickFrame() {
    const seq = sequenceFor(state.status);
    const durations = FRAME_DURATIONS_MS_BY_STATUS[state.status];
    const delay = durations ? durations[state.frame % durations.length] : STATUS_FRAME_INTERVAL;
    state.frame = (state.frame + 1) % seq.length;
    renderFrame();
    state.frameTimer = window.setTimeout(tickFrame, delay);
  }

  function setStatus(status, holdMs) {
    if (!STATUS_LABELS[status]) return;
    if (state.status !== status) {
      state.status = status;
      state.frame = 0;
    }
    if (state.character) state.character.dataset.status = status;
    if (state.widgets) state.widgets.dataset.status = status;
    if (state.chipLabel) state.chipLabel.textContent = STATUS_LABELS[status];
    renderFrame();
    if (state.frameTimer) clearTimeout(state.frameTimer);
    tickFrame();
    if (state.statusResetTimer) clearTimeout(state.statusResetTimer);
    state.statusResetTimer = 0;
    if (holdMs) {
      state.statusResetTimer = window.setTimeout(() => {
        state.statusResetTimer = 0;
        setStatus(deriveStatus());
      }, holdMs);
    }
  }

  /* ------------------------------------------------ 站点状态 → 皮肤状态 */
  function isGenerating() {
    const stop = document.querySelector(
      'button[aria-label*="停止"], button[aria-label*="Stop" i], [class*="stop" i][role="button"], [data-testid*="stop" i]'
    );
    if (stop) return true;
    return !!document.querySelector('[class*="streaming" i], [class*="loading" i][class*="message" i]');
  }

  function hasInputText() {
    for (const sel of ['textarea', '[contenteditable="true"]', '[role="textbox"]']) {
      const node = document.querySelector(sel);
      if (!node) continue;
      const value = 'value' in node && typeof node.value === 'string' ? node.value : node.textContent;
      if (value && value.trim().length) return true;
    }
    return false;
  }

  function hasFault() {
    return !!document.querySelector('[role="alert"], [class*="error" i][role="alert"]');
  }

  function deriveStatus() {
    if (hasFault()) return 'fault';
    if (isGenerating()) return 'working';
    if (hasInputText()) return 'input';
    return 'standby';
  }

  function mountCharacter(row) {
    const el = document.createElement('div');
    el.id = 'orca-character';
    el.dataset.status = state.status;
    el.title = 'ORCA LINK · 拖拽移动';
    const sprite = document.createElement('div');
    sprite.className = 'orca-char-sprite';
    const bubble = document.createElement('div');
    bubble.className = 'orca-char-bubble';
    el.append(sprite, bubble);
    row.append(el);
    state.character = el;
    state.sprite = sprite;
    setStatus('ready', 1800);
  }

  function mountChip(row) {
    const chip = document.createElement('div');
    chip.className = 'orca-signal-chip';
    chip.innerHTML = '<span class="orca-signal-dot"></span><span class="orca-signal-chip-label"></span>';
    row.append(chip);
    state.chipLabel = chip.querySelector('.orca-signal-chip-label');
    if (state.chipLabel) state.chipLabel.textContent = STATUS_LABELS[state.status];
  }

  /* ---------------------------------------------------------- 页面图标 */
  /** 标签页图标：用 DeepSeek 官网蓝版本，避免与 DSH 侧的 ORCA 图标混淆。 */
  function installFavicon() {
    const href = asset('favicon-deepseek-blue.svg');
    for (const link of document.querySelectorAll('link[rel~="icon"]')) {
      if (!link.hasAttribute('data-orca-favicon')) {
        link.setAttribute('data-orca-favicon', link.getAttribute('href') || '');
        link.setAttribute('data-orca-favicon-type', link.getAttribute('type') || '');
        link.setAttribute('data-orca-favicon-media', link.getAttribute('media') || '');
      }
      link.setAttribute('href', href);
      if (link.hasAttribute('type')) link.setAttribute('type', 'image/svg+xml');
      // 站点可能给亮/暗各挂一条带 media 的图标，指向同一个蓝色版后 media 只会让其中一条失效
      link.removeAttribute('media');
    }
    if (!document.querySelector('link[rel~="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = href;
      link.setAttribute('data-orca-favicon', '');
      document.head.append(link);
    }
    state.favicon = [...document.querySelectorAll('link[data-orca-favicon]')];
  }

  function restoreFavicon() {
    for (const link of document.querySelectorAll('link[data-orca-favicon]')) {
      const original = link.getAttribute('data-orca-favicon');
      if (original) link.setAttribute('href', original);
      else link.remove();
      const type = link.getAttribute('data-orca-favicon-type');
      if (type) link.setAttribute('type', type); else link.removeAttribute('type');
      const media = link.getAttribute('data-orca-favicon-media');
      if (media) link.setAttribute('media', media); else link.removeAttribute('media');
      link.removeAttribute('data-orca-favicon');
      link.removeAttribute('data-orca-favicon-type');
      link.removeAttribute('data-orca-favicon-media');
    }
  }

  /* ------------------------------------------------------------ 部件容器 */
  function mountWidgets() {
    const el = document.createElement('div');
    el.id = 'orca-widgets';
    document.body.append(el);
    state.widgets = el;
    const mark = document.createElement('div');
    mark.className = 'orca-wordmark';
    mark.textContent = 'ORCA LINK';
    el.append(mark);
    const row = document.createElement('div');
    row.className = 'orca-row';
    el.append(row);
    if (state.settings.character) {
      mountCharacter(row);
      mountChip(row);
    }
    chrome.storage.local.get({ pos: null }, ({ pos }) => {
      if (!pos || !pos.left) return;
      el.style.left = pos.left;
      el.style.top = pos.top;
      el.style.bottom = 'auto';
    });
    attachDrag(el);
  }

  function savePosition(left, top) {
    chrome.storage.local.set({ pos: { left, top } });
  }

  function attachDrag(el) {
    let start = null;
    const onDown = (event) => {
      if (event.button !== 0) return;
      const rect = el.getBoundingClientRect();
      start = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
      el.setAttribute('data-dragging', '');
      window.addEventListener('pointermove', onMove, true);
      window.addEventListener('pointerup', onUp, true);
    };
    const onMove = (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) < 4) return;
      start.moved = true;
      const left = Math.max(4, Math.min(window.innerWidth - 60, start.left + dx));
      const top = Math.max(4, Math.min(window.innerHeight - 60, start.top + dy));
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      el.style.bottom = 'auto';
      event.preventDefault();
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      el.removeAttribute('data-dragging');
      if (start && start.moved) {
        const rect = el.getBoundingClientRect();
        savePosition(rect.left + 'px', rect.top + 'px');
      }
      start = null;
    };
    el.addEventListener('pointerdown', onDown);
  }

  /* ----------------------------------------------------------- 装配/拆卸 */
  function applySettings(settings) {
    state.settings = { ...DEFAULTS, ...settings };
    document.documentElement.toggleAttribute('data-orca-square', state.settings.square !== false);
    if (!state.settings.scene && state.scene) {
      state.scene.remove();
      state.scene = null;
    } else if (state.settings.scene && !state.scene && document.body) {
      mountScene();
      syncSceneTheme();
    }
    if (state.character) state.character.style.display = state.settings.character ? '' : 'none';
    if (state.settings.reveal) clearAncestors();
    else restoreCleared();
  }

  function start() {
    document.documentElement.setAttribute(MARK, '');
    const detected = detectDark();
    state.dark = detected === null ? matchMedia('(prefers-color-scheme: dark)').matches : detected;
    state.sceneMode = resolveSceneMode();
    mountScene();
    syncSceneTheme();
    mountWidgets();
    installFavicon();
    applySettings(state.settings);
    clearAncestors();
    observe();
  }

  function stop() {
    if (state.frameTimer) clearTimeout(state.frameTimer);
    if (state.observerTimer) clearTimeout(state.observerTimer);
    if (state.statusResetTimer) clearTimeout(state.statusResetTimer);
    if (state.contentMo) state.contentMo.disconnect();
    if (state.themeMo) state.themeMo.disconnect();
    if (state.scene) state.scene.remove();
    if (state.widgets) state.widgets.remove();
    restoreFavicon();
    restoreCleared();
    document.documentElement.removeAttribute(MARK);
    document.documentElement.removeAttribute('data-orca-square');
    document.documentElement.removeAttribute('data-orca-dark');
    state.anchors = new WeakSet();
    Object.assign(state, {
      scene: null, widgets: null, character: null, sprite: null,
      chipLabel: null, contentMo: null, themeMo: null, observerTimer: 0,
    });
  }

  /* ------------------------------------------------------------- 观察器 */
  function observe() {
    // 内容变化（站点重渲染 / 流式输出）：只跑一遍幂等的重挂
    state.contentMo = new MutationObserver(() => {
      if (state.observerTimer) return;
      state.observerTimer = window.setTimeout(() => {
        state.observerTimer = 0;
        if (location.href !== state.href) {
          state.href = location.href;
          applySceneMode();
        }
        applySceneMode();
        clearAncestors();
        if (!state.statusResetTimer) {
          const derived = deriveStatus();
          if (derived !== state.status) setStatus(derived);
        }
      }, 500);
    });
    state.contentMo.observe(document.documentElement, { childList: true, subtree: true });

    // 主题变化：只看 html / body 的属性，避免被自己的内联样式触发
    state.themeMo = new MutationObserver(() => {
      applyTheme();
      syncSceneTheme();
    });
    const filter = { attributes: true, attributeFilter: ['class', 'data-theme', 'data-color-mode', 'data-ds-dark-theme'] };
    state.themeMo.observe(document.documentElement, filter);
    if (document.body) state.themeMo.observe(document.body, filter);
  }

  /* --------------------------------------------------------------- 启动 */
  chrome.storage.sync.get(DEFAULTS, (settings) => {
    state.settings = { ...DEFAULTS, ...settings };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    const next = { ...state.settings };
    for (const [key, { newValue }] of Object.entries(changes)) next[key] = newValue;
    applySettings(next);
  });
})();
