// Pure placement logic. State is the list of placed task ids, oldest first,
// so "return the most recent" is just dropping the last one.

import type { Quadrant, Task } from './tasks.ts'

export type Placed = readonly string[]

export function isPlaced(placed: Placed, id: string): boolean {
  return placed.includes(id)
}

export function place(placed: Placed, id: string): string[] {
  return placed.includes(id) ? [...placed] : [...placed, id]
}

export function unplace(placed: Placed, id: string): string[] {
  return placed.filter((p) => p !== id)
}

/** The first task in tray order that is not on the map yet. */
export function nextUnplaced(placed: Placed, tasks: readonly Task[]): Task | undefined {
  return tasks.find((t) => !placed.includes(t.id))
}

export function lastPlaced(placed: Placed): string | undefined {
  return placed[placed.length - 1]
}

/** Placed tasks in one quadrant, in the order they landed. */
export function inQuadrant(placed: Placed, tasks: readonly Task[], quadrant: string): Task[] {
  return placed
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => t !== undefined && t.quadrant === quadrant)
}

export function statusLine(placedCount: number, total: number): string {
  if (placedCount === 0) return 'Click a task'
  if (placedCount >= total) return `All ${total} placed`
  return `${placedCount} of ${total} placed`
}

/** Problems with the slide data, so a typo in tasks.ts fails a test, not the talk. */
export function validateTasks(tasks: readonly Task[], quadrants: readonly Quadrant[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const qids = new Set(quadrants.map((q) => q.id))
  for (const t of tasks) {
    if (ids.has(t.id)) errors.push(`duplicate id: ${t.id}`)
    ids.add(t.id)
    if (!qids.has(t.quadrant)) errors.push(`unknown quadrant for ${t.id}: ${t.quadrant}`)
    if (!t.label.trim()) errors.push(`empty label: ${t.id}`)
    if (!t.reason.trim()) errors.push(`empty reason: ${t.id}`)
  }
  return errors
}

export type Verdict = 'none' | 'agree' | 'differ'

/** How the class's call compares with ours. No call means the card was revealed straight away. */
export function verdict(guess: string | undefined, ours: string): Verdict {
  if (guess === undefined) return 'none'
  return guess === ours ? 'agree' : 'differ'
}

/** The verdict on the reason panel's top line, after the task name. Takes quadrant names, not ids. */
export function verdictLine(guessName: string | undefined, oursName: string): string {
  if (guessName === undefined) return `Placed in ${oursName}`
  if (guessName === oursName) return `The class agreed: ${oursName}`
  return `The class called ${guessName}. We placed it in ${oursName}.`
}
