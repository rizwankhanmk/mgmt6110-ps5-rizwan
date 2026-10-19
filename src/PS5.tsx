import { TONE_ICON } from './icons.tsx'
import { AGENT, PLACEHOLDER, SECTIONS } from './ps5.ts'
import { COLUMNS, QUADRANTS, ROWS } from './tasks.ts'

// The Problem Set 5 write-up, below the slide. Same type and tiles as the slide, sized in --u.
export default function PS5() {
  const home = QUADRANTS.find((q) => q.id === AGENT.quadrant)

  return (
    <section className="ps5" aria-labelledby="ps5-title">
      <header className="ps5-head">
        <p className="kicker">SMU · MGMT 6110</p>
        <h2 id="ps5-title" className="title">
          Problem Set 5 · My agent
        </h2>
      </header>

      <article className="agent" aria-label="My agent card">
        <header className="agent-head">
          <span className="badge">My agent card</span>
          <h3 className="agent-name">{AGENT.name}</h3>
          <span className="agent-meta">finished {AGENT.finished}</span>
        </header>
        <ol className="agent-parts">
          {AGENT.parts.map((p) => (
            <li key={p.label}>
              <strong>{p.label}:</strong> {p.text}
            </li>
          ))}
        </ol>
      </article>

      <figure className="mini">
        <div className="map mini-map" role="img" aria-label={`${AGENT.name} sits in ${home?.name ?? ''}`}>
          <span className="corner" aria-hidden="true" />
          <h4 className="col-head">{COLUMNS['right-answer']}</h4>
          <h4 className="col-head">{COLUMNS['no-single-answer']}</h4>
          {(['together', 'alone'] as const).map((row) => (
            <MiniRow key={row} row={row} />
          ))}
        </div>
        <figcaption className="mini-caption">
          {AGENT.name} sits in <strong>{home?.name}</strong>.
        </figcaption>
      </figure>

      {SECTIONS.map((s) => (
        <section key={s.title} className="ps5-part" aria-label={s.title}>
          <h3 className="ps5-h">{s.title}</h3>
          {s.shots > 0 && (
            <div className={`shots shots-${s.shots}`}>
              {Array.from({ length: s.shots }, (_, i) => (
                <div key={i} className="shot">
                  Screenshot {i + 1}
                </div>
              ))}
            </div>
          )}
          <p className="ps5-text ph">{PLACEHOLDER}</p>
        </section>
      ))}
    </section>
  )
}

function MiniRow({ row }: { row: 'together' | 'alone' }) {
  return (
    <>
      <h4 className="row-head">{ROWS[row]}</h4>
      {QUADRANTS.filter((q) => q.row === row).map((q) => {
        const Icon = TONE_ICON[q.tone]
        return (
          <div key={q.id} className={`quad quad-${q.tone}`}>
            <h5 className="quad-name">
              <Icon className="tone-icon" />
              {q.name}
            </h5>
            {q.id === AGENT.quadrant && (
              <div className="quad-cards">
                <span className="card card-placed marker">{AGENT.name}</span>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
