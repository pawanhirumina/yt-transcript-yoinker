document.getElementById('yoink').onclick = async () => {
  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  browser.tabs.executeScript(tabs[0].id, {
    code: `document.getElementById('yt-yoink-btn')?.click()`
  });
};
