const api = typeof browser!=='undefined'?browser:chrome;
document.addEventListener('DOMContentLoaded', async()=>{
  const hideEl=document.getElementById('hideButton');
  const darkEl=document.getElementById('darkMode');
  const tsEl=document.getElementById('timestamps');
  const yoinkBtn=document.getElementById('yoink');
  const statusEl=document.getElementById('status');
  const d=await api.storage.local.get(['showYTButton','darkMode','includeTimestamps']);
  hideEl.checked=!(d.showYTButton??true);
  darkEl.checked=d.darkMode??false;
  tsEl.checked=d.includeTimestamps===true;
  document.body.classList.toggle('dark',darkEl.checked);
  hideEl.addEventListener('change',()=>api.storage.local.set({showYTButton:!hideEl.checked}));
  darkEl.addEventListener('change',()=>{api.storage.local.set({darkMode:darkEl.checked}); document.body.classList.toggle('dark',darkEl.checked);});
  tsEl.addEventListener('change',()=>api.storage.local.set({includeTimestamps:tsEl.checked}));
  yoinkBtn.addEventListener('click', async()=>{
    statusEl.textContent="Yoinking..."; yoinkBtn.disabled=true;
    try{
      const tabs=await api.tabs.query({active:true,currentWindow:true});
      const res=await api.tabs.sendMessage(tabs[0].id,{action:'yoink'});
      if(!res.ok) throw new Error(res.error);
      await navigator.clipboard.writeText(res.text);
      statusEl.textContent=`Copied ${res.lines} lines!`;
    }catch(e){
      statusEl.textContent=e.message.includes("Receiving end")?"Refresh YouTube":e.message;
    }finally{
      yoinkBtn.disabled=false;
      setTimeout(()=>statusEl.textContent="",3000);
    }
  });
});
