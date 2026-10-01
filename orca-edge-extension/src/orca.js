/* ==========================================================================
   ORCA LINK · DeepSeek 官网版（Edge 扩展）内容脚本
   行为与参数移植自 @smalltailqwq/dsh-client-ui-skin-orca-link（MIT 代码 /
   美术 CC BY-NC-SA 4.0，禁止商用）。官网没有 DSH 的插件接口，这里用
   DOM 无关的启发式手段达成同样的视觉效果。
   ========================================================================== */
(() => {
  'use strict';

  const MARK = 'data-orca-link';
  const DEFAULTS = { scene: true, character: true, reveal: false, skin: 'orca', collapsed: false };
  // 图集的绝对扩展 URL：按钮背景用 inline 样式写，避免相对路径与优先级问题
  const ATLAS_URL = chrome.runtime.getURL('assets/status-atlas.webp');

  /* 两套皮肤的资源与文案（对应 deep-whale 仓库的两个独立皮肤包） */
  const SKINS = {
    orca: {
      label: 'ORCA LINK',
      sub: '虎鲸链路',
      swatch: 'linear-gradient(135deg, #4b483f 0 55%, #20c7e8 55% 100%)',
      scenes: {
        'light-hero': 'scene-light-hero.webp',
        'light-active': 'scene-light-active.webp',
        'dark-hero': 'scene-dark-hero.webp',
        'dark-active': 'scene-dark-active.webp',
      },
      maids: null,
    },
    maid: {
      label: 'MAID ATELIER',
      sub: '深海女仆工坊',
      swatch: 'linear-gradient(135deg, #10204d 0 55%, #c5a468 55% 100%)',
      scenes: {
        'light-hero': 'maid/maid-atelier-palace-light.webp',
        'light-active': 'maid/maid-atelier-palace-light.webp',
        'dark-hero': 'maid/maid-atelier-palace-dark.webp',
        'dark-active': 'maid/maid-atelier-palace-dark.webp',
      },
      maids: {
        left: 'maid/maid-atelier-maid-left.webp',
        right: 'maid/maid-atelier-maid-right.webp',
      },
    },
  };

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
    maids: null,
    decor: null,
    charRow: null,
    wordmark: null,
    skinSwitch: null,
    collapseBtn: null,
    statusStarted: false,
    newChatBtn: null,
    newChatSvg: null,
    newChatSvgDisplay: '',
    newChatPad: '',
    newChatPadPrio: '',
    skinHint: null,
    hintTimer: 0,
    status: 'ready',
    frame: 0,
    frameTimer: 0,
    statusResetTimer: 0,
    generating: false,
    generatingAt: 0,
    workingSince: 0,
    artTimer: 0,
    ncCol: 0,
    ncRow: 0,
    ncAlign: [0, 0],
    ncStageDark: null,
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
    const dark = state.dark;
    document.documentElement.toggleAttribute('data-orca-dark', dark);
    // 主题位同时镜像到角色层：角色自己的暗色滤镜（drop-shadow）与状态气泡
    // 都挂在 [data-orca-dark] 上，只指望根元素那一次属性变更被观察到的话，
    // 站点换主题时角色这一块会停在旧的一档。角色层自带一份主题位即可自洽。
    if (state.charRow) state.charRow.toggleAttribute('data-orca-dark', dark);
    if (state.character) state.character.toggleAttribute('data-orca-dark', dark);
    // 「开启新对话」台座的面色走 CSS 令牌，理论上自动跟随；但站点可能在我们
    // 判定出主题之前就把按钮塞进了 DOM（启动竞态），这里顺手重刷一次台座，
    // 保证浅色模式下不会留一块暗面。
    if (state.newChatBtn && state.newChatBtn.isConnected) applyNewChatStage(state.newChatBtn);
    if (state.scene) state.scene.dataset.theme = dark ? 'dark' : 'light';
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
    // 状态位始终写到根元素（底饰带等装饰件靠它判断），下面的提前返回只用来省重挂成本
    document.documentElement.setAttribute('data-orca-scene', mode);
    if (mode === state.sceneMode && state.scene && state.scene.dataset.scene === mode) return;
    state.sceneMode = mode;
    if (state.scene) state.scene.dataset.scene = mode;
  }

  function mountScene() {
    const scene = document.createElement('div');
    scene.id = 'orca-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.dataset.theme = state.dark ? 'dark' : 'light';
    scene.dataset.scene = state.sceneMode;
    const layers = [];
    for (const theme of ['light', 'dark']) {
      for (const role of ['hero', 'active']) layers.push([theme, role, sceneFileFor(theme, role)]);
    }
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

  /** 场景图按当前皮肤取；女仆套的宫殿没有空态/工作态之分，同一张图两用。 */
  function sceneFileFor(theme, role) {
    const set = (SKINS[state.settings.skin] || SKINS.orca).scenes;
    return set[theme + '-' + role] || set[theme + '-hero'];
  }

  function refreshSceneImages() {
    if (!state.scene) return;
    for (const layer of state.scene.children) {
      layer.style.backgroundImage = `url("${asset(sceneFileFor(layer.dataset.theme, layer.dataset.role))}")`;
    }
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
  const REDUCED_MOTION = (() => {
    try {
      return window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    } catch (error) {
      return null;
    }
  })();

  /** 逐帧循环的开关：后台标签页与「减少动态效果」都不该继续烧帧 */
  function framesAllowed() {
    if (document.hidden) return false;
    return !(REDUCED_MOTION && REDUCED_MOTION.matches === true);
  }

  function sequenceFor(status) {
    return FRAME_SEQUENCES[status] || [0, 1, 2, 3, 4, 5, 6, 7];
  }

  function renderFrame() {
    const status = state.status;
    const seq = sequenceFor(status);
    const row = STATUS_ROWS[status] ?? 0;
    const frame = seq[state.frame % seq.length];
    // 「开启新对话」按钮上的角色共用同一姿势：工作态是打字，空闲回到待机。
    // 放在 sprite 判空之前，这样即使 popup 里关掉了状态角色，按钮仍会随状态变化。
    state.ncCol = frame;
    state.ncRow = row;
    state.ncAlign = (STATUS_FRAME_ALIGNMENT[status] || [])[state.frame % seq.length] || [0, 0];
    paintNewChatArt();
    if (!state.sprite) return;
    // 与按钮上的角色共用同一套质心补偿（同一尺寸 → 同一 k）
    const scale = charSize() / ATLAS_CELL;
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

  /** 只重启逐帧循环，不碰状态本身。状态没变时不该走这里。 */
  function startFrameLoop() {
    if (state.frameTimer) clearTimeout(state.frameTimer);
    state.frameTimer = 0;
    if (!framesAllowed()) return;
    state.frameTimer = window.setTimeout(tickFrame, STATUS_FRAME_INTERVAL);
  }

  function setStatus(status, holdMs) {
    if (!STATUS_LABELS[status]) return;
    // 站点侧状态位每次都要回写（初次挂载时 state.status 已经是 ready，
    // 走下面那条「状态没变」的短路也不会漏掉属性）
    if (state.character) state.character.dataset.status = status;
    if (state.widgets) state.widgets.dataset.status = status;
    // 幂等：状态没变就只做一次「渲染 + 续上循环」，绝不重置 frame。
    // 旧写法每次都被 MutationObserver（流式输出期间每 500ms 一次）调到，
    // 于是 frame 反复归零、两套动画（左下角色 + 「开启新对话」按钮）在
    // working/input 之间来回跳 —— 就是「一直乱动」的观感来源。
    if (state.status !== status) {
      state.status = status;
      state.frame = 0;
      state.workingSince = status === 'working' ? Date.now() : 0;
      renderFrame();
      startFrameLoop();
    } else {
      renderFrame();
      if (!state.frameTimer) startFrameLoop();
    }
    // 定时回落要独立于「状态是否变化」：开机调的是 setStatus('ready', 1800)，
    // 而 state.status 的初值本来就是 ready —— 挂在变化分支里的话这个
    // 定时器永远不会建立，状态就再也不会被站点推导更新。
    if (holdMs) {
      if (state.statusResetTimer) clearTimeout(state.statusResetTimer);
      state.statusResetTimer = window.setTimeout(() => {
        state.statusResetTimer = 0;
        refreshStatus();
      }, holdMs);
    }
  }

  /* ------------------------------------------------ 站点状态 → 皮肤状态 */
  /** 真正「看得见」：不仅要 rect 有尺寸，还要祖先链上没有 display:none /
   *  visibility:hidden / opacity:0，并且确实落在视口内。
   *  站点把发送/停止做成同一个按钮组件（jsx(ve,{...mode,onStop})），
   *  停止模式往往只是把按钮淡出/移出视口——那种元素仍然有 rect，
   *  只看 rect 就会永远判成「正在生成」，角色就永远停在 TASK RUNNING。 */
  function isVisible(el) {
    if (el.closest('[aria-hidden="true"]')) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return false;
    if (rect.bottom < 0 || rect.right < 0) return false;
    if (rect.top > (window.innerHeight || Infinity) || rect.left > (window.innerWidth || Infinity)) return false;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (!style) break;
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
      if (parseFloat(style.opacity) === 0) return false;
    }
    return true;
  }

  function hasStopControl() {
    for (const el of document.querySelectorAll('button, [role="button"]')) {
      const label = ((el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')).trim();
      if (!label || !/停止|Stop/i.test(label)) continue;
      if (isVisible(el)) return true;
    }
    return false;
  }

  function hasStreamingMarker() {
    for (const el of document.querySelectorAll('[class*="streaming" i]')) {
      if (isVisible(el)) return true;
    }
    return false;
  }

  function isGenerating() {
    return hasStopControl() || hasStreamingMarker();
  }

  /** 去抖 500ms + 这段迟滞之后才算「生成结束」——流式渲染过程中按钮会被
   *  反复重挂，没有这个迟滞，状态就会 working⇄standby 来回抖。 */
  const WORKING_EXIT_GRACE_MS = 1200;
  /** 安全阀：一直没有任何生成迹象却卡在 working 太久时强制回落。
   *  宁可早一点回到待机，也不能永远「工作中」。 */
  const WORKING_MAX_MS = 12000;

  function refreshStatus() {
    const generating = isGenerating();
    const now = Date.now();
    if (generating) {
      state.generating = true;
      state.generatingAt = now;
      // 安全阀的锚点跟着刷新：只要还看得见生成迹象，就永远不该被阀掉
      if (state.status !== 'working') state.workingSince = now;
      setStatus('working');
      return;
    }
    state.workingSince = state.status === 'working' ? state.workingSince || now : 0;
    // 安全阀：卡在 working 超过上限就强制回落。进入 working 的时刻记在
    // state.workingSince，所以哪怕一次都没看见过停止按钮（误判进来的），
    // 也一定会在上限内爬出来 —— 这是「永远工作中」的最终兜底。
    if (state.status === 'working' && now - state.workingSince >= WORKING_MAX_MS) {
      state.generating = false;
      state.workingSince = 0;
    } else if (state.generating) {
      // 已经不在生成了，但仍要过迟滞闸门，避免每 500ms 的观察器把状态抖回去。
      if (state.status === 'working' && now - state.generatingAt < WORKING_EXIT_GRACE_MS) return;
      state.generating = false;
    }
    // 优先级写死：故障 > 生成中 > 有输入 > 待机（站点把发送/停止做成同一个
    // 按钮组件，所以「看得见停止按钮」就是生成中的唯一可靠信号）
    if (hasFault()) setStatus('fault');
    else if (hasInputText()) setStatus('input');
    else setStatus('standby');
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
    // 角色是**固定在左上角**的独立浮层（对应 DSH 侧栏舞台的「左上角小人」：
    // top:58px / left:22px），不再挂在左下角的面板组里 ——
    // 挂进去的话它的背板会排到皮肤面板下面，看着像多了一块面板。
    row.append(el);
    state.character = el;
    state.sprite = sprite;
    syncCharSize();
    attachDrag(el);
  }

  /* ------------------------------------------------------- 双女仆立绘层 */
  function mountMaids() {
    const skin = SKINS[state.settings.skin] || SKINS.orca;
    if (!skin.maids) return;
    const layer = document.createElement('div');
    layer.id = 'orca-maids';
    layer.setAttribute('aria-hidden', 'true');
    for (const side of ['left', 'right']) {
      const maid = document.createElement('div');
      maid.className = 'orca-maid';
      maid.dataset.side = side;
      maid.style.backgroundImage = `url("${asset(skin.maids[side])}")`;
      layer.append(maid);
    }
    document.body.append(layer);
    state.maids = layer;
  }

  /** 女仆套装饰件：顶饰带（含蝴蝶结）、底饰带（含纹章）、侧栏四角金框 */
  function mountDecor() {
    if (state.decor) return;
    const top = document.createElement('div');
    top.className = 'orca-trim';
    top.dataset.part = 'top';
    top.setAttribute('aria-hidden', 'true');
    const bottom = document.createElement('div');
    bottom.className = 'orca-trim';
    bottom.dataset.part = 'bottom';
    bottom.setAttribute('aria-hidden', 'true');
    document.body.append(top, bottom);
    state.decor = { top, bottom };
  }

  function removeDecor() {
    if (!state.decor) return;
    for (const el of Object.values(state.decor)) el.remove();
    state.decor = null;
  }

  /** 消息列半宽：优先读站点自己的 --message-list-max-width，读不到就用 840/2 */
  function syncColumnHalf() {
    if (!state.maids) return;
    let half = 420;
    const raw = getComputedStyle(document.body).getPropertyValue('--message-list-max-width').trim();
    const num = parseFloat(raw);
    if (Number.isFinite(num) && num > 320) half = num / 2;
    document.documentElement.style.setProperty('--orca-column-half', half + 'px');
  }

  /* ------------------------------------------------- 站点「开启新对话」按钮 */
  /** 用文本匹配 + 位置约束找到站点左侧栏的「开启新对话」按钮，不依赖会变的哈希类名。 */
  const NEW_CHAT_LABELS = /开启新对话|新对话|New chat/i;
  function findNewChatButton() {
    const candidates = document.querySelectorAll('button, a[role="button"], [role="button"], ._5a8ac7a');
    for (const el of candidates) {
      const text = (el.textContent || '').trim();
      if (!text || text.length > 24 || !NEW_CHAT_LABELS.test(text)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 24) continue;
      if (rect.left > window.innerWidth * 0.4 || rect.left < 0) continue;
      if (rect.top < 0 || rect.top > window.innerHeight) continue;
      return el;
    }
    return null;
  }

  /* 角色尺寸照搬原皮肤侧栏舞台：
     --orca-stage: clamp(240px, 34vh, 320px)；角色高 = 舞台高 - 66px（≈234px，不是小图标）。
     原皮肤把角色放在侧栏舞台里、并让按钮内容让位；这里把按钮改成竖排舞台：
     角色在上、「开启新对话」文字在下，点击行为不变。 */
  const NC_STAGE_MIN = 240;
  const NC_STAGE_MAX = 320;
  const NC_STAGE_GAP = 66;

  /** 唯一的角色尺寸来源：舞台高 − 66px，并受窗口宽高约束。
   *  浮空角色与「开启新对话」上的角色都读它，所以两者**必然一样大**
   *  （此前浮空角色写死 118px、按钮角色按舞台算 ≈234px，差了一倍）。 */
  function stageSize() {
    const vh = window.innerHeight || 800;
    const vw = window.innerWidth || 1400;
    const stage = Math.max(NC_STAGE_MIN, Math.min(NC_STAGE_MAX, Math.round(vh * 0.34)));
    // 窄窗口下别把角色撑出侧栏：留出两侧余量再取较小值
    return Math.round(Math.max(120, Math.min(stage - NC_STAGE_GAP, Math.floor(vw * 0.42))));
  }
  const charSize = stageSize;

  /** 把尺寸同步给浮空角色：原先它写死 118px，比 DSH 那边小一半。 */
  function syncCharSize() {
    if (!state.character) return;
    state.character.style.setProperty('--orca-char-size', charSize() + 'px');
  }

  /** 角色画在「我自己的元素」上（塞进按钮内部）。
   *  历史教训：画在站点按钮自身的背景/伪元素上会被它的样式表干扰
   *  （0.3.0 被伪元素顶掉；0.3.3 的 background-repeat 被回落成 repeat，平铺出 5 个）。
   *  自建元素 + inline 样式没有任何竞争者可干扰。姿势按像素从图集切片。 */
  function paintNewChatArt() {
    const btn = state.newChatBtn;
    const art = state.newChatArt;
    if (!btn || !art) return;
    // 台座面只在**主题变了**（或第一次画）时重铺一次 —— 扫描光带跟着那次重铺扫一遍。
    // 站点重渲染换掉按钮节点时，新节点会走同步分支里的 applyNewChatStage，
    // 样式不会丢；这里不再无条件重铺，否则每 2s 的常规重绘会让光带一直扫（噪音）。
    if (state.ncStageDark !== document.documentElement.hasAttribute('data-orca-dark')) {
      applyNewChatStage(btn);
    }
    // 与浮空角色共用同一个尺寸（见 syncCharSize），两个角色大小必然一致
    const size = charSize();
    const col = state.ncCol || 0;
    const row = state.ncRow || 0;
    // 逐帧质心补偿：原作靠 STATUS_FRAME_ALIGNMENT 把每帧角色拉回同一视觉中心，
    // 不加这一层，逐帧动画在大尺寸下会明显「乱抖」。
    const align = state.ncAlign || [0, 0];
    const k = size / ATLAS_CELL;
    art.style.width = size + 'px';
    art.style.height = size + 'px';
    art.style.backgroundSize = (8 * size) + 'px ' + (10 * size) + 'px';
    // 与浮空角色保持同一个坐标系：background-position 只负责「选帧」，
    // 逐帧质心补偿单独走第二段 transform。此前补偿被折进 background-position，
    // 只有一段位移，而浮空角色是两段（background-position + transform），
    // 于是同一帧下两个角色差 align * size/236 像素 —— 就是两个状态位置不统一。
    art.style.backgroundPosition = (-col * size) + 'px ' + (-row * size) + 'px';
    art.style.transform =
      'translate(' + (align[0] * k).toFixed(2) + 'px, ' + (align[1] * k).toFixed(2) + 'px)';
    btn.style.setProperty('min-height', (size + 60) + 'px', 'important');
  }

  // 需要改动并原样还原的按钮样式
  const NC_PROPS = ['flex-direction', 'justify-content', 'gap', 'padding', 'height', 'min-height', 'overflow'];
  function saveNewChatStyles(btn) {
    state.newChatSaved = NC_PROPS.map((prop) => [prop, btn.style.getPropertyValue(prop), btn.style.getPropertyPriority(prop)]);
  }
  function restoreNewChatStyles() {
    const btn = state.newChatBtn;
    if (!btn || !state.newChatSaved) return;
    for (const [prop, value, prio] of state.newChatSaved) {
      if (value) btn.style.setProperty(prop, value, prio);
      else btn.style.removeProperty(prop);
    }
    state.newChatSaved = null;
  }

  function restoreNewChatButton() {
    restoreNewChatStyles();
    if (state.newChatArt) {
      state.newChatArt.remove();
      state.newChatArt = null;
    }
    if (state.newChatSvg) {
      if (state.newChatSvgDisplay) state.newChatSvg.style.setProperty('display', state.newChatSvgDisplay);
      else state.newChatSvg.style.removeProperty('display');
    }
    state.newChatBtn = null;
    state.newChatSvg = null;
  }

  /** 挂接/解挂「开启新对话」按钮上的角色（仅虎鲸套） */
  function syncNewChatArt() {
    const isMaid = !!(SKINS[state.settings.skin] || SKINS.orca).maids;
    const btn = isMaid ? null : findNewChatButton();
    if (!btn) {
      restoreNewChatButton();
      return;
    }
    if (state.newChatBtn !== btn) {
      restoreNewChatButton();
      state.newChatBtn = btn;
      state.newChatSvg = btn.querySelector('svg');
      state.newChatSvgDisplay = state.newChatSvg ? state.newChatSvg.style.display : '';
      saveNewChatStyles(btn);
      if (state.newChatSvg) state.newChatSvg.style.setProperty('display', 'none', 'important');
      // 按钮改成竖排舞台：角色在上，文字在下
      applyNewChatStage(btn);
      const art = document.createElement('span');
      art.id = 'orca-newchat-art';
      art.setAttribute('aria-hidden', 'true');
      art.style.cssText = [
        'display:inline-block',
        'flex:0 0 auto',
        'background-image:url("' + ATLAS_URL + '")',
        'background-repeat:no-repeat',
        'background-position:0 0',
        'pointer-events:none',
      ].join(';');
      btn.prepend(art);
      state.newChatArt = art;
      // 首次挂载时铺一次台座面（并扫一遍光带）
      state.ncStageDark = null;
    }
    // 台座面由 paintNewChatArt 按「主题是否变化」决定重铺，不在这里无条件重刷
    paintNewChatArt();
  }

  /* 站点「开启新对话」按钮的台座：照 DSH 原作做成「方角舞台 + 青蓝方括号角标」，
     台座面**照搬原皮肤侧栏舞台的光效**：原包 `[data-slot=sidebar]>:first-child`
     是「半透明暖白底 + 顶部柔光 + 舞台下沿接缝 + 横向细纹」，再由 `::before` 上
     一条亮带扫过去（keyframes orcaSeamSweep）。
     网页版按钮的 ::before/::after 被站点占着，所以等价物是：
       · 底色 → inline background-color 引用 --orca-nc-stage-face
       · 柔光/接缝/细纹 → inline background-image 引用 --orca-nc-stage-layers
       · 扫描带 → 自建一枚 #orca-nc-sweep（绝对定位的窄光带，靠 transform 过渡扫过）
     令牌都由 orca.css 按亮/暗各给一套（亮白纸面 + 冷白扫光 / 暗墨蓝 + 青蓝扫光）。 */
  const NC_STAGE_PROPS = [
    // 舞台造型
    ['flex-direction', 'column'],
    ['justify-content', 'center'],
    ['gap', '6px'],
    ['padding', '14px 12px'],
    ['height', 'auto'],
    // 扫描带要扫到台座外沿，角标也要溢到边框外
    ['overflow', 'visible'],
    // 直角契约 + 自成一块的面（角色是灰调像素画，抬到同主题的底上才立得住）
    ['border-radius', '0'],
    ['border', '1px solid var(--orca-nc-stage-face-border, var(--orca-line))'],
    ['box-shadow', 'var(--orca-nc-stage-face-shadow, var(--orca-shadow))'],
    ['background-repeat', 'no-repeat, no-repeat, no-repeat'],
    ['background-size', '100% 100%, 100% 100%, 100% 9px'],
    ['background-position', '0 0, 0 0, 0 calc(100% - 4px)'],
  ];
  const NC_STAGE_FACE = 'var(--orca-nc-stage-face)';
  const NC_STAGE_LAYERS = 'var(--orca-nc-stage-layers)';

  /** 给台座铺面（底色 + 柔光/接缝/细纹）并把扫描带扫一遍。
   *  reduceMotion（系统「减少动态效果」）时只铺面，不留扫描带。 */
  function paintStage(btn, reduceMotion) {
    btn.style.setProperty('background-color', NC_STAGE_FACE, 'important');
    btn.style.setProperty('background-image', NC_STAGE_LAYERS, 'important');

    let sweep = btn.querySelector('#orca-nc-sweep');
    if (reduceMotion) {
      if (sweep) sweep.remove();
      return;
    }
    if (!sweep) {
      sweep = document.createElement('span');
      // 同时给 id 与 class：两种查询方式都能找回来（真实 DOM 里 id 属性由 .id 反射）
      sweep.id = 'orca-nc-sweep';
      sweep.className = 'orca-nc-sweep';
      sweep.setAttribute('aria-hidden', 'true');
      // 放在最前面，别影响角色与文字的排布（它是绝对定位的）
      btn.prepend(sweep);
    }
    // 按台座宽度算光带宽度与起止位移（原包是从 -10% 扫到 110%）：
    // 起止都用 calc，两端同型才能插值出连续扫动
    const w = Math.max(56, Math.round((btn.clientWidth || 240) * 0.42));
    sweep.style.setProperty('--orca-nc-sweep-w', w + 'px');
    sweep.style.setProperty('--orca-nc-sweep-x', 'calc(-1 * ' + (w + 24) + 'px)');
    // 用 window.requestAnimationFrame（而不是裸名）：内容脚本里两种写法等价，
    // 但显式走 window 方便测试桩注入
    window.requestAnimationFrame(() => {
      if (!sweep.isConnected) return;
      // 位移一变，CSS 过渡就把它扫到另一侧
      sweep.style.setProperty('--orca-nc-sweep-x', 'calc(100% + ' + (w + 24) + 'px)');
    });
  }

  function applyNewChatStage(btn) {
    for (const [prop, value] of NC_STAGE_PROPS) btn.style.setProperty(prop, value, 'important');
    paintStage(btn, !!(REDUCED_MOTION && REDUCED_MOTION.matches === true));
    state.ncStageDark = document.documentElement.hasAttribute('data-orca-dark');
    // 角标/扫描带要相对按钮定位
    btn.style.setProperty('position', 'relative');
    mountNewChatBrackets(btn);
  }

  /* 方括号角标：DSH 原作在台座左上/右下各画一枚青蓝「L」。
     按钮的 ::before/::after 已被站点占用，所以用两条自建元素；
     站点重渲染换掉按钮节点时，这两个也会随新节点重建。 */
  function mountNewChatBrackets(btn) {
    if (btn.querySelector('[data-orca-nc-bracket]')) return;
    for (const corner of ['tl', 'br']) {
      const mark = document.createElement('span');
      mark.setAttribute('data-orca-nc-bracket', corner);
      mark.setAttribute('aria-hidden', 'true');
      mark.style.cssText = [
        'position:absolute',
        'width:9px',
        'height:9px',
        'pointer-events:none',
        'border:0 solid var(--orca-cyan)',
        // 扫描带要扫到台座外沿，所以像上一版那样让角标外溢一枚描边
        corner === 'tl'
          ? 'top:-1px;left:-1px;border-top-width:1px;border-left-width:1px'
          : 'bottom:-1px;right:-1px;border-bottom-width:1px;border-right-width:1px',
      ].join(';');
      btn.append(mark);
    }
  }

  /* --------------------------------------------------------- 皮肤切换 */
  /** 左下角部件里的皮肤切换面板（与 popup 共用同一份设置，两边自动同步） */
  function mountSkinSwitch() {
    const box = document.createElement('div');
    box.id = 'orca-skin-switch';

    const title = document.createElement('div');
    title.className = 'orca-skin-title';
    title.innerHTML = '<span>皮肤 · SKIN</span><span class="orca-skin-title-hint">点此切换</span>';

    // 收起 / 展开：收起后面板只剩这一枚胶囊，状态记在设置里
    const collapse = document.createElement('button');
    collapse.type = 'button';
    collapse.className = 'orca-skin-collapse';
    collapse.addEventListener('click', (event) => {
      event.stopPropagation();
      const next = !(state.settings.collapsed === true);
      state.settings.collapsed = next;
      chrome.storage.sync.set({ collapsed: next });
      paintCollapsed();
    });
    state.collapseBtn = collapse;

    box.append(collapse, title);

    for (const key of Object.keys(SKINS)) {
      const skin = SKINS[key];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'orca-skin-btn';
      button.dataset.skin = key;
      button.title = `${skin.label} · ${skin.sub}`;

      const swatch = document.createElement('span');
      swatch.className = 'orca-skin-swatch';
      swatch.style.background = skin.swatch;

      const text = document.createElement('span');
      text.className = 'orca-skin-text';
      const name = document.createElement('span');
      name.className = 'orca-skin-name';
      name.textContent = skin.label;
      const sub = document.createElement('span');
      sub.className = 'orca-skin-sub';
      sub.textContent = skin.sub;
      text.append(name, sub);

      const tick = document.createElement('span');
      tick.className = 'orca-skin-tick';
      tick.textContent = '✓';

      button.append(swatch, text, tick);
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        state.settings.skin = key;
        chrome.storage.sync.set({ skin: key });
        applySkin(key);
        dismissSkinHint();
      });
      box.append(button);
    }

    // 首次使用的一次性引导气泡，点掉或 12 秒后自动消失
    const hint = document.createElement('div');
    hint.className = 'orca-skin-hint';
    hint.textContent = '↑ 从这里换皮肤 / 背景';
    box.append(hint);
    chrome.storage.local.get({ skinHintSeen: false }, ({ skinHintSeen }) => {
      if (skinHintSeen) {
        hint.remove();
        return;
      }
      state.hintTimer = window.setTimeout(dismissSkinHint, 12000);
    });
    state.skinHint = hint;
    return box;
  }

  function dismissSkinHint() {
    if (state.hintTimer) clearTimeout(state.hintTimer);
    state.hintTimer = 0;
    if (state.skinHint) {
      state.skinHint.remove();
      state.skinHint = null;
    }
    chrome.storage.local.set({ skinHintSeen: true });
  }

  function paintSkinSwitch() {
    if (!state.skinSwitch) return;
    for (const button of state.skinSwitch.children) {
      if (!button.dataset || !button.dataset.skin) continue;
      button.toggleAttribute('data-active', button.dataset.skin === state.settings.skin);
    }
    paintCollapsed();
  }

  /** 收起态：藏起标题与两个选项，只留一枚「▸ 皮肤」胶囊可再展开 */
  function paintCollapsed() {
    if (!state.skinSwitch) return;
    const collapsed = state.settings.collapsed === true;
    state.skinSwitch.toggleAttribute('data-collapsed', collapsed);
    if (state.collapseBtn) {
      state.collapseBtn.textContent = collapsed ? '▸ 皮肤' : '– 收起';
      state.collapseBtn.title = collapsed ? '展开皮肤面板' : '收起皮肤面板';
    }
  }

  function applySkin(skin) {
    const key = SKINS[skin] ? skin : 'orca';
    state.settings.skin = key;
    document.documentElement.setAttribute('data-orca-skin', key);
    refreshSceneImages();
    if (state.wordmark) state.wordmark.textContent = SKINS[key].label;
    paintSkinSwitch();
    if (SKINS[key].maids) {
      if (!state.maids) mountMaids();
      syncColumnHalf();
    } else if (state.maids) {
      state.maids.remove();
      state.maids = null;
    }
    // 侧栏框两套皮肤都用：虎鲸＝直角方括号 + 竖排字标 + spine；女仆＝金线 + 角饰
    // 顶/底饰带只属于女仆，由 CSS 的 [data-orca-skin='maid'] 门控
    mountDecor();
    syncNewChatArt();
    // 状态循环独立于状态角色：popup 里关掉角色时，「开启新对话」按钮的姿势仍要跟着变
    if (!state.statusStarted) {
      state.statusStarted = true;
      setStatus('ready', 1800);
    }
    const wantCharacter = state.settings.character && !SKINS[key].maids;
    if (state.character) state.character.style.display = wantCharacter ? '' : 'none';
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
    // 角色（含它的背板）不再放进这个面板组：面板在左下角，角色在左上角，
    // 是两块独立的浮层。挂在一起的话角色的背板会排到皮肤面板下面。
    const el = document.createElement('div');
    el.id = 'orca-widgets';
    document.body.append(el);
    state.widgets = el;
    const mark = document.createElement('div');
    mark.className = 'orca-wordmark';
    mark.textContent = (SKINS[state.settings.skin] || SKINS.orca).label;
    el.append(mark);
    state.wordmark = mark;
    state.skinSwitch = mountSkinSwitch();
    el.append(state.skinSwitch);
    const row = document.createElement('div');
    row.className = 'orca-row';
    el.append(row);
    if (state.settings.character) {
      mountCharacter(row);
      // 角色层是独立浮层，挂在 body 上而不是面板里（`.orca-row` 自己 fixed 到左上角）
      document.body.append(row);
    }
    state.charRow = row;
    // 位置记忆按元素分别存：角色 / 面板各记一份，互不干扰。
    // 两个元素都是 position:fixed，但角色那边的 left/top 要写在 .orca-row 上
    // （角色自己在 row 里是普通流布局）。
    chrome.storage.local.get({ cornerPos: null }, ({ cornerPos }) => {
      if (cornerPos && cornerPos.left) {
        row.style.left = cornerPos.left;
        row.style.top = cornerPos.top;
      }
    });
    if (state.character) attachDrag(row);
    chrome.storage.local.get({ posPanel: null }, ({ posPanel }) => {
      if (posPanel && posPanel.left) {
        el.style.left = posPanel.left;
        el.style.top = posPanel.top;
        el.style.bottom = 'auto';
      }
    });
    attachDrag(el);
  }

  /** 拖拽落点按元素分开存：角色层 `.orca-row` 与面板 `#orca-widgets` 各一份。 */
  function savePosition(left, top, which) {
    if (which === 'char') chrome.storage.local.set({ cornerPos: { left, top } });
    else chrome.storage.local.set({ posPanel: { left, top } });
  }

  /** 可拖拽：位置以 inline left/top 覆盖默认锚点（角色默认左上角、面板默认左下角）。
   *  坐标用视口左上角为原点 —— 两个元素都是 position:fixed，坐标系一致。 */
  function attachDrag(el) {
    let start = null;
    const onDown = (event) => {
      if (event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest('button, a')) return;
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
      el.style.setProperty('--orca-pos-override', '1');
      event.preventDefault();
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      el.removeAttribute('data-dragging');
      if (start && start.moved) {
        const rect = el.getBoundingClientRect();
        savePosition(rect.left + 'px', rect.top + 'px', el.classList.contains('orca-row') ? 'char' : 'panel');
      }
      start = null;
    };
    el.addEventListener('pointerdown', onDown);
  }

  /* ----------------------------------------------------------- 装配/拆卸 */
  function applySettings(settings) {
    state.settings = { ...DEFAULTS, ...settings };
    if (!state.settings.scene && state.scene) {
      state.scene.remove();
      state.scene = null;
    } else if (state.settings.scene && !state.scene && document.body) {
      mountScene();
      syncSceneTheme();
    }
    if (state.character) state.character.style.display = state.settings.character ? '' : 'none';
    applySkin(state.settings.skin);
    if (state.settings.reveal) clearAncestors();
    else restoreCleared();
  }

  function start() {
    document.documentElement.setAttribute(MARK, '');
    const detected = detectDark();
    state.dark = detected === null ? matchMedia('(prefers-color-scheme: dark)').matches : detected;
    state.sceneMode = resolveSceneMode();
    // 先把主题位落到根元素（start 里以前只写 state.dark，属性要等站点下一次
    // 变更才补上；角色背板那类纯 CSS 的亮暗切换就会晚一拍甚至一直不动）。
    applyTheme();
    mountScene();
    syncSceneTheme();
    applySceneMode();
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
    if (state.maids) state.maids.remove();
    removeDecor();
    restoreNewChatButton();
    // 角色层挂在 body 上（不在 #orca-widgets 里），必须单独移除
    if (state.charRow) state.charRow.remove();
    if (state.widgets) state.widgets.remove();
    restoreFavicon();
    restoreCleared();
    document.documentElement.removeAttribute(MARK);
    document.documentElement.removeAttribute('data-orca-dark');
    state.anchors = new WeakSet();
    Object.assign(state, {
      scene: null, widgets: null, character: null, sprite: null,
      maids: null, decor: null, wordmark: null, skinSwitch: null, collapseBtn: null, statusStarted: false, newChatBtn: null, newChatSvg: null, skinHint: null, hintTimer: 0, contentMo: null, themeMo: null, observerTimer: 0, generating: false, generatingAt: 0, workingSince: 0, charRow: null, ncStageDark: null,
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
        syncNewChatArt();
        refreshStatus();
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

    // 站点重渲染可能换掉按钮节点：低频重同步（节点还在时只重画一次背景）
    state.artTimer = window.setInterval(() => {
      if (!state.newChatBtn || !state.newChatBtn.isConnected) syncNewChatArt();
      else paintNewChatArt();
    }, 2000);

    // 后台标签页不必逐帧重绘：隐藏时停表，回来立刻对一次状态再续上
    document.addEventListener('visibilitychange', () => {
      if (!framesAllowed()) {
        if (state.frameTimer) clearTimeout(state.frameTimer);
        state.frameTimer = 0;
        return;
      }
      refreshStatus();
      if (!state.frameTimer) startFrameLoop();
    });

    // 用户中途改「减少动态效果」时同样生效
    if (REDUCED_MOTION && REDUCED_MOTION.addEventListener) {
      REDUCED_MOTION.addEventListener('change', () => {
        if (framesAllowed()) startFrameLoop();
        else if (state.frameTimer) {
          clearTimeout(state.frameTimer);
          state.frameTimer = 0;
        }
      });
    }

    // 窗口尺寸变化 → 角色尺寸跟着舞台公式重算（两个角色一起）
    window.addEventListener('resize', () => {
      syncCharSize();
      paintNewChatArt();
    });
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
