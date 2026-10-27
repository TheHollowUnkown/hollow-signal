// HOLLOW recovery verifier. Puzzle pacing only; not access security.
// Uses event delegation to support cached/updated page layouts.
(() => {
  let processing = false;
  async function verify(button) {
    const section = button.closest('.recovery-gate, .panel') || document;
    const input = section.querySelector('#code') || document.getElementById('code');
    const result = section.querySelector('#response') || document.getElementById('response');
    if (!input || !result || processing) return;
    const guess = input.value.trim().toUpperCase().replace(/\s+/g, '');
    if (!guess) {
      result.className='err';
      result.textContent='ENTRY REQUIRED';
      input.focus();
      return;
    }
    processing = true;
    button.disabled = true;
    try {
      if (!window.crypto || !window.crypto.subtle) throw new Error('NO_WEBCRYPTO');
      const salt = button.dataset.salt;
      const expected = button.dataset.proof;
      const target = button.dataset.next || button.dataset.target;
      if (!salt || !expected || !target) throw new Error('MISSING_TERMINAL_DATA');
      const bytes = new TextEncoder().encode(salt + ':' + guess);
      const digest = await window.crypto.subtle.digest('SHA-256', bytes);
      const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
      if (hash === expected) {
        result.className='ok';
        result.textContent='ENTRY RECOGNIZED // FETCHING RECORD';
        window.setTimeout(() => window.location.assign(target), 700);
      } else {
        result.className='err';
        result.textContent='ENTRY NOT RECOGNIZED';
        input.focus();
      }
    } catch (error) {
      result.className='err';
      result.textContent='VERIFICATION UNAVAILABLE // RELOAD THE TERMINAL';
      console.warn('HOLLOW verifier:', error);
    } finally {
      processing = false;
      button.disabled = false;
    }
  }
  document.addEventListener('click', event => {
    const button=event.target.closest('[data-proof]');
    if(button) verify(button);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const input=event.target.closest('#code');
    if(!input)return;
    const gate=input.closest('.recovery-gate, .panel') || document;
    const button=gate.querySelector('[data-proof]');
    if(button) { event.preventDefault(); verify(button); }
  });
})();
