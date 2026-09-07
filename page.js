/**
 * The public page's lookup, wired to the bundled core.
 *
 * A real file rather than a string inside the generator: it was inlined, and the
 * generator is itself a template literal, so every ${} and backtick in it had to
 * survive two levels of escaping. Two attempts got that wrong before this.
 */
import { check, organisationNames } from './cooee.js'
const $ = (s) => document.querySelector(s)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))

function render(a) {
  const ev = a.signals.slice(0, 4).map(s =>
    `<p class="ev"><b>${s.direction === 'risk' ? 'Concern' : 'In its favour'}</b> &mdash; ${esc(s.summary)}</p>`).join('')
  const g = (a.guidance ?? []).slice(0, 4).map(x => `<li>${esc(x)}</li>`).join('')
  // The organisation they actually named, with its own published number, ahead
  // of any general advice. Decided in the core: which numbers may be offered is
  // a safety question, not a presentation one.
  const acts = (a.actions ?? []).map(x =>
    `<a class="act" href="tel:${esc(x.e164)}"><b>${esc(x.display)}</b><span>${esc(x.organisation)} — ${esc(x.label)}</span></a>`).join('')
  // Decided in the core and rendered here. Composing these labels in the page
  // would be the band-chip mistake a third time.
  const pills = (a.tags ?? []).map(t =>
    `<span class="pill ${esc(t.tone)}">${esc(t.label)}</span>`).join('')
  $('#lout').innerHTML = `<div class="verdict">
    <span class="band b-${esc(a.band)}">${esc(a.bandLabel)}</span>
    <h3>${esc(a.headline)}</h3>
    ${pills ? `<div class="pills">${pills}</div>` : ''}
    ${acts ? `<span class="lab">Who to ring</span><div class="acts">${acts}</div>` : ''}
    ${g ? `<span class="lab">What to do</span><ul>${g}</ul>` : ''}
    ${ev ? `<span class="lab">Why</span>${ev}` : ''}
    <span class="lab">What this does not tell you</span>
    <ul>${a.caveats.slice(0, 3).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>`
}

// The organisations the box will actually resolve, from the same registry the
// rules read. Suggested, never enforced: a name we do not hold is a legitimate
// answer, and the result says plainly that it could not be checked.
const orgList = $('#lorgs')
if (orgList) {
  for (const n of organisationNames()) {
    const o = document.createElement('option')
    o.value = n
    orgList.appendChild(o)
  }
}

$('#lf').addEventListener('submit', (e) => {
  e.preventDefault()
  // The mark is a call going out and an answer coming back, so it answers when
  // you call. Behind prefers-reduced-motion in the stylesheet.
  document.body.classList.remove('listening')
  void document.body.offsetWidth
  document.body.classList.add('listening')
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
