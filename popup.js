document.getElementById('yoink').onclick = async () => {
  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  browser.tabs.executeScript(tabs[0].id, {
    code: `document.getElementById('yt-yoink-btn')?.click()`
  });
};


const cb = document.getElementById('timestamps');
browser.storage.local.get('includeTimestamps').then(r => cb.checked = r.includeTimestamps === true);
cb.onchange = () => browser.storage.local.set({ includeTimestamps: cb.checked });

console.log("Yoinker Loaded")
