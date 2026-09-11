const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function showToast(text, duration = 3000) {
  const existing = document.getElementById('yoinker-toast-container');
  if (existing) existing.remove();
  const container = document.createElement('div');
  container.id = 'yoinker-toast-container';
  const toast = document.createElement('div');
  toast.className = 'yoinker-toast';
  toast.textContent = text;
  container.appendChild(toast);
  document.body.appendChild(container);
  void toast.offsetWidth;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.remove(), 300);
  }, duration);
}

async function getIncludeTimestampsSetting() {
  const r = await browser.storage.local.get('includeTimestamps');
  return r.includeTimestamps === true;
}

async function openTranscript() {
  const expand = document.querySelector("#expand") || document.querySelector("button#expand");
  if (expand) {
    expand.click();
    await sleep(800);
  }
  const elements = [...document.querySelectorAll(".ytSpecTouchFeedbackShapeFill")];
  let transcriptInner = elements.find((el) => {
    const text = (el.innerText || el.textContent || "").trim().toLowerCase();
    return text.includes("show transcript");
  });
  if (!transcriptInner) {
    const buttons = [...document.querySelectorAll("button, [role='button']")];
    transcriptInner = buttons.find((el) => {
      const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim().toLowerCase();
      return text.includes("show transcript");
    });
  }
  if (!transcriptInner) throw new Error("Show transcript button not found");
  const transcriptButton = transcriptInner.closest("button, [role='button']") || transcriptInner;
  transcriptButton.scrollIntoView({ behavior: "smooth", block: "center" });
  await sleep(300);
  transcriptButton.click();
  await sleep(2000);
}

function getTranscriptText(includeTimestamps = false) {
  const modernSegments = [...document.querySelectorAll("transcript-segment-view-model")];
  if (modernSegments.length > 0) {
    const lines = [];
    for (const segment of modernSegments) {
      const timeEl = segment.querySelector("#timestamp,.segment-timestamp, [class*='timestamp']");
      let timestamp = timeEl?.innerText?.trim() || "";
      if (!timestamp) {
        const m = (segment.innerText || "").match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)/);
        if (m) timestamp = m[1];
      }
      let text = "";
      const textElement = segment.querySelector(".yt-core-attributed-string") || segment.querySelector("[role='text']") || segment.querySelector(".ytAttributedStringHost") || segment.querySelector(".segment-text");
      if (textElement) text = textElement.innerText || "";
      if (!text.trim()) text = segment.innerText || "";
      text = text.trim().replace(/\s+/g, " ");
      if (!text) continue;
      text = text.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/, "").trim();
      if (!text) continue;
      lines.push(includeTimestamps && timestamp? `${timestamp} ${text}` : text);
    }
    if (lines.length > 0) return lines.join("\n");
  }
  const legacySegments = [...document.querySelectorAll("ytd-transcript-segment-renderer")];
  if (legacySegments.length > 0) {
    const lines = legacySegments.map((segment) => {
      const timeEl = segment.querySelector("#timestamp,.segment-timestamp");
      const timestamp = timeEl?.innerText?.trim() || "";
      let text = segment.querySelector(".segment-text")?.innerText || segment.innerText || "";
      text = text.trim().replace(/\s+/g, " ");
      const m = text.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)/);
      if (m) return includeTimestamps? `${m[1]} ${m[2]}` : m[2];
      text = text.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/, "").trim();
      if (!text) return null;
      return includeTimestamps && timestamp? `${timestamp} ${text}` : text;
    }).filter(Boolean);
    if (lines.length > 0) return lines.join("\n");
  }
  return null;
}

async function waitForTranscript() {
  const withTime = await getIncludeTimestampsSetting();
  const timeout = 10000;
  const interval = 400;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const text = getTranscriptText(withTime);
    if (text) return text;
    await sleep(interval);
  }
  return null;
}

async function openAndCopy() {
  await openTranscript();
  const text = await waitForTranscript();
  if (!text) throw new Error("Transcript not found. This video may not have a transcript.");
  return text;
}

function addYoinkButton() {
  if (document.getElementById("yt-yoink-btn")) return;
  const subscribeButton = document.querySelector("#subscribe-button-shape");
  if (!subscribeButton) return;
  const parent = subscribeButton.parentElement;
  if (!parent) return;
  const btn = document.createElement("button");
  btn.id = "yt-yoink-btn";
  btn.type = "button";
  btn.textContent = "Yoink Transcript";
  btn.style.cssText = `
    background: #ff0000!important;
    color: #ffffff!important;
    border: none!important;
    border-radius: 18px!important;
    padding: 0 16px!important;
    height: 36px!important;
    min-width: 150px!important;
    margin-left: 8px!important;
    margin-right: 8px !important;
    margin-top: 0!important;
    font-family: Roboto, Arial, sans-serif!important;
    font-size: 14px!important;
    font-weight: 500!important;
    cursor: pointer!important;
    display: inline-flex!important;
    align-items: center!important;
    justify-content: center!important;
    white-space: nowrap!important;
    vertical-align: middle!important;
    box-sizing: border-box!important;
    position: relative!important;
    z-index: 100!important;
    transition: background 0.15s ease, opacity 0.15s ease!important;
  `;
  parent.style.setProperty("display", "flex", "important");
  parent.style.setProperty("flex-direction", "row", "important");
  parent.style.setProperty("align-items", "center", "important");
  parent.style.setProperty("flex-wrap", "nowrap", "important");
  btn.addEventListener("mouseenter", () => {
    if (!btn.disabled) btn.style.setProperty("background", "#cc0000", "important");
  });
  btn.addEventListener("mouseleave", () => {
    if (!btn.disabled) btn.style.setProperty("background", "#ff0000", "important");
  });
  btn.addEventListener("click", async () => {
    const originalText = "📋 Yoink Transcript";
    btn.disabled = true;
    btn.style.setProperty("opacity", "0.7", "important");
    btn.style.setProperty("cursor", "wait", "important");
    btn.textContent = "Opening...";
    try {
      const text = await openAndCopy();
      await navigator.clipboard.writeText(text);
      const lines = text.split("\n").filter(Boolean).length;
      btn.textContent = `✓ Copied ${lines} lines`;
      showToast(`Copied ${lines} lines`);
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.setProperty("opacity", "1", "important");
        btn.style.setProperty("cursor", "pointer", "important");
        btn.style.setProperty("background", "#ff0000", "important");
      }, 3000);
    } catch (error) {
      console.error("Yoink error:", error);
      btn.textContent = "Transcript failed";
      showToast("Failed to copy");
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.setProperty("opacity", "1", "important");
        btn.style.setProperty("cursor", "pointer", "important");
        btn.style.setProperty("background", "#ff0000", "important");
      }, 3000);
    }
  });
  subscribeButton.insertAdjacentElement("afterend", btn);
}

setInterval(addYoinkButton, 1000);
