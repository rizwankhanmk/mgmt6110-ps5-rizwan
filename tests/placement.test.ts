import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  inQuadrant,
  lastPlaced,
  nextUnplaced,
  place,
  statusLine,
  unplace,
  validateTasks,
  verdict,
  verdictLine,
} from '../src/placement.ts'
import { QUADRANTS, TASKS, type Task } from '../src/tasks.ts'

test('the slide data is valid', () => {
  assert.deepEqual(validateTasks(TASKS, QUADRANTS), [])
  assert.equal(TASKS.length, 6)
})

test('each task sits in the quadrant the group chose', () => {
  const where = Object.fromEntries(
    TASKS.map((t) => [t.label, QUADRANTS.find((q) => q.id === t.quadrant)?.name]),
  )
  assert.deepEqual(where, {
    'Schedule-making assistant': 'Agents run it, a person judges',
    'Cancelling a subscription': 'Agents run it, a person judges',
    'Market surveying': 'A person leads, AI inside',
    'News briefing': 'AI alone, with checks',
    'Developing a business product and what to sell': 'A person leads, AI inside',
    'Outfit planner': 'A person decides, AI alongside',
  })
})

test('quadrants are in grid order with the course wording', () => {
  assert.deepEqual(
    QUADRANTS.map((q) => [q.name, q.row, q.col]),
    [
      ['A person leads, AI inside', 'together', 'right-answer'],
      ['Agents run it, a person judges', 'together', 'no-single-answer'],
      ['AI alone, with checks', 'alone', 'right-answer'],
      ['A person decides, AI alongside', 'alone', 'no-single-answer'],
    ],
  )
})

test('place appends once and unplace removes', () => {
  let p = place([], 'a')
  p = place(p, 'b')
  p = place(p, 'a')
  assert.deepEqual(p, ['a', 'b'])
  assert.deepEqual(unplace(p, 'a'), ['b'])
  assert.deepEqual(unplace(p, 'zzz'), ['a', 'b'])
})

test('nextUnplaced follows tray order, skipping placed cards', () => {
  assert.equal(nextUnplaced([], TASKS)?.id, 'schedule')
  assert.equal(nextUnplaced(['schedule', 'market-survey'], TASKS)?.id, 'cancel-subscription')
  assert.equal(nextUnplaced(TASKS.map((t) => t.id), TASKS), undefined)
})

test('lastPlaced is the most recent card', () => {
  assert.equal(lastPlaced([]), undefined)
  assert.equal(lastPlaced(['outfit', 'news-briefing']), 'news-briefing')
})

test('inQuadrant keeps landing order and ignores unknown ids', () => {
  const got = inQuadrant(['product', 'schedule', 'ghost', 'market-survey'], TASKS, 'person-leads')
  assert.deepEqual(got.map((t) => t.id), ['product', 'market-survey'])
})

test('statusLine reads naturally', () => {
  assert.equal(statusLine(0, 6), 'Click a task')
  assert.equal(statusLine(3, 6), '3 of 6 placed')
  assert.equal(statusLine(6, 6), 'All 6 placed')
})

test('validateTasks catches typos', () => {
  const bad = [
    { id: 'x', label: 'X', quadrant: 'nowhere', reason: 'r' },
    { id: 'x', label: ' ', quadrant: 'ai-alone', reason: '' },
  ] as unknown as Task[]
  assert.deepEqual(validateTasks(bad, QUADRANTS), [
    'unknown quadrant for x: nowhere',
    'duplicate id: x',
    'empty label: x',
    'empty reason: x',
  ])
})

test('verdict compares the class call with ours', () => {
  assert.equal(verdict(undefined, 'ai-alone'), 'none')
  assert.equal(verdict('ai-alone', 'ai-alone'), 'agree')
  assert.equal(verdict('agents-run', 'ai-alone'), 'differ')
})

test('verdictLine reads naturally in all three cases', () => {
  assert.equal(verdictLine(undefined, 'AI alone, with checks'), 'Placed in AI alone, with checks')
  assert.equal(
    verdictLine('AI alone, with checks', 'AI alone, with checks'),
    'The class agreed: AI alone, with checks',
  )
  assert.equal(
    verdictLine('Agents run it, a person judges', 'AI alone, with checks'),
    'The class called Agents run it, a person judges. We placed it in AI alone, with checks.',
  )
})
