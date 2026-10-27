// Static ARG client. Checksums are puzzle pacing only, not real authentication.
(async function(){
 const input=document.getElementById('code');
 const button=document.querySelector('[data-proof]');
 const message=document.getElementById('response');
 if(!input||!button||!message)return;
 const submit=async()=>{
  const guess=input.value.trim().toUpperCase().replace(/\s+/g,'');
  if(!guess){message.className='err';message.textContent='ENTRY REQUIRED';return;}
  button.disabled=true;
  try{
   const bytes=new TextEncoder().encode(button.dataset.salt+':'+guess);
   const digest=await crypto.subtle.digest('SHA-256',bytes);
   const proof=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
   if(proof===button.dataset.proof){
    message.className='ok';message.textContent='ENTRY RECOGNIZED // FETCHING RECORD';
    setTimeout(()=>{location.assign(button.dataset.next)},700);
   }else{message.className='err';message.textContent='ENTRY NOT RECOGNIZED';input.focus();}
  }catch(e){message.className='err';message.textContent='VERIFICATION UNAVAILABLE // SECURE CONNECTION REQUIRED';}
  finally{button.disabled=false;}
 };
 button.addEventListener('click',submit);
 input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();submit();}});
})();
