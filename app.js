// HOLLOW client-side checksum verification. Static site, not an access-control boundary.
async function submitRecovery(button) {
  const input = document.getElementById('code');
  const out = document.getElementById('response');
  if (!input || !out || button.disabled) return;
  const guess = input.value.trim().toUpperCase().replace(/\s+/g, '');
  if (!guess) { out.className = 'err'; out.textContent = 'ACCESS DENIED // ENTRY REQUIRED'; return; }
  button.disabled = true;
  try {
    const raw = new TextEncoder().encode(button.dataset.salt + ':' + guess);
    const buffer = await crypto.subtle.digest('SHA-256', raw);
    const proof = Array.from(new Uint8Array(buffer), x => x.toString(16).padStart(2, '0')).join('');
    if (proof === button.dataset.proof) {
      out.className = 'ok';
      out.textContent = 'ACCESS GRANTED // RECOVERING RECORD…';
      sessionStorage.setItem('hollow.last', button.dataset.target);
      setTimeout(() => { location.href = button.dataset.target; }, 650);
    } else {
      out.className = 'err';
      out.textContent = 'ACCESS DENIED // ENTRY NOT RECOGNIZED';
      input.focus();
    }
  } catch (e) {
    out.className = 'err';
    out.textContent = 'SYSTEM ERROR // SECURE CONTEXT REQUIRED';
  } finally { button.disabled = false; }
}
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('code');
  const button = document.querySelector('button.recovery-submit');
  if (button) button.addEventListener('click', () => submitRecovery(button));
  if (input && button) input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); button.click(); }
  });
  const stamp = document.getElementById('local-stamp');
  if (stamp) stamp.textContent = 'ARCHIVE CLOCK // 2009.10.31';
});
