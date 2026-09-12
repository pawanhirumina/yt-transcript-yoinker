const api = typeof browser!=='undefined'?browser:chrome;
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
function showToast(text,d=3000){
 const e=document.getElementById('yoinker-toast-container'); if(e)e.remove();
 const c=document.createElement('div'); c.id='yoinker-toast-container';
 const t=document.createElement('div'); t.className='yoinker-toast'; t.textContent=text;
 c.appendChild(t); document.body.appendChild(c); void t.offsetWidth;
 setTimeout(()=>t.classList.add('show'),10);
 setTimeout(()=>{t.classList.remove('show'); setTimeout(()=>c.remove(),300);},d);
}
async function getIncludeTimestampsSetting(){const r=await api.storage.local.get('includeTimestamps'); return r.includeTimestamps===true;}
async function openTranscript(){
 const exp=document.querySelector("#expand")||document.querySelector("button#expand"); if(exp){exp.click(); await sleep(800);}
 let el=[...document.querySelectorAll(".ytSpecTouchFeedbackShapeFill")].find(e=>(e.innerText||"").toLowerCase().includes("show transcript"));
 if(!el){el=[...document.querySelectorAll("button,[role='button']")].find(e=>(e.innerText||e.getAttribute("aria-label")||"").toLowerCase().includes("show transcript"));}
 if(!el)throw new Error("Show transcript button not found");
 const b=el.closest("button,[role='button']")||el; b.scrollIntoView({behavior:"smooth",block:"center"}); await sleep(300); b.click(); await sleep(2000);
}
function getTranscriptText(ts=false){
 const mod=[...document.querySelectorAll("transcript-segment-view-model")];
 if(mod.length){const l=[]; for(const s of mod){const te=s.querySelector("#timestamp,.segment-timestamp"); let t=te?.innerText?.trim()||""; if(!t){const m=s.innerText.match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)/); if(m)t=m[1];} let txt=s.querySelector(".yt-core-attributed-string,[role='text']")?.innerText||s.innerText||""; txt=txt.trim().replace(/\s+/g," ").replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/,"").trim(); if(!txt)continue; l.push(ts&&t?`${t} ${txt}`:txt);} if(l.length)return l.join("\n");}
 const leg=[...document.querySelectorAll("ytd-transcript-segment-renderer")];
 if(leg.length){const l=leg.map(s=>{const tsEl=s.querySelector("#timestamp")?.innerText?.trim()||""; let t=s.querySelector(".segment-text")?.innerText||s.innerText||""; t=t.trim().replace(/\s+/g," "); const m=t.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)/); if(m)return ts?`${m[1]} ${m[2]}`:m[2]; t=t.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/,"").trim(); return t?(ts?`${tsEl} ${t}`:t):null;}).filter(Boolean); if(l.length)return l.join("\n");}
 return null;
}
async function waitForTranscript(){const withTime=await getIncludeTimestampsSetting(); const start=Date.now(); while(Date.now()-start<10000){const txt=getTranscriptText(withTime); if(txt)return txt; await sleep(400);} return null;}
async function openAndCopy(){await openTranscript(); const txt=await waitForTranscript(); if(!txt)throw new Error("Transcript not found"); return txt;}

let showButtonEnabled=true;

function addYoinkButton(){
 if(!showButtonEnabled){document.getElementById('yt-yoink-btn')?.remove(); return;}
 if(document.getElementById('yt-yoink-btn'))return;
 const owner=document.querySelector("#owner"); if(!owner)return;
 const btn=document.createElement("button"); btn.id="yt-yoink-btn"; btn.textContent="Yoink Transcript";
 btn.style.cssText="background:#fff!important;color:#0f0f0f!important;border:none!important;border-radius:18px!important;padding:0 16px!important;height:36px!important;margin-left:8px!important;font-weight:500!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;visibility:visible!important;";
 btn.onclick=async()=>{try{btn.textContent="Yoinking..."; const text=await openAndCopy(); await navigator.clipboard.writeText(text); showToast(`Copied ${text.split("\n").length} lines`);}catch(e){showToast(e.message);} btn.textContent="Yoink Transcript";};
 owner.appendChild(btn);
}

async function init(){
 const r=await api.storage.local.get('showYTButton'); showButtonEnabled=r.showYTButton??true;
 addYoinkButton();
 const obs=new MutationObserver(()=>addYoinkButton());
 obs.observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('yt-navigate-finish',()=>setTimeout(addYoinkButton,500));
}

if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}
api.storage.onChanged.addListener(ch=>{if(ch.showYTButton){showButtonEnabled=ch.showYTButton.newValue??true; addYoinkButton();}});
api.runtime.onMessage.addListener((msg,s,sendResponse)=>{
  if(msg.action==='yoink'){
    (async()=>{
      try{
        const text=await openAndCopy();
        sendResponse({ok:true, text: text, lines: text.split("\n").length});
      }catch(e){
        sendResponse({ok:false, error:e.message});
      }
    })();
    return true;
  }
});
