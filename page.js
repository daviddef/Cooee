/**
 * The public page's lookup, wired to the bundled core.
 *
 * A real file rather than a string inside the generator: it was inlined, and the
 * generator is itself a template literal, so every ${} and backtick in it had to
 * survive two levels of escaping. Two attempts got that wrong before this.
 */
import { check, checkEmail, organisationNames } from './cooee.js'
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
  /**
   * `.evs` AROUND THE SENTENCE, so a channel that is not a screen can take the
   * finding without the citation attached to it.
   *
   * The citation is the whole point of this row on a screen — it is what makes
   * a claim checkable without trusting us — and read aloud it is noise: a
   * source name, a kind and an age, after every sentence. The sentence is the
   * finding; `.prov` is already a named element for the other half, and this
   * gives the first half a name too rather than leaving a reader-of-the-DOM to
   * subtract one from the other.
   */
  return `<p class="ev"><b>${s.direction === 'risk' ? 'Concern' : 'In its favour'}</b> &mdash; <span class="evs">${esc(s.summary)}</span>` +
    `<span class="prov">${cite} &middot; ${esc(s.source.kind)} &middot; ${age}</span></p>`
}

/**
 * An answer has arrived: put it in the page, and take the reader to it.
 *
 * ONE PLACE, BECAUSE THERE ARE TWO RENDERERS AND ONLY THE NEWER ONE EVER DID
 * THIS. `renderEmail` was written months after `render` and closed with a
 * `scrollIntoView`; `render` — the phone number, which is the whole product —
 * had nothing, so on a 390x800 phone somebody pasted a text, pressed the
 * button, and stayed at the top of the page with the answer 1187 pixels below
 * the fold and nothing on screen having changed. Found by driving the built
 * page in Chromium; invisible in every test, because a test reads the markup
 * and the markup was perfect.
 *
 * The other surface does not have this bug and does not do this either: the
 * interactive page focuses the result region, which announces it and scrolls
 * in one move. That is the better answer and it is not this one, because
 * `#lout` here is an `aria-live` region — moving focus into one is how you get
 * a result read twice. Making that right is a change to how this page speaks,
 * which is item 30 rather than a line in a scroll fix.
 */
/**
 * Everything that happens when an answer appears, in one place.
 *
 * The assessment comes in beside the markup so the share button can be handed
 * the FIELDS rather than left to read the rendered card — reading the card
 * would pick up whatever is on it, and what is on it is the message they
 * pasted. Doing it here rather than at each call site also means a third
 * renderer cannot forget.
 */
function showAnswer(html, a) {
  const out = $('#lout')
  if (!out) return
  out.innerHTML = html
  if (a && window.__cooeeShare) window.__cooeeShare(a)
  out.scrollIntoView({ block: 'nearest' })
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
  // Where to send the message itself. A separate list from the numbers above,
  // because it answers a different question and only a reader holding a text
  // has that question — the core decides whether there is one.
  const sendTo = (a.reportTo ?? []).map(x =>
    `<a class="act send" href="mailto:${esc(x.address)}"><b>${esc(x.address)}</b><span>${esc(x.organisation)} — forward the message here</span></a>`).join('')
  // What the organisation itself is warning about right now. A link, not a
  // paraphrase — these pages carry no date, and an undated warning restated in
  // our words would be worse than the page it came from.
  const own = a.alertsPage
    ? `<a class="act own" href="${esc(a.alertsPage.url)}" rel="noopener"><b>${esc(a.alertsPage.organisation)}&rsquo;s own scam page</b><span>What they are warning about right now</span></a>`
    : ''
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
  //
  // AND THE FIX WAS ONE FIELD WIDE WHEN THE LINE IS FOUR. The paragraph above
  // is about `planLabel` and names the neutral meta line the other two surfaces
  // render — and this surface still did not have that line, it had one part of
  // it. The country is the part that mattered: `From New Zealand` reached this
  // reader as a red pill and a risk finding and through nothing else, which is
  // word for word the fault recorded above, on the neighbouring field, fixed
  // eight lines from here and never asked of it. `numberMeta` is the whole line,
  // decided in the core, and the country arrives in it as "New Zealand" rather
  // than as `NZ`.
  const plan = a.number?.meta?.length ? `<p class="rplan">${esc(a.number.meta.join(' · '))}</p>` : ''
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
  showAnswer(`<div class="verdict">
    <span class="band b-${esc(a.band)}">${esc(a.bandLabel)}</span>
    ${ctx}
    ${plan}
    <h3>${esc(a.headline)}</h3>
    ${plain}
    ${pills ? `<div class="pills">${pills}</div>` : ''}
    <div class="tools"><button type="button" class="speak" id="lspeak" hidden>Read this out</button><button type="button" class="share" id="lshare" hidden>Send to someone</button></div>
    ${acts ? `<span class="lab">Who to ring</span><div class="acts">${acts}</div>` : ''}
    ${sendTo ? `<span class="lab">Where to send it</span><div class="acts">${sendTo}</div>` : ''}
    ${own ? `<div class="acts">${own}</div>` : ''}
    ${g ? `<span class="lab">What to do</span><ul class="guide">${g}</ul>` : ''}
    ${ev ? `<span class="lab">Why</span>${ev}` : ''}
    ${overflow(a.signals.slice(SIGNALS_SHOWN),
      (n) => `${n} more finding${n === 1 ? '' : 's'}`,
      (rest) => rest.map(evRow).join(''))}
    <span class="lab">What this does not tell you</span>
    <ul>${a.caveats.slice(0, CAVEATS_SHOWN).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    ${overflow(a.caveats.slice(CAVEATS_SHOWN),
      (n) => `${n} more thing${n === 1 ? '' : 's'} this does not tell you`,
      (rest) => `<ul>${rest.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`)}
  </div>`, a)
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

/**
 * An email result: findings, actions, and what this cannot see.
 *
 * No band chip and no score, and the absence is stated rather than left as a
 * gap — "nothing stood out" is a different claim from "this is safe", and an
 * email check that borrowed the phone number model's confidence would be
 * asserting precision it does not have.
 */
function renderEmail(r) {
  const pills = (r.tags ?? []).map(t =>
    `<span class="pill ${esc(t.tone)}">${esc(t.label)}</span>`).join('')
  /**
   * `evRow`, THE SAME ROW THE CARD ABOVE USES, and this had its own.
   *
   * The private one printed the sentence and nothing else, which lost both
   * halves of what `evRow` exists for. The citation is the loud half: this
   * card's strongest findings are quotations from a named organisation's own
   * published page — *ANZ publishes that in a genuine message it will never…*
   * — and a stranger was asked to take them on our word, on the one surface
   * whose generator opens by saying every line carries the URL it came from.
   *
   * The direction is the quiet half and it is the one that misleads. Both
   * domain findings are one sentence about a sender address, and *the address
   * ends in a domain NAB publishes as its own* and *it came from a domain that
   * is not one we hold for them* rendered as identical grey paragraphs. The
   * pills carry tone and the findings did not, so reassurance and warning sat
   * in the same column in the same colour.
   */
  const ev = (r.signals ?? []).slice(0, SIGNALS_SHOWN).map(evRow).join('')
  const acts = (r.actions ?? []).map(x =>
    `<a class="act" href="tel:${esc(x.e164)}"><b>${esc(x.display)}</b><span>${esc(x.organisation)} — ${esc(x.label)}</span></a>`).join('')
  const sendTo = (r.reportTo ?? []).map(x =>
    `<a class="act send" href="mailto:${esc(x.address)}"><b>${esc(x.address)}</b><span>Forward the email here</span></a>`).join('')
  const own = r.alertsPage
    ? `<a class="act own" href="${esc(r.alertsPage.url)}" rel="noopener"><b>${esc(r.alertsPage.organisation)}&rsquo;s own scam page</b><span>What they are warning about right now</span></a>`
    : ''
  /**
   * WHAT TO DO, WHICH THIS CARD HAD NO LINE FOR — the same block the number
   * card renders, in the same position and under the same heading, because two
   * cards putting one thing in two places is the second copy of a decision this
   * page keeps shipping defects from.
   *
   * The core composes it (`emailGuidance`); this renders it whole. Not folded,
   * for `render`'s reason directly above: item 12 bought this position for the
   * part a frightened person can act on, and an instruction behind a click is
   * an instruction not followed.
   */
  const g = (r.guidance ?? []).map(x => `<li>${esc(x)}</li>`).join('')
  /**
   * COUNT THE RISKS, NOT THE FINDINGS. A genuine email from a declared domain
   * raises one finding and it is reassurance — and the first version headed
   * that "one thing stood out in this email", which reads as a warning about a
   * message we had just confirmed came from the right place.
   */
  const risks = (r.signals ?? []).filter(s => s.direction === 'risk').length
  const trusts = (r.signals ?? []).length - risks
  const headline = risks
    ? (risks === 1 ? 'One thing stood out in this email.' : risks + ' things stood out in this email.')
    : trusts
      ? 'Nothing stood out, and what we could check came back in its favour.'
      : 'Nothing in the visible text stood out.'
  showAnswer(`<div class="verdict">
    <span class="band b-insufficient-evidence">no score for an email</span>
    <h3>${headline}</h3>
    <p class="fine">There is no score here on purpose. Cooee scores phone numbers, using the numbering plan and what has been reported about them; an email address has neither, so a number would be invented.</p>
    ${pills ? `<div class="pills">${pills}</div>` : ''}
    <div class="tools"><button type="button" class="speak" id="lspeak" hidden>Read this out</button><button type="button" class="share" id="lshare" hidden>Send to someone</button></div>
    ${acts ? `<span class="lab">Who to ring</span><div class="acts">${acts}</div>` : ''}
    ${sendTo ? `<span class="lab">Where to send it</span><div class="acts">${sendTo}</div>` : ''}
    ${own ? `<div class="acts">${own}</div>` : ''}
    ${g ? `<span class="lab">What to do</span><ul class="guide">${g}</ul>` : ''}
    ${ev ? `<span class="lab">What we found</span>${ev}` : ''}
    ${(r.caveats ?? []).map(c => `<p class="fine">${esc(c)}</p>`).join('')}
  </div>`, r)
}

$('#lf').addEventListener('submit', (e) => {
  e.preventDefault()
  // The mark is a call going out and an answer coming back, so it answers when
  // you call. Behind prefers-reduced-motion in the stylesheet.
  document.body.classList.remove('listening')
  void document.body.offsetWidth
  document.body.classList.add('listening')
  const emailMode = location.hash === '#email'
  const q = $('#lq').value.trim()
  /**
   * An email has no phone number, so the number box is not the gate for it.
   * The gate is having something to read: the message, or an address.
   */
  if (emailMode) {
    const body = $('#ltext').value.trim()
    const from = $('#lfrom') ? $('#lfrom').value.trim() : ''
    if (!body && !from) return
    renderEmail(checkEmail({ text: body || undefined, from: from || undefined,
                             claimedOrgName: $('#lorg').value.trim() || undefined }))
    return
  }
  if (!q) return
  /**
   * Asking a question means leaving the LIST you were reading. Otherwise the
   * answer renders above an open library section and the page shows both.
   *
   * ASK THE ROUTER WHETHER THIS HASH IS A LIST, rather than treating every hash
   * as one. It was written when the only hashes were library views, and the
   * four front doors are hashes too — `#stolen` and `#protect` are views and
   * should still be left, but `#text` and `#email` are not, and clearing one
   * of those put the headline, the wire and the four doors back ABOVE the
   * answer, milliseconds after the scroll that had just brought it into view.
   * Measured on a 390x800 phone: the reader ended up looking at the front page
   * with their answer fifty pixels below the fold. The router already decides
   * this and records it on the body, so there is nothing here to re-derive —
   * the alternative is a list of door names, which is the copy that goes stale
   * the day a fifth door is added.
   */
  if (document.body.classList.contains('viewing')) location.hash = ''
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

/* ---------------------------------------------------------------------------
 * The four front doors.
 *
 * The page answers one question well and people arrive with four. Two of them
 * are checks and route into the form with it already set up; two are not
 * checks at all and are views, so they reuse the library router rather than
 * inventing a second one.
 *
 * The doors are ordinary links to hashes. That means they work before this
 * script runs, they can be sent to somebody, and the back button leaves a door
 * rather than the site — the same three reasons the library is routed on the
 * hash.
 * ------------------------------------------------------------------------- */
;(function frontDoors() {
  const doors = document.getElementById('ldoors')
  const form = document.getElementById('lf')
  if (!doors || !form) return
  const opts = document.querySelector('details.opts')
  const q = document.getElementById('lq')
  const sms = document.getElementById('lsms')
  const text = document.getElementById('ltext')
  const fromWrap = document.getElementById('lfromwrap')
  const from = document.getElementById('lfrom')

  function setDoor(which) {
    const asked = which === 'text' || which === 'email'
    document.body.classList.toggle('asked', asked)
    for (const a of doors.querySelectorAll('.door')) {
      a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + which))
    }
    if (!asked) {
      if (fromWrap) fromWrap.hidden = true
      return
    }
    if (opts) opts.open = true
    // An email has an address and no phone number; a text has both and the
    // number is what the rest of the product is about.
    if (fromWrap) fromWrap.hidden = which !== 'email'
    if (which === 'text') {
      if (sms) sms.checked = true
      if (q) { q.placeholder = 'Who did it show as? e.g. NAB, Unverified, 0412…'; q.focus() }
      if (text) text.placeholder = 'Paste the text here — it is read on this page and never sent anywhere'
    } else {
      if (sms) sms.checked = false
      if (q) q.placeholder = 'Leave blank for an email, or type the sender name'
      if (text) text.placeholder = 'Paste the email here — it is read on this page and never sent anywhere'
      if (from) from.focus()
    }
  }

  window.addEventListener('hashchange', function () {
    setDoor((location.hash || '').replace(/^#/, ''))
  })
  setDoor((location.hash || '').replace(/^#/, ''))
})()

/* ---------------------------------------------------------------------------
 * The ticker, which is not a marquee.
 *
 * People arrive here frightened and a good many of them are old. Text that
 * slides past is hard to read for exactly the people this page is for, so
 * nothing moves: every item is in the HTML at load, the first of each row shows
 * at rest, and this swaps which one is visible every few seconds.
 *
 * It stops on hover and on keyboard focus, because reading a line that changes
 * under you is the whole complaint about tickers. It never starts at all under
 * prefers-reduced-motion, and without this script the page is two dated lines,
 * which is most of the value.
 * ------------------------------------------------------------------------- */
;(function ticker() {
  const el = document.getElementById('lticker')
  if (!el) return
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)')
  if (still && still.matches) return

  const rows = Array.prototype.slice.call(el.querySelectorAll('.trow')).map(function (row) {
    return {
      items: Array.prototype.slice.call(row.querySelectorAll('.titem')),
      dots: Array.prototype.slice.call(row.querySelectorAll('.tdots i')),
      at: 0,
    }
  }).filter(function (r) { return r.items.length > 1 })
  if (!rows.length) return

  let held = false
  const hold = function () { held = true }
  const release = function () { held = false }
  el.addEventListener('mouseenter', hold)
  el.addEventListener('mouseleave', release)
  el.addEventListener('focusin', hold)
  el.addEventListener('focusout', release)

  setInterval(function () {
    // Not while somebody is reading it, and not while the tab is in the
    // background — advancing unseen only means they come back to item four.
    if (held || document.hidden) return
    for (const r of rows) {
      r.items[r.at].classList.remove('on')
      if (r.dots[r.at]) r.dots[r.at].classList.remove('on')
      r.at = (r.at + 1) % r.items.length
      r.items[r.at].classList.add('on')
      // The dots say how many there are and where you are in them, which is
      // the thing a rotating panel otherwise hides.
      if (r.dots[r.at]) r.dots[r.at].classList.add('on')
    }
  }, 5000)
})()

/* ---------------------------------------------------------------------------
 * The offline copy, and saying so.
 *
 * Registering the worker is three lines. The part worth writing down is the
 * banner: a cached page looks exactly like a live one, and this page's value
 * is that its numbers were checked against organisations' own pages. Somebody
 * reading a three-week-old copy in a black spot should be told, because the
 * one thing that could have changed underneath them is the number they are
 * about to ring.
 *
 * `navigator.onLine` is famously optimistic — it reports a connection that may
 * go nowhere — so it is used only in the direction it is reliable: false
 * really does mean no network. True is not treated as proof of anything.
 * ------------------------------------------------------------------------- */
;(function offline() {
  if ('serviceWorker' in navigator) {
    // After load: the worker is for the next visit, and registering during
    // load competes with fetching the thing the reader is waiting for.
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {
        // No worker means no offline copy, which is a smaller product rather
        // than a broken one. Nothing here depends on it.
      })
    })
  }
  const note = document.getElementById('loffline')
  if (!note) return
  /**
   * `onLine` MAY RAISE THIS AND MAY NEVER LOWER IT.
   *
   * It was `note.hidden = navigator.onLine !== false`, run once at start and on
   * every connectivity event — which reads as the careful use of `onLine` the
   * comment above describes, and is not. `onLine` answers whether there is a
   * network. The banner's question is whether this page came from the cache,
   * and only the worker knows that: it marks the document `data-cached` when it
   * falls back, which is the case `onLine` cannot see, because a fetch that
   * times out on one bar happens with `onLine` perfectly true.
   *
   * So the worker's mark wins outright. Coming back online does not make a
   * saved copy fresh — the page in front of the reader is still the one their
   * phone kept, and hiding the banner the moment a bar reappears would take the
   * warning away without changing a single number on the screen. A reload
   * fetches the live page and the mark is simply not there.
   */
  const fromCache = function () { return note.hasAttribute('data-cached') }
  const paint = function () { note.hidden = !fromCache() && navigator.onLine !== false }
  window.addEventListener('online', paint)
  window.addEventListener('offline', paint)
  paint()
})()

/* ---------------------------------------------------------------------------
 * Read the answer out.
 *
 * The people losing the most money to scams are the oldest, and they are the
 * ones squinting at a phone held at arm's length while somebody talks at them
 * down the line. Speech synthesis is in every browser, costs nothing, and
 * sends nothing anywhere — it is the largest accessibility win available here
 * for the least code.
 *
 * IT READS THE ANSWER AND WHAT TO DO, NOT THE EVIDENCE. Spoken aloud, the
 * findings run to a minute and a half, and a minute and a half is longer than
 * anybody stays on a page while a scammer is waiting. The verdict, the plain
 * sentence, and the steps: that is the part somebody needs in their ear.
 *
 * A second use, and possibly the better one — it lets somebody hold the phone
 * up to a relative on speaker and say "listen to this". That is a conversation
 * this page could not previously start.
 * ------------------------------------------------------------------------- */
;(function speakAnswer() {
  const synth = window.speechSynthesis
  // Rendered hidden and unhidden here, so a browser without speech never shows
  // a button that does nothing.
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return

  let speaking = false

  const textOf = () => {
    const out = $('#lout')
    if (!out) return ''
    const bits = []
    const band = out.querySelector('.band')
    const ctx = out.querySelector('.rctx')
    const head = out.querySelector('h3')
    const plain = out.querySelector('.rplain')
    if (band) bits.push(band.textContent.trim() + '.')
    /**
     * WHICH QUESTION THIS ANSWERED, AND IT WAS THE ONE LINE THIS SURFACE LEFT
     * OUT.
     *
     * `.rctx` was added to the card because this page passes no context and
     * every result is therefore read as a call the number made to you — the
     * reading that produces the strongest claim in the product. The comment
     * beside it says why in as many words: a reader who was HANDED this number
     * to ring got that verdict with nothing on the screen saying what had been
     * assumed, and *saying so is the half that is ours*.
     *
     * Read aloud, the half that is ours went missing and the conviction stayed.
     * Driven in Chromium: the card shows *Caller ID forged* / *read as a call
     * you received* / *This caller ID is forged. That is a fact about the
     * number, not an estimate*, and the spoken answer was the first and third
     * with the second silently gone. On the surface built for somebody who
     * CANNOT READ THE SCREEN — and for the relative listening across the room
     * on speaker, who cannot see it at all — that is the qualification removed
     * from precisely the reader who has nothing else to read it in.
     *
     * Spoken in its screen order, in the core's own words. A second wording
     * composed here is how six defects shipped on this page.
     */
    if (ctx) {
      // Lifted for the sentence it now starts, exactly as `messageSignals` lifts
      // an organisation name: `contextLabel` is worded to sit under the band as
      // a caption and is stored that way, and here it opens.
      const c = ctx.textContent.trim()
      bits.push(c.charAt(0).toUpperCase() + c.slice(1) + '.')
    }
    if (head) bits.push(head.textContent.trim())
    if (plain) bits.push(plain.textContent.trim())
    /**
     * THE GUIDANCE LIST, BY NAME. Reading every list on the card swept up the
     * caveats as well and turned a thirteen-second answer into three minutes —
     * longer than anybody stands on a page with a scammer waiting, which is
     * the same as not reading it at all. The guidance carries a class for that
     * reason; a selector that matches "any list" matches whatever gets added
     * next, too.
     */
    const steps = [...out.querySelectorAll('ul.guide li')].map((li) => li.textContent.trim())
    /**
     * THE FIRST THREE, AND HOW MANY REMAIN.
     *
     * All of them ran to ninety seconds, and on the worst cases past two
     * minutes. Nobody stands still for two minutes of audio with a scammer on
     * the other line — an answer that long is the same as no answer. The
     * guidance is already ordered by urgency, so the top of it is the part
     * that matters in the moment, and the rest is on the screen where it can
     * be read at leisure. Saying how many were left out is the difference
     * between summarising and quietly truncating.
     */
    const SPOKEN_STEPS = 3
    if (steps.length) {
      const said = steps.slice(0, SPOKEN_STEPS)
      const left = steps.length - said.length
      bits.push('What to do. ' + said.join(' ') +
        (left ? ` There ${left === 1 ? 'is one more step' : `are ${left} more steps`} on the screen.` : ''))
    }
    /**
     * WHAT THE CARD FOUND, ON A CARD WHERE NOTHING ELSE IS CARRYING THE ANSWER.
     *
     * THE EMAIL CARD SPOKE TWO FRAGMENTS AND STOPPED. Driven in Chromium
     * against the built bundle, a spoofed NAB address and its message: the
     * screen showed three findings, three fraud numbers and the caveat, and the
     * whole spoken answer was *"no score for an email. 3 things stood out in
     * this email."* — the alarm, and not one word of what stood out, who to
     * ring, or what the check could not see. On the reassuring result it is
     * worse and it runs the other way: *"Nothing stood out, and what we could
     * check came back in its favour."*, full stop, with `EMAIL_CAVEAT` — *a
     * clean result here means nothing in the visible text stood out, not that
     * the email is genuine* — the qualifier that keeps that sentence honest,
     * silently dropped. A spoken all-clear, to the one reader who has nothing
     * else to read it in.
     *
     * THE SELECTORS WERE WRITTEN FOR THE OTHER CARD. `.rctx`, `.rplain` and
     * `ul.guide` are the number card's shape; an email answer has none of the
     * three by design, because it carries no band and no score, so it fell
     * through this function and out the far side with the band chip and the
     * headline. That is this file's recorded lesson about a second renderer
     * arriving — except the second renderer here is not the one that is wrong,
     * the READING is, and it certified itself by finding everything it knew to
     * look for.
     *
     * SO THE GATE IS THE CARD'S CONTENT, NOT ITS NAME. A card that states a
     * verdict in a sentence has already said what it found and the findings
     * underneath run past a minute and a half — that is the number card, and
     * its answer is unchanged. A card without one has nothing else, so its
     * findings ARE its answer and its notes are the only thing qualifying
     * them. A third renderer without one is covered without being named, which
     * is the point: the renderer that had this bug predates any list that could
     * have named it.
     *
     * AND THE GATE READ `!plain && !steps.length` UNTIL THE EMAIL CARD GAINED
     * STEPS, WHICH WOULD HAVE SILENTLY PUT THIS DEFECT BACK. The second half
     * was written when guidance and a plain verdict arrived together on the one
     * card that had either, so it looked like the same question asked twice.
     * It is not: guidance says what to DO and the property here is whether the
     * card has said what it FOUND. The day this answer was given instructions —
     * which it had none of, and that was the defect above it in this file — a
     * card whose findings are its whole answer would have stopped speaking them
     * because it had learned to say "report it to Scamwatch".
     *
     * The recorded shape, and it is worth naming: a rule can be right while its
     * MECHANISM is wider than it, and it turns into a defect the day something
     * else moves into the space the mechanism reached. `plain` alone is the
     * property — a verdict stated in a sentence — and it is what the paragraph
     * above was always describing.
     */
    if (!plain) {
      /**
       * `.evs`, not `.ev`: the row's text content carries the citation, and a
       * source name, a kind and "observed 3 days ago" after every sentence is
       * the noise that made reading the whole card useless in the first place.
       * The direction word opens it — *Concern*, *In its favour* — because a
       * finding without it is the eightieth bug on this same card, where
       * reassurance and warning arrived as the same grey paragraph.
       */
      const found = [...out.querySelectorAll('.ev')].map((p) => {
        const dir = p.querySelector('b')
        const s = p.querySelector('.evs')
        return (dir ? dir.textContent.trim() + '. ' : '') + (s ? s.textContent.trim() : '')
      }).filter((t) => t.trim())
      const SPOKEN_FINDINGS = 2
      if (found.length) {
        const said = found.slice(0, SPOKEN_FINDINGS)
        const left = found.length - said.length
        bits.push('What we found. ' + said.join(' ') +
          (left ? ` There ${left === 1 ? 'is one more finding' : `are ${left} more findings`} on the screen.` : ''))
      }
      /**
       * And the notes, which on this card are the only qualification there is.
       * Not capped: there is one, it is `EMAIL_CAVEAT`, and it is the sentence
       * that stops "nothing stood out" being heard as "this is genuine".
       */
      for (const f of [...out.querySelectorAll('.fine')]) {
        const t = f.textContent.trim()
        if (t) bits.push(t)
      }
    }
    return bits.join(' ')
  }

  const stop = () => {
    synth.cancel()
    speaking = false
    const b = $('#lspeak')
    if (b) b.textContent = 'Read this out'
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('#lspeak')
    if (!b) return
    if (speaking) { stop(); return }
    const text = textOf()
    if (!text) return
    const say = new SpeechSynthesisUtterance(text)
    say.lang = 'en-AU'
    // Slower than default. This is being read to somebody who is frightened,
    // and possibly to somebody across the room on speaker.
    say.rate = 0.92
    say.onend = stop
    say.onerror = stop
    synth.cancel()
    synth.speak(say)
    speaking = true
    b.textContent = 'Stop reading'
  })

  // A new answer must never be read over the top of the last one.
  const out = $('#lout')
  if (out) {
    new MutationObserver(() => {
      stop()
      const b = $('#lspeak')
      if (b) b.hidden = false
    }).observe(out, { childList: true })
  }
})()

/* ---------------------------------------------------------------------------
 * Send the answer to someone.
 *
 * The person doing the checking is frequently not the person being scammed.
 * Right now an adult child who works out that the call is fake has to retype
 * the answer into a text message, which is friction at the exact moment it
 * matters. It is also the only growth loop in the plan that is not advertising.
 *
 * WHAT IT MAY CARRY IS A CLOSED LIST, AND THAT IS ENFORCED HERE RATHER THAN
 * REMEMBERED. The verdict, the number that was checked, and the organisation's
 * own published number to ring. Never the pasted message: a scam text contains
 * the reader's name, an account fragment, a family circumstance, a delivery
 * address — and this page's promise is that what they type does not leave the
 * device. A share sheet is leaving the device. `shareable()` therefore builds
 * its text from named fields and cannot reach the message at all, and a test
 * feeds it a card built from a message full of personal detail and asserts
 * that none of it comes out.
 * ------------------------------------------------------------------------- */
function shareable(a) {
  const lines = []
  /**
   * The number as the reader typed it, not as E.164.
   *
   * "+61412345678" is not a thing anybody reads back to a parent without
   * transposing a digit, and this text exists to be read aloud down a phone.
   * `input` is what they saw on their own screen; the canonical form is a
   * fallback for the rare case it is missing.
   */
  const shown = a.number && (a.number.input || a.number.e164)
  lines.push('Cooee checked this' + (shown ? ': ' + shown : '') + '.')
  if (a.headline) lines.push(a.headline)
  if (a.plain && a.plain !== a.headline) lines.push(a.plain)
  const ring = (a.actions || [])[0]
  if (ring) lines.push(`Their real number is ${ring.display} (${ring.organisation}, ${ring.label}) — look it up rather than using one you were given.`)
  lines.push('Checked at ' + location.origin + location.pathname)
  return lines.join('\n\n')
}

;(function shareAnswer() {
  let last = null
  // The renderer hands the assessment over here rather than the share code
  // reading the DOM back: reading the card would pick up whatever is on it,
  // and what is on it includes the message they pasted.
  window.__cooeeShare = function (a) { last = a }

  document.addEventListener('click', async (e) => {
    const b = e.target.closest && e.target.closest('#lshare')
    if (!b || !last) return
    const text = shareable(last)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cooee — is this a scam?', text })
        return
      }
      await navigator.clipboard.writeText(text)
      b.textContent = 'Copied — paste it to them'
      setTimeout(() => { b.textContent = 'Send to someone' }, 2600)
    } catch {
      // A cancelled share sheet throws, and so does a clipboard the browser
      // will not give us. Neither is an error worth showing somebody.
    }
  })

  const out = $('#lout')
  if (!out) return
  new MutationObserver(() => {
    const b = $('#lshare')
    if (b && last) b.hidden = false
  }).observe(out, { childList: true })
})()

/* ---------------------------------------------------------------------------
 * A message shared in from somewhere else.
 *
 * On Android the manifest registers Cooee as a share target, so long-pressing
 * a scam text and hitting Share drops it here as a query string. That removes
 * the single biggest drop-off there is: pasting. Several of the people this is
 * built for cannot reliably select text on a phone at all.
 *
 * THE SHARED TEXT IS PUT IN THE BOX AND THE URL IS THEN CLEANED. Leaving a
 * scam message sitting in the address bar means it lands in history, in the
 * tab title, and in whatever the browser syncs — none of which is on the
 * device only, which is what this page promises. `replaceState` puts the
 * address back to the plain page before anything else happens.
 *
 * Nothing is submitted automatically. The reader may want to name the
 * organisation first, and a page that answers before being asked has decided
 * something on their behalf.
 * ------------------------------------------------------------------------- */
;(function sharedIn() {
  const q = new URLSearchParams(location.search)
  const shared = [q.get('title'), q.get('text'), q.get('url')].filter(Boolean).join(' ').trim()
  if (!shared) return

  const clean = location.pathname + (location.hash || '')
  history.replaceState(null, '', clean)

  const box = $('#ltext')
  const opts = document.querySelector('details.opts')
  if (!box) return
  box.value = shared
  if (opts) opts.open = true
  const sms = $('#lsms')
  if (sms) sms.checked = true
  // The question is now "who did it say it was from?", so put them there.
  const org = $('#lorg')
  if (org) org.focus()
})()

/* ---------------------------------------------------------------------------
 * The wallet card.
 *
 * Tick the organisations you use; the card fills in and prints at 85mm, the
 * width of a bank card, so it sits behind one where it will actually be found.
 *
 * The numbers come from the page rather than from a second copy of the
 * registry: each checkbox already carries the organisation, and the numbers
 * beside it are the ones `publishedForDialling` allowed onto this page. A card
 * is a worse place than a screen to print a number an organisation has
 * disowned, because nobody can withdraw a piece of card from a wallet.
 *
 * The choice is remembered on the device, because somebody who prints this in
 * March and reprints it in September should not have to remember which four
 * they picked.
 * ------------------------------------------------------------------------- */
;(function walletCard() {
  const list = $('#lwlist')
  const picks = [...document.querySelectorAll('.cardbox')]
  if (!list || !picks.length) return
  const KEY = 'cooee:card'

  const numbersFor = (box) => {
    const lines = [...box.closest('.cardpick').querySelectorAll('i')].map((i) => i.textContent)
    return lines.map((line) => {
      const [num, ...rest] = line.split('·')
      return { num: num.trim(), what: rest.join('·').trim() }
    })
  }

  const paint = () => {
    const chosen = picks.filter((b) => b.checked)
    if (!chosen.length) {
      list.innerHTML = '<li class="wempty">Tick some organisations above and they will appear here.</li>'
      return
    }
    list.innerHTML = chosen.flatMap((b) => numbersFor(b).slice(0, 1).map((n) =>
      `<li><b>${esc(b.value)}</b><span>${esc(n.num)}</span></li>`)).join('')
  }

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
    for (const b of picks) if (saved.includes(b.value)) b.checked = true
  } catch { /* a fresh device, a private window, or storage refused */ }

  for (const b of picks) {
    b.addEventListener('change', () => {
      paint()
      try {
        localStorage.setItem(KEY, JSON.stringify(picks.filter((x) => x.checked).map((x) => x.value)))
      } catch { /* not worth an error to the reader */ }
    })
  }
  const print = $('#lprint')
  if (print) print.addEventListener('click', () => window.print())
  paint()
})()
