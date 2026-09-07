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

/**
 * A finding, WITH THE THING THAT MAKES IT CHECKABLE.
 *
 * This page's own generator opens by saying why it is generated at all: every
 * number on it carries the URL it was read from and the date it was checked,
 * "so a reader can verify any line without trusting us". That is the whole of
 * hard rule 1's payoff, and the lookup card on the same page threw it away —
 * `citationOf()` resolves a per-finding source and puts it on the payload,
 * `index.html` prints the source, its kind, its age and a link, the CLI prints
 * all four, and this surface rendered a direction and a sentence.
 *
 * Which mattered most exactly where the card is loudest: *ACMA states they
 * cannot be used for caller-ID overstamping* and *Commonwealth Bank's own
 * published number* are quotations from somebody else's page, and a stranger
 * was asked to take both on our word.
 *
 * The link, not a second derivation of it: `detail.source` is resolved once in
 * the core and travels as `source.url`, and `citation.test.ts` exists because
 * four surfaces once rendered the source TABLE's generic value instead — a
 * "source" link that 404ed under the loudest finding in the product.
 */
const evRow = (s) => {
  const age = `observed ${s.ageDays} day${s.ageDays === 1 ? '' : 's'} ago`
  const cite = s.source.url
    ? `<a href="${esc(s.source.url)}" target="_blank" rel="noopener">${esc(s.source.name)}<span class="sr-only">, opens in a new tab</span></a>`
    : esc(s.source.name)
  return `<p class="ev"><b>${s.direction === 'risk' ? 'Concern' : 'In its favour'}</b> &mdash; ${esc(s.summary)}` +
    `<span class="prov">${cite} &middot; ${esc(s.source.kind)} &middot; ${age}</span></p>`
}

function render(a) {
  const ev = a.signals.slice(0, SIGNALS_SHOWN).map(evRow).join('')
  /**
   * EVERY INSTRUCTION, AND THIS ONE IS NOT FOLDED EITHER.
   *
   * It was `.slice(0, 4)`, dropping the rest in silence — the caveat defect of
   * two runs ago, in the channel beside it, and it survived that fix because the
   * fix was written about caveats rather than about discarding. Live on the
   * shipped registry with no database, on 787 combinations of number, context,
   * claim and code: the line dropped every single time is the one every result
   * carries, *report it to Scamwatch … contact IDCARE on 1800 595 160*, because
   * it is always last. Commonwealth Bank's own `13 2221` seen as an incoming
   * call with an unrequested code — `confirmed`, 88, "this caller ID is forged"
   * — showed four lines of checking advice and silently cut, in order: *ring
   * your bank now, a payment can sometimes be stopped while it is still
   * moving*, *do not do what you were asked to do*, the line saying the number
   * itself is CommBank's and may be dialled, *hang up and call back*, and the
   * reporting line. Everything item 21 exists to add, gone from the surface a
   * stranger actually reaches, on the verdict that matters most.
   *
   * Unlike the caveats, these are not folded behind a disclosure. Item 12 put
   * the instruction above the score because it is the part a frightened person
   * can act on, and an instruction behind a click is an instruction not
   * followed. `index.html` has rendered the whole list since guidance existed;
   * two surfaces disagreeing about how much of it a reader gets is the second
   * copy of a decision this project keeps shipping defects from.
   */
  const g = (a.guidance ?? []).map(x => `<li>${esc(x)}</li>`).join('')
  // The organisation they actually named, with its own published number, ahead
  // of any general advice. Decided in the core: which numbers may be offered is
  // a safety question, not a presentation one.
  const acts = (a.actions ?? []).map(x =>
    `<a class="act" href="tel:${esc(x.e164)}"><b>${esc(x.display)}</b><span>${esc(x.organisation)} — ${esc(x.label)}</span></a>`).join('')
  // Decided in the core and rendered here. Composing these labels in the page
  // would be the band-chip mistake a third time.
  const pills = (a.tags ?? []).map(t =>
    `<span class="pill ${esc(t.tone)}">${esc(t.label)}</span>`).join('')
  // WHICH QUESTION THIS ANSWERED, ahead of the answer.
  //
  // Off the payload, never composed here: the CLI worked this out for itself
  // once, wrote a private table, and the core gained `contextLabel()` so that
  // three surfaces could not disagree. This form is the fourth and it had never
  // been told — it passes no context at all, so every result is read as a call
  // the number made to you, which is the reading that produces "this caller ID
  // is forged, that is a fact". A reader who was HANDED this number to ring got
  // that verdict with nothing on the screen saying what had been assumed.
  //
  // Saying so is the half that is ours. OFFERING THE CHOICE IS ROADMAP ITEM 22
  // and is a product decision, not this file's: the same 1800 number swings from
  // `confirmed` to `insufficient-evidence` across the three readings, and "I'm
  // not sure" is the easiest thing on a form to click.
  const ctx = a.contextLabel ? `<p class="rctx">${esc(a.contextLabel)}</p>` : ''
  // WHAT THE NUMBERING PLAN SAYS ABOUT THE NUMBER, as a fact rather than as a
  // finding.
  //
  // Off the payload, and this surface had never been told it existed —
  // `planLabel` was extracted into the core precisely because the interactive
  // page and the CLI each derived the plan word for themselves and the page's
  // version over-reached, calling an unparseable string "not allocated". Both of
  // those render it in a neutral meta line. This one rendered it ONLY as a red
  // "Not allocated" pill, so the fifth surface took a plan fact and showed it
  // exclusively in the risk channel. The pill is gone (see `tagsFor`); the fact
  // belongs here, where a reader can see it without being accused by it.
  const plan = a.number?.planLabel ? `<p class="rplan">${esc(a.number.planLabel)}</p>` : ''
  /**
   * THE VERDICT IN THE WORDS SOMEBODY FRIGHTENED CAN USE, which this surface
   * had never been told the core computes.
   *
   * `plainVerdict()` exists because item 12 established that the headline is
   * written for accuracy and the plain verdict for a reader mid-scam-call. The
   * CLI prints both. `index.html` leads with it in plain mode and announces it
   * alone into the live region, because that one string is the whole of what a
   * screen-reader user gets before they navigate. This page has no plain mode,
   * no announcement, and rendered only the headline — so it is the one surface
   * where the sentence cannot be reached at all, and it is the surface a
   * stranger reaches on a phone, which is the reader item 12 was written for.
   *
   * What that cost is clearest where the product is quietest. At
   * `insufficient-evidence` the headline is *We hold no information about this
   * number.* and stops; the plain verdict is *We hold nothing at all about this
   * number. That is not the same as it being safe.* The second sentence is the
   * one this whole product exists to say, and it was folded away in the caveat
   * list on the surface with no second screen.
   *
   * Both, not one. Item 21's note applies: the overlap between the plain
   * verdict and the guidance is deliberate, and saying an imperative twice is
   * the benign direction of that error.
   */
  const plain = a.plain ? `<p class="rplain">${esc(a.plain)}</p>` : ''
  $('#lout').innerHTML = `<div class="verdict">
    <span class="band b-${esc(a.band)}">${esc(a.bandLabel)}</span>
    ${ctx}
    ${plan}
    <h3>${esc(a.headline)}</h3>
    ${plain}
    ${pills ? `<div class="pills">${pills}</div>` : ''}
    ${acts ? `<span class="lab">Who to ring</span><div class="acts">${acts}</div>` : ''}
    ${g ? `<span class="lab">What to do</span><ul>${g}</ul>` : ''}
    ${ev ? `<span class="lab">Why</span>${ev}` : ''}
    ${overflow(a.signals.slice(SIGNALS_SHOWN),
      (n) => `${n} more finding${n === 1 ? '' : 's'}`,
      (rest) => rest.map(evRow).join(''))}
    <span class="lab">What this does not tell you</span>
    <ul>${a.caveats.slice(0, CAVEATS_SHOWN).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    ${overflow(a.caveats.slice(CAVEATS_SHOWN),
      (n) => `${n} more thing${n === 1 ? '' : 's'} this does not tell you`,
      (rest) => `<ul>${rest.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`)}
  </div>`
}

/**
 * How many caveats stand open, and what happens to the rest.
 *
 * THE REST USED TO BE DROPPED, SILENTLY, AND THAT HAS ALREADY COST ONE DEFECT
 * HERE. `entry.ts` appended "this page does not check complaint records" last,
 * so a 1800 number checked against a named bank showed the reader "a clean
 * result means this number has not been reported" — which presupposes that
 * reporting was checked — and cut the sentence saying it was not. The corrective
 * half removed by a truncation that keeps the half it corrects, and removed
 * exactly when the result is busiest and the page therefore looks most thorough.
 *
 * That was fixed by making the important sentence LEAD, which was right and
 * which left the mechanism in place: caveat four onwards still vanished, and the
 * ordering only decided which of them. So the fix held exactly as long as
 * nothing else was added — and then the breach caveat arrived, took the third
 * slot for any lookup naming an organisation, and pushed the general
 * caller-ID-forgery sentence off the page. A priority list is not a fix for
 * dropping things; it is a rule for choosing what to drop.
 *
 * Nothing is dropped now. Three stand open, because a wall of qualifications
 * under a verdict is its own way of not being read, and the remainder is one
 * click away and COUNTED IN THE SUMMARY, so a reader can see that there is more
 * rather than having to suspect it.
 *
 * AND THE FIX WAS WRITTEN ABOUT CAVEATS RATHER THAN ABOUT DISCARDING, which is
 * why `render` went on cutting guidance and findings for two more runs in the
 * three lines directly above the one this fixed. The helper below is now shared
 * so that a list added to the payload has somewhere to go that is not the floor.
 */
const CAVEATS_SHOWN = 3

/**
 * How many findings stand open before the rest fold.
 *
 * Findings ARE folded where instructions are not, and the difference is what
 * each channel costs a reader who never opens it: a supporting finding behind a
 * counted disclosure is still visibly there to be read, while an instruction
 * behind a click is an instruction not followed. Latent rather than live — the
 * browser build runs on `NO_CORPUS` and nothing reachable there has yet raised
 * a fifth finding — and fixed anyway, because the mechanism is the defect and
 * the day a message raises five is not the day to notice it.
 */
const SIGNALS_SHOWN = 4

/**
 * Whatever the open list did not show, folded behind a disclosure that counts
 * it. `rest` is already sliced by the caller, so this cannot fold a different
 * remainder from the one that was left out.
 *
 * `rows` is supplied rather than assumed because a caveat is a sentence and a
 * finding is a direction and a summary; flattening one into the other to share
 * a helper would put a second copy of the row markup in this file.
 */
function overflow(rest, summary, rows) {
  if (rest.length === 0) return ''
  return `<details class="morecav"><summary>${esc(summary(rest.length))}</summary>${rows(rest)}</details>`
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
  // Asking a question means leaving the list you were reading. Otherwise the
  // answer renders above an open library section and the page shows both.
  if (location.hash && location.hash !== '#') location.hash = ''
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

/* ---------------------------------------------------------------------------
 * Breach list filter.
 *
 * Filters on organisation and sector text only, and never sends a keystroke
 * anywhere: the whole list is already in the page, so this is a `hidden`
 * toggle over elements that are all present at load. That is the reason the
 * section can promise what it promises.
 * ------------------------------------------------------------------------- */
;(function breachFilter() {
  const box = document.getElementById('bfilter')
  const count = document.getElementById('bcount')
  if (!box || !count) return
  const cards = Array.prototype.slice.call(document.querySelectorAll('.brc'))
  const total = cards.length

  function paint() {
    const q = box.value.trim().toLowerCase()
    let shown = 0
    for (const c of cards) {
      const hit = q.length < 2 || (c.dataset.org || '').indexOf(q) !== -1
      c.hidden = !hit
      if (hit) shown++
    }
    count.textContent = q.length < 2
      ? total + ' recorded, most recent first'
      : shown === 0
        ? 'Nothing recorded here for “' + box.value.trim() + '” — which is not the same as nothing having happened.'
        : shown + ' of ' + total + ' shown'
  }

  box.addEventListener('input', paint)
  paint()
})()

/* ---------------------------------------------------------------------------
 * The menu, and the library behind it.
 *
 * The front page answers one question. Everything else — 28 organisations, the
 * reporting contacts, the breach list — is a view, hidden until it is chosen
 * and shown in place of the front page rather than stacked underneath it.
 *
 * ROUTED ON THE HASH, not on a variable, for three reasons that all matter on a
 * phone: the back button leaves a list instead of leaving the site, a link to a
 * list can be sent to someone, and a reload stays where it was. The state lives
 * in the URL, so there is only one of it.
 *
 * If this script does not run, every view is an ordinary stacked section and
 * the burger is hidden. The reference material is safety information and does
 * not get to depend on a script.
 * ------------------------------------------------------------------------- */
;(function library() {
  const menu = document.getElementById('menu')
  const btn = document.getElementById('mbtn')
  const close = document.getElementById('mclose')
  const views = Array.prototype.slice.call(document.querySelectorAll('.view'))
  if (!menu || !btn || !views.length) return

  function openMenu() {
    menu.hidden = false
    btn.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden'
    const first = menu.querySelector('.ml a')
    if (first) first.focus()
  }

  function closeMenu(restoreFocus) {
    menu.hidden = true
    btn.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = ''
    if (restoreFocus) btn.focus()
  }

  /**
   * Show at most one view. An unknown hash falls back to the front page rather
   * than to a blank one — a stale or mistyped link must never leave someone
   * looking at nothing on a page they opened because they were worried.
   */
  function route() {
    const want = (location.hash || '').replace(/^#/, '')
    let shown = null
    for (const v of views) {
      const on = v.id === 'v-' + want
      v.classList.toggle('on', on)
      if (on) shown = v
    }
    document.body.classList.toggle('viewing', !!shown)
    if (shown) {
      const h = shown.querySelector('h2')
      if (h) h.focus({ preventScroll: true })
      window.scrollTo(0, 0)
    }
  }

  btn.addEventListener('click', openMenu)
  if (close) close.addEventListener('click', function () { closeMenu(true) })
  // The scrim is the panel's sibling ground; a click that lands on it is a
  // click outside the panel.
  menu.addEventListener('click', function (e) { if (e.target === menu) closeMenu(true) })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) closeMenu(true)
  })
  menu.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.ml a')) closeMenu(false)
  })
  window.addEventListener('hashchange', route)
  route()
})()
