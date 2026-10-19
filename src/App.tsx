import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  inQuadrant,
  lastPlaced,
  nextUnplaced,
  place,
  statusLine,
  unplace,
  verdict,
  verdictLine,
} from './placement.ts'
import { CheckCircle, Swap, TONE_ICON } from './icons.tsx'
import PS5 from './PS5.tsx'
import { COLUMNS, GROUP_MEMBERS, QUADRANTS, ROWS, TASKS, TONES, type QuadrantId } from './tasks.ts'

const FLIGHT_MS = 560
// Apple-style spring: the card overshoots its spot a touch and settles back.
const SPRING = 'cubic-bezier(.3, 1.35, .5, 1)'
const GLOW_MS = 900
const SHOW_ALL_STEP_MS = 150

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [placed, setPlaced] = useState<string[]>([])
  const [shown, setShown] = useState<string | null>(null)
  // A card lifted out of the tray, waiting for the presenter to click the quadrant the class called.
  const [pending, setPending] = useState<string | null>(null)
  // The class's call for each placed card, when one was recorded.
  const [guesses, setGuesses] = useState<Record<string, QuadrantId>>({})

  // Mirrors so timers and key handlers never read a stale value.
  const placedRef = useRef<string[]>([])
  placedRef.current = placed
  const pendingRef = useRef<string | null>(null)
  pendingRef.current = pending
  const [fullScreen, setFullScreen] = useState(false)
  // Light by default; D switches to the dark theme for a dim room. Never follows the OS setting.
  const [dark, setDark] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  // The element currently showing each card (tray chip or map chip), and each quadrant.
  const cardEls = useRef(new Map<string, HTMLElement>())
  const quadEls = useRef(new Map<QuadrantId, HTMLElement>())
  // Cards that have just moved: where they were on screen before the move.
  const flights = useRef(new Map<string, { from: DOMRect; glow?: QuadrantId; hadFocus: boolean }>())
  const timers = useRef<number[]>([])

  const cardRef = (id: string) => (el: HTMLElement | null) => {
    if (el) cardEls.current.set(id, el)
    else if (cardEls.current.get(id)?.isConnected === false) cardEls.current.delete(id)
  }

  const recordFlight = (id: string, glow?: QuadrantId) => {
    const el = cardEls.current.get(id)
    const active = document.activeElement
    // A quadrant's pick button vanishes once the card lands, so focus follows the card instead.
    const hadFocus = !!el?.contains(active) || !!active?.classList.contains('quad-pick')
    if (el) flights.current.set(id, { from: el.getBoundingClientRect(), glow, hadFocus })
  }

  // FLIP: after React moves a card, start it where it was and glide it home.
  useLayoutEffect(() => {
    if (flights.current.size === 0) return
    const animate = !reducedMotion()
    for (const [id, { from, glow, hadFocus }] of flights.current) {
      const el = cardEls.current.get(id)
      // Keyboard users keep their place: after placing, focus the next tray card;
      // after sending a card back, focus it in the tray.
      if (hadFocus) {
        const next = glow && nextUnplaced(placedRef.current, TASKS)
        ;(next ? cardEls.current.get(next.id) : el)?.focus()
      }
      if (el && animate) {
        const to = el.getBoundingClientRect()
        const dx = from.left - to.left
        const dy = from.top - to.top
        // Position springs; size lifts a little mid-flight and settles; the shadow fades as it lands.
        el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], {
          duration: FLIGHT_MS,
          easing: SPRING,
        })
        el.animate([{ scale: 1 }, { scale: 1.06, offset: 0.35 }, { scale: 1 }], {
          duration: FLIGHT_MS,
          easing: 'ease-in-out',
        })
        el.animate(
          [
            { boxShadow: '0 12px 30px rgba(0,0,0,.18)' },
            { boxShadow: '0 0 0 rgba(0,0,0,0)' },
          ],
          { duration: FLIGHT_MS, easing: 'ease-out' },
        )
      }
      const q = glow && quadEls.current.get(glow)
      if (q && animate) {
        const c = getComputedStyle(q).getPropertyValue('--glow').trim()
        q.animate(
          [
            { boxShadow: `0 0 0 0 ${c}` },
            { boxShadow: `0 0 0 6px ${c}`, offset: 0.35 },
            { boxShadow: `0 0 0 0 ${c}` },
          ],
          { duration: GLOW_MS, delay: FLIGHT_MS * 0.6, easing: 'ease-out' },
        )
      }
    }
    flights.current.clear()
  }, [placed])

  const placeCard = useCallback((id: string, guess?: QuadrantId) => {
    if (placedRef.current.includes(id)) return
    const task = TASKS.find((t) => t.id === id)
    if (!task) return
    recordFlight(id, task.quadrant)
    placedRef.current = place(placedRef.current, id)
    setPlaced(placedRef.current)
    setGuesses((g) => {
      const { [id]: _old, ...rest } = g
      return guess ? { ...rest, [id]: guess } : rest
    })
    setPending((p) => (p === id ? null : p))
    setShown(id)
  }, [])

  // First click lifts a tray card; a second click on the same card reveals it without a call.
  const pickCard = (id: string) => {
    if (pendingRef.current === id) placeCard(id)
    else setPending(id)
  }

  const returnCard = useCallback((id: string) => {
    if (!placedRef.current.includes(id)) return
    recordFlight(id)
    placedRef.current = unplace(placedRef.current, id)
    setPlaced(placedRef.current)
    setGuesses(({ [id]: _old, ...rest }) => rest)
    // If its reason was showing, show the card placed before it instead.
    setShown((s) => (s === id ? (lastPlaced(placedRef.current) ?? null) : s))
  }, [])

  const cancelTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const showAll = () => {
    cancelTimers()
    setPending(null)
    const remaining = TASKS.filter((t) => !placedRef.current.includes(t.id))
    remaining.forEach((t, i) => {
      timers.current.push(window.setTimeout(() => placeCard(t.id), i * SHOW_ALL_STEP_MS))
    })
  }

  const clearAll = () => {
    cancelTimers()
    placedRef.current.forEach((id) => recordFlight(id))
    placedRef.current = []
    setPlaced([])
    setShown(null)
    setPending(null)
    setGuesses({})
  }

  useEffect(() => cancelTimers, [])

  // F toggles full screen; the footer hint hides itself while full screen is on.
  useEffect(() => {
    const sync = () => setFullScreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  // Presentation clickers send these keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen()
        return
      }
      if (e.key === 'd' || e.key === 'D') {
        setDark((d) => !d)
        return
      }
      if (e.key === 'Escape' && pendingRef.current) {
        setPending(null)
        return
      }
      const forward = ['ArrowRight', 'ArrowDown', 'PageDown', ' ']
      const back = ['ArrowLeft', 'ArrowUp', 'PageUp']
      if (!forward.includes(e.key) && !back.includes(e.key)) return
      // Space on a focused button should press that button, as normal.
      if (e.key === ' ' && e.target instanceof HTMLButtonElement) return
      e.preventDefault()
      // A clicker cannot point at a quadrant, so it reveals cards without a call.
      const lifted = pendingRef.current
      if (forward.includes(e.key)) {
        const next = lifted ?? nextUnplaced(placedRef.current, TASKS)?.id
        if (next) placeCard(next)
      } else if (lifted) {
        setPending(null)
      } else {
        const last = lastPlaced(placedRef.current)
        if (last) returnCard(last)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [placeCard, returnCard])

  const quadName = (id: string | undefined) => QUADRANTS.find((q) => q.id === id)?.name
  const shownTask = TASKS.find((t) => t.id === shown)
  const pendingTask = TASKS.find((t) => t.id === pending)
  const shownVerdict = shownTask ? verdict(guesses[shownTask.id], shownTask.quadrant) : 'none'
  // The reason bar takes the colour of the quadrant the card landed in; crimson while a card waits.
  const reasonTone = pendingTask
    ? 'pending'
    : (QUADRANTS.find((q) => q.id === shownTask?.quadrant)?.tone ?? 'idle')

  return (
    <>
      <div className="stage">
        <main className="slide">
          {!fullScreen && (
            <span className="fs-hint">
              {canFullScreen && 'Press F for full screen · '}D for {dark ? 'light' : 'dark'}
            </span>
          )}
          <header className="head">
            <p className="kicker">Place a task · Your turn</p>
            <h1 className="title">Where would you place each of these tasks, and who should lead it?</h1>
            {/* Once every card is down, the instruction has done its job and the slide hands the room a question. */}
            {placed.length === TASKS.length ? (
              <p className="subtitle subtitle-closing" aria-live="polite">
                All six are placed. Which one would you move, and why?
              </p>
            ) : (
              <p className="subtitle">
                Call the quadrant for each task before we click. The placements are our group's view, and you
                may well place some differently.
              </p>
            )}
          </header>

          <section className="panel" aria-label="Map of human-AI collaboration">
            <header className="panel-head">
              <span className="badge">Human-AI Group 8</span>
              <ul className="legend" aria-label="Colour key">
                {(['pink', 'blue'] as const).map((tone) => {
                  const Icon = TONE_ICON[tone]
                  return (
                    <li key={tone} className={`legend-${tone}`}>
                      <Icon className="tone-icon" />
                      {TONES[tone]}
                    </li>
                  )
                })}
              </ul>
              {/* Progress as page dots, like the iPhone home screen. Each dot fills in the colour of the
                  quadrant its card landed in; screen readers get the words instead. */}
              <span className="status">
                <span className="dots" aria-hidden="true">
                  {TASKS.map((_, i) => {
                    const id = placed[i]
                    const tone = id && QUADRANTS.find((q) => q.id === TASKS.find((t) => t.id === id)?.quadrant)?.tone
                    return <span key={i} className={`dot${tone ? ` dot-${tone}` : ''}`} />
                  })}
                </span>
                <span className="sr-only" aria-live="polite">
                  {statusLine(placed.length, TASKS.length)}
                </span>
              </span>
            </header>

            <div className="map">
              <span className="corner" aria-hidden="true" />
              <h2 className="col-head">{COLUMNS['right-answer']}</h2>
              <h2 className="col-head">{COLUMNS['no-single-answer']}</h2>
              {(['together', 'alone'] as const).map((row) => (
                <Row key={row} row={row}>
                  {QUADRANTS.filter((q) => q.row === row).map((q) => (
                    <div
                      key={q.id}
                      className={`quad quad-${q.tone}${pendingTask ? ' quad-open' : ''}`}
                      ref={(el) => {
                        if (el) quadEls.current.set(q.id, el)
                      }}
                    >
                      <h3 className="quad-name">
                        {(() => {
                          const Icon = TONE_ICON[q.tone]
                          return <Icon className="tone-icon" />
                        })()}
                        {q.name}
                      </h3>
                      {pendingTask && (
                        <button
                          className="quad-pick"
                          onClick={() => placeCard(pendingTask.id, q.id)}
                          aria-label={`The class called ${q.name}`}
                        />
                      )}
                      <div className="quad-cards">
                        {inQuadrant(placed, TASKS, q.id).map((t) => (
                          <span key={t.id} ref={cardRef(t.id)} className="placed">
                            <button
                              className={`card card-placed${t.id === shown ? ' card-current' : ''}`}
                              onClick={() => setShown(t.id)}
                              aria-pressed={t.id === shown}
                            >
                              {t.label}
                            </button>
                            <button
                              className="card-x"
                              onClick={() => returnCard(t.id)}
                              aria-label={`Send ${t.label} back to the tray`}
                              title="Send back to the tray"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </Row>
              ))}
            </div>

            <div className={`reason reason-${reasonTone}`} aria-live="polite">
              {pendingTask ? (
                <p>
                  Where does the class put <strong>{pendingTask.label}</strong>? Click that quadrant, or click
                  the card again to reveal without a call.
                </p>
              ) : shownTask ? (
                // Two levels, as on apple.com: a small line with the task and verdict, the reason larger below.
                <div className="reason-body">
                  <p className="reason-top">
                    <strong>{shownTask.label}</strong>
                    <span className="reason-sep" aria-hidden="true">
                      ·
                    </span>
                    <span className={`verdict verdict-${shownVerdict}`}>
                      {shownVerdict === 'agree' && <CheckCircle className="verdict-icon" />}
                      {shownVerdict === 'differ' && <Swap className="verdict-icon" />}
                      {verdictLine(quadName(guesses[shownTask.id]), quadName(shownTask.quadrant) ?? '')}
                    </span>
                  </p>
                  <p className="reason-text">{shownTask.reason}</p>
                </div>
              ) : (
                <p className="reason-start">Pick a task below to start.</p>
              )}
            </div>

            <div className="tray">
              {TASKS.map((t) =>
                placed.includes(t.id) ? (
                  <span key={t.id} className="card card-slot" aria-hidden="true">
                    {t.label}
                  </span>
                ) : (
                  <button
                    key={t.id}
                    ref={cardRef(t.id)}
                    className={`card${t.id === pending ? ' card-pending' : ''}`}
                    onClick={() => pickCard(t.id)}
                    aria-pressed={t.id === pending}
                  >
                    {t.label}
                  </button>
                ),
              )}
              {placed.length === TASKS.length ? (
                // Nothing left to show, so the dead button goes and one Apple-style text link remains.
                <button className="link" onClick={clearAll}>
                  Start over<span aria-hidden="true"> ›</span>
                </button>
              ) : (
                <>
                  <button className="btn btn-solid" onClick={showAll}>
                    Show all
                  </button>
                  <button className="btn" onClick={clearAll} disabled={placed.length === 0}>
                    Clear
                  </button>
                </>
              )}
            </div>
          </section>

          <footer className="foot">
            <span>SMU · MGMT 6110 · Week 7 · The Map of Human-AI Collaboration</span>
            <span>Human-AI Group 8{GROUP_MEMBERS.length > 0 && `: ${GROUP_MEMBERS.join(', ')}`}</span>
          </footer>
        </main>
        <p className="rotate-hint">Turn your phone sideways for a bigger view.</p>
      </div>
      <PS5 />
    </>
  )
}

const canFullScreen = typeof document !== 'undefined' && document.fullscreenEnabled

function toggleFullScreen() {
  if (!canFullScreen) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen().catch(() => {})
}

function Row({ row, children }: { row: 'together' | 'alone'; children: ReactNode }) {
  return (
    <>
      <h2 className="row-head">{ROWS[row]}</h2>
      {children}
    </>
  )
}
