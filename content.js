console.log("Transcript Yoinker Loaded : v2.3.6")

const api = typeof browser!=='undefined'?browser:chrome;
const sleep = ms=>new Promise(r=>setTimeout(r,ms));

function showToast(text,d=3000){
 const e=document.getElementById('yoinker-toast-container'); if(e)e.remove();
 const c=document.createElement('div'); c.id='yoinker-toast-container';
 c.style.cssText="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999999;";
 const t=document.createElement('div');
 t.style.cssText="background:#000;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;opacity:0;transition:opacity.2s;";
 t.textContent=text;
 c.appendChild(t); document.body.appendChild(c);
 requestAnimationFrame(()=>t.style.opacity="1");
 setTimeout(()=>{t.style.opacity="0"; setTimeout(()=>c.remove(),300);},d);
}

function timeStringToSeconds(str){ if(!str) return 0; const p=str.trim().split(":").map(Number); if(p.length===3)return p[0]*3600+p[1]*60+p[2]; if(p.length===2)return p[0]*60+p[1]; return 0; }
function secondsToSrtTime(sec){ const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=Math.floor(sec%60), ms=Math.floor((sec%1)*1000); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`; }
function downloadSrt(content, filename){ const blob=new Blob([content],{type:"text/srt"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }

async function getIncludeTimestampsSetting(){ const r=await api.storage.local.get('includeTimestamps'); return r.includeTimestamps===true; }
async function getExportFormatSetting(){ const r=await api.storage.local.get('exportFormat'); return r.exportFormat||'txt'; }

async function openTranscript(){
 const exp=document.querySelector("#expand")||document.querySelector("button#expand"); if(exp){exp.click(); await sleep(800);}
 let el=[...document.querySelectorAll(".ytSpecTouchFeedbackShapeFill")].find(e=>(e.innerText||"").toLowerCase().includes("show transcript"));
 if(!el){el=[...document.querySelectorAll("button,[role='button']")].find(e=>(e.innerText||e.getAttribute("aria-label")||"").toLowerCase().includes("show transcript"));}
 if(!el)throw new Error("Show transcript button not found");
 const b=el.closest("button,[role='button']")||el; b.scrollIntoView({behavior:"smooth",block:"center"}); await sleep(300); b.click(); await sleep(2000);
}
function getTranscriptSegments(){
  const res=[]; const mod=[...document.querySelectorAll("transcript-segment-view-model")];
  if(mod.length){ for(const s of mod){ const te=s.querySelector("#timestamp,.segment-timestamp"); let t=te?.innerText?.trim()||""; if(!t){const m=s.innerText.match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)/); if(m)t=m[1];} let txt=s.querySelector(".yt-core-attributed-string,[role='text']")?.innerText||s.innerText||""; txt=txt.trim().replace(/\s+/g," ").replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/,"").trim(); if(!txt)continue; res.push({startStr:t,startSec:timeStringToSeconds(t),text:txt}); } if(res.length)return res; }
  const leg=[...document.querySelectorAll("ytd-transcript-segment-renderer")];
  if(leg.length){ for(const s of leg){ const tsEl=s.querySelector("#timestamp")?.innerText?.trim()||""; let t=s.querySelector(".segment-text")?.innerText||s.innerText||""; t=t.trim().replace(/\s+/g," "); const m=t.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)/); let finalText=t,finalTs=tsEl; if(m){finalTs=m[1]; finalText=m[2];} else{finalText=finalText.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/,"").trim();} if(!finalText)continue; res.push({startStr:finalTs,startSec:timeStringToSeconds(finalTs),text:finalText}); } if(res.length)return res; }
  return [];
}
function getTranscriptText(ts=false){ const segs=getTranscriptSegments(); if(!segs.length)return null; return segs.map(s=>ts?`${s.startStr} ${s.text}`:s.text).join("\n"); }
function getTranscriptSrt(){ const segs=getTranscriptSegments(); if(!segs.length)return null; return segs.map((s,i)=>{ const start=secondsToSrtTime(s.startSec); const nextStart=segs[i+1]?segs[i+1].startSec:s.startSec+3; const end=secondsToSrtTime(nextStart); return `${i+1}\n${start} --> ${end}\n${s.text}\n`; }).join("\n"); }

let showButtonEnabled = true;

function findInsertTarget(){
  return document.querySelector("#owner") ||
         document.querySelector("ytd-watch-metadata #owner") ||
         document.querySelector("#top-row ytd-video-owner-renderer") ||
         document.querySelector("ytd-video-owner-renderer") ||
         document.querySelector("#owner #subscribe-button")?.parentElement ||
         document.querySelector("ytd-watch-metadata #top-row");
}

function updateButtonLabel(){
  api.storage.local.get('exportFormat', r => {
    const format = r.exportFormat || 'txt';
    const btn = document.getElementById('yt-yoink-btn');
    if(!btn) return;
    if(format === 'txt') btn.textContent = 'Yoink Transcript';
    else if(format === 'srt-copy') btn.textContent = 'Yoink SRT (Copy)';
    else if(format === 'srt-download') btn.textContent = 'Yoink SRT (Download)';
  });
}

function createButtonElement(){
  const btn=document.createElement("button"); btn.id="yt-yoink-btn";
  btn.style.cssText="background:#fff!important;color:#0f0f0f!important;border:1px solid #ddd!important;border-radius:18px!important;padding:0 16px!important;height:36px!important;margin-left:8px!important;font-weight:500!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;z-index:9999!important;white-space:nowrap!important;";
  btn.onclick=async()=>{
    try{
      btn.textContent="Yoinking...";
      await openTranscript();
      const format = await getExportFormatSetting();
      const withTime = await getIncludeTimestampsSetting();
      if(format.startsWith('srt')){
        const srt = getTranscriptSrt(); if(!srt) throw new Error("Transcript not found");
        if(format === 'srt-copy'){ await navigator.clipboard.writeText(srt); showToast(`Copied SRT`); }
        else{ downloadSrt(srt, `${document.title.replace(/[^\w\d-]/g,'_').slice(0,80)}.srt`); showToast(`Downloaded SRT`); }
      } else {
        const txt = getTranscriptText(withTime); if(!txt) throw new Error("Transcript not found");
        await navigator.clipboard.writeText(txt); showToast(`Copied ${txt.split("\n").length} lines`);
      }
    }catch(e){ showToast(e.message); }
    finally{ updateButtonLabel(); }
  };
  return btn;
}

function addYoinkButton(){
  if(!showButtonEnabled){ document.getElementById('yt-yoink-btn')?.remove(); return; }
  if(document.getElementById('yt-yoink-btn')){ updateButtonLabel(); return; }

  const target = findInsertTarget();
  if(!target){
    console.log("[Yoinker] target not found yet, retrying...");
    return false;
  }
  console.log("[Yoinker] inserting into", target);
  const btn = createButtonElement();
  target.appendChild(btn);
  updateButtonLabel();
  return true;
}

async function init(){
 const r=await api.storage.local.get('showYTButton');
 showButtonEnabled = r.showYTButton?? true;
 console.log("[Yoinker] showButtonEnabled:", showButtonEnabled);

 let tries = 0;
 const interval = setInterval(()=>{
   tries++;
   const ok = addYoinkButton();
   if(ok || tries > 20) clearInterval(interval);
 }, 500);

 const obs=new MutationObserver(()=>addYoinkButton());
 obs.observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('yt-navigate-finish',()=>{ setTimeout(addYoinkButton,500); setTimeout(addYoinkButton,1500); });
}

if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}

api.storage.onChanged.addListener(ch=>{
  if(ch.showYTButton){ showButtonEnabled=ch.showYTButton.newValue??true; if(showButtonEnabled) addYoinkButton(); else document.getElementById('yt-yoink-btn')?.remove(); }
  if(ch.exportFormat){ updateButtonLabel(); }
});

api.runtime.onMessage.addListener((msg,s,sendResponse)=>{
  if(msg.action==='yoink'){
    (async()=>{
      try{
        await openTranscript();
        const withTime=await getIncludeTimestampsSetting();
        if(msg.format === 'srt'){ const srt=getTranscriptSrt(); sendResponse({ok:true, text:srt, lines:srt.split("\n").length}); }
        else{ const text=getTranscriptText(withTime); sendResponse({ok:true, text:text, lines:text.split("\n").length}); }
      }catch(e){ sendResponse({ok:false, error:e.message}); }
    })();
    return true;
  }
});