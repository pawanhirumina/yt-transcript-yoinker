const api = typeof browser!=='undefined'?browser:chrome;

document.addEventListener('DOMContentLoaded', async()=>{
  const hideEl=document.getElementById('hideButton');
  const darkEl=document.getElementById('darkMode');
  const tsEl=document.getElementById('timestamps');
  const formatEl=document.getElementById('format');
  const yoinkBtn=document.getElementById('yoink');
  const statusEl=document.getElementById('status');

          const d=await api.storage.local.get(['showYTButton','darkMode','includeTimestamps','exportFormat']);
  hideEl.checked=!(d.showYTButton??true);
  darkEl.checked=d.darkMode??false;
  tsEl.checked=d.includeTimestamps===true;
  formatEl.value=d.exportFormat||'txt';
  document.body.classList.toggle('dark',darkEl.checked);

  hideEl.addEventListener('change',()=>api.storage.local.set({showYTButton:!hideEl.checked}));
  darkEl.addEventListener('change',()=>{api.storage.local.set({darkMode:darkEl.checked}); document.body.classList.toggle('dark',darkEl.checked);});
  tsEl.addEventListener('change',()=>api.storage.local.set({includeTimestamps:tsEl.checked}));
  formatEl.addEventListener('change',()=>api.storage.local.set({exportFormat:formatEl.value}));

  yoinkBtn.addEventListener('click', async()=>{
    const format = formatEl.value;
    statusEl.textContent="Yoinking..."; yoinkBtn.disabled=true; 
    try{
      const tabs=await api.tabs.query({active:true,currentWindow:true});
      const isSrt = format.startsWith('srt');
      const res=await api.tabs.sendMessage(tabs[0].id,{action:'yoink', format: isSrt? 'srt' : 'txt'});
      if(!res.ok) throw new Error(res.error);

      if(format === 'txt'){
        await navigator.clipboard.writeText(res.text);
        statusEl.textContent=`Copied ${res.lines} lines!`;
      } else if(format === 'srt-copy'){
        await navigator.clipboard.writeText(res.text);
        statusEl.textContent=`Copied SRT!`;
      } else if(format === 'srt-download'){
        
        const blob = new Blob([res.text], {type: 'text/srt'});
        const url = URL.createObjectURL(blob);
        const title = tabs[0].title.replace(/[^\w\d-]/g,'_').slice(0,80);
        await api.downloads.download({url, filename: `${title}.srt`});
        statusEl.textContent=`Downloading SRT!`;
      }
    }catch(e){
      statusEl.textContent=e.message.includes("Receiving end")?"Refresh YouTube":e.message;
    }finally{
      yoinkBtn.disabled=false;
      setTimeout(()=>statusEl.textContent="",3000);
    }
  });
});