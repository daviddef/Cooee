/**
 * The public page's lookup, wired to the bundled core.
 *
 * A real file rather than a string inside the generator: it was inlined, and the
 * generator is itself a template literal, so every ${} and backtick in it had to
 * survive two levels of escaping. Two attempts got that wrong before this.
 */
import { check } from './cooee.js'
const $ = (s) => document.querySelector(s)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))

function render(a) {
  const ev = a.signals.slice(0, 4).map(s =>
    `<p class="ev"><b>${s.direction === 'risk' ? 'Concern' : 'In its favour'}</b> &mdash; ${esc(s.summary)}</p>`).join('')
  const g = (a.guidance ?? []).slice(0, 4).map(x => `<li>${esc(x)}</li>`).join('')
  $('#lout').innerHTML = `<div class="verdict">
    <span class="band b-${esc(a.band)}">${esc(a.bandLabel)}</span>
    <h3>${esc(a.headline)}</h3>
    ${g ? `<span class="lab">What to do</span><ul>${g}</ul>` : ''}
    ${ev ? `<span class="lab">Why</span>${ev}` : ''}
    <span class="lab">What this does not tell you</span>
    <ul>${a.caveats.slice(0, 3).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>`
}

$('#lf').addEventListener('submit', (e) => {
  e.preventDefault()
  const q = $('#lq').value.trim()
  if (!q) return
  render(check(q, {
    claimed: $('#lclaimed').value,
    org: $('#lorg').value.trim(),
    code: $('#lcode').checked,
    // Pasting a message means it is a message, so the box need not also be
    // ticked — and the text decides whether there is a link.
    sms: ($('#lsms').checked || $('#ltext').value.trim())
      ? { sender: q, text: $('#ltext').value.trim() || undefined }
      : undefined,
  }))
})
