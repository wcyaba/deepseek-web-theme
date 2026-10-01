const KEYS = ['scene', 'character', 'reveal'];
const DEFAULTS = { scene: true, character: true, reveal: false, skin: 'orca' };
const SKINS = ['orca', 'maid'];

const boxes = {};
for (const key of KEYS) boxes[key] = document.getElementById(key);
const skinButtons = [...document.querySelectorAll('.skin')];

let skin = DEFAULTS.skin;

function paintSkins() {
  for (const button of skinButtons) {
    button.toggleAttribute('data-active', button.dataset.skin === skin);
  }
}

chrome.storage.sync.get(DEFAULTS, (values) => {
  for (const key of KEYS) boxes[key].checked = values[key] !== false;
  skin = SKINS.includes(values.skin) ? values.skin : DEFAULTS.skin;
  paintSkins();
});

for (const key of KEYS) {
  boxes[key].addEventListener('change', () => {
    chrome.storage.sync.set({ [key]: boxes[key].checked });
  });
}

for (const button of skinButtons) {
  button.addEventListener('click', () => {
    skin = button.dataset.skin;
    paintSkins();
    chrome.storage.sync.set({ skin });
  });
}

document.getElementById('reset-pos').addEventListener('click', async () => {
  await chrome.storage.local.remove('pos');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null) await chrome.tabs.reload(tab.id);
});

document.getElementById('reload').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null) await chrome.tabs.reload(tab.id);
});
