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
//
// Built rather than handed to <datalist>, which is the obvious control and which
// iOS Safari renders as a strip above the keyboard that is easy to miss — it
// read as the suggestions simply not working.
const NAMES = organisationNames()
const org = $('#lorg')
const acs = $('#lacs')
let acIndex = -1

function closeAc() {
  acs.hidden = true
  acs.innerHTML = ''
  acIndex = -1
  org.setAttribute('aria-expanded', 'false')
}

function openAc() {
  const q = org.value.trim().toLowerCase()
  if (!q) return closeAc()
  const starts = NAMES.filter(n => n.toLowerCase().startsWith(q))
  const has = NAMES.filter(n => !n.toLowerCase().startsWith(q) && n.toLowerCase().includes(q))
  const hits = [...starts, ...has].slice(0, 8)
  if (!hits.length || (hits.length === 1 && hits[0].toLowerCase() === q)) return closeAc()
  acs.innerHTML = hits.map((n, i) =>
    `<li role="option" id="ac${i}" aria-selected="false">${esc(n)}</li>`).join('')
  acs.hidden = false
  acIndex = -1
  org.setAttribute('aria-expanded', 'true')
}

function pick(el) {
  if (!el) return
  org.value = el.textContent
  closeAc()
  org.focus()
}

if (org && acs) {
  org.addEventListener('input', openAc)
  org.addEventListener('focus', openAc)
  org.addEventListener('blur', () => setTimeout(closeAc, 150))
  acs.addEventListener('mousedown', (e) => { e.preventDefault(); pick(e.target.closest('li')) })
  org.addEventListener('keydown', (e) => {
    const items = [...acs.querySelectorAll('li')]
    if (!items.length) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      acIndex = (acIndex + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items.forEach((li, i) => li.setAttribute('aria-selected', String(i === acIndex)))
      org.setAttribute('aria-activedescendant', items[acIndex].id)
    } else if (e.key === 'Enter' && acIndex >= 0) {
      e.preventDefault()
      pick(items[acIndex])
    } else if (e.key === 'Escape') {
      closeAc()
    }
  })
}

/**
 * What the reader has already asked about, kept in their own browser.
 *
 * Wrapped because storage throws outright in some private modes, and a page
 * whose whole promise is that nothing leaves the phone must not fall over when
 * the phone declines to remember anything.
 */
const RECENT_KEY = 'cooee.recent'
function readRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 8) } catch { return [] }
}
function rememberRecent(q) {
  try {
    const next = [q, ...readRecent().filter(x => x !== q)].slice(0, 8)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch { /* declined, and the page works without it */ }
}
function paintRecent() {
  const box = $('#lrecent')
  if (!box) return
  const list = readRecent()
  box.hidden = !list.length
  box.innerHTML = list.length
    ? `<span class="rl">Recently checked</span>` +
      list.map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('')
    : ''
}
$('#lrecent')?.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-q]')
  if (!b) return
  $('#lq').value = b.dataset.q
  $('#lf').dispatchEvent(new Event('submit'))
})
paintRecent()

$('#lf').addEventListener('submit', (e) => {
  e.preventDefault()
  // The mark is a call going out and an answer coming back, so it answers when
  // you call. Behind prefers-reduced-motion in the stylesheet.
  document.body.classList.remove('listening')
  void document.body.offsetWidth
  document.body.classList.add('listening')
  const q = $('#lq').value.trim()
  if (!q) return
  rememberRecent(q)
  paintRecent()
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
