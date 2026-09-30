const KEYS = ['scene', 'character', 'square', 'reveal'];
const DEFAULTS = { scene: true, character: true, square: true, reveal: false };

const boxes = {};
for (const key of KEYS) boxes[key] = document.getElementById(key);

chrome.storage.sync.get(DEFAULTS, (values) => {
  for (const key of KEYS) boxes[key].checked = values[key] !== false;
});

for (const key of KEYS) {
  boxes[key].addEventListener('change', () => {
    chrome.storage.sync.set({ [key]: boxes[key].checked });
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
