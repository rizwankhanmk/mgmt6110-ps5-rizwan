// Everything the slide says lives here. Edit the reasons freely; the tests
// check that every task points at a real quadrant and that ids are unique.

export type QuadrantId = 'person-leads' | 'agents-run' | 'ai-alone' | 'person-decides'

export interface Quadrant {
  id: QuadrantId
  name: string
  tone: 'pink' | 'blue'
  row: 'together' | 'alone'
  col: 'right-answer' | 'no-single-answer'
}

export interface Task {
  id: string
  label: string
  quadrant: QuadrantId
  reason: string
}

export const COLUMNS = {
  'right-answer': 'Work with a right answer',
  'no-single-answer': 'Work with no single right answer',
} as const

export const ROWS = {
  together: 'Work that people and AI must do together',
  alone: 'Work that either of them can do alone',
} as const

// Shown in the footer after "Human-AI Group 8". Leave empty to show the group name alone.
export const GROUP_MEMBERS: string[] = []

// What the two quadrant colours mean, shown as a legend above the map.
export const TONES = {
  pink: 'A person leads',
  blue: 'AI does the work',
} as const

// Grid order: top left, top right, bottom left, bottom right.
export const QUADRANTS: Quadrant[] = [
  { id: 'person-leads', name: 'A person leads, AI inside', tone: 'pink', row: 'together', col: 'right-answer' },
  { id: 'agents-run', name: 'Agents run it, a person judges', tone: 'blue', row: 'together', col: 'no-single-answer' },
  { id: 'ai-alone', name: 'AI alone, with checks', tone: 'blue', row: 'alone', col: 'right-answer' },
  { id: 'person-decides', name: 'A person decides, AI alongside', tone: 'pink', row: 'alone', col: 'no-single-answer' },
]

// Tray order is the order below, and the order a clicker places them in.
export const TASKS: Task[] = [
  {
    id: 'schedule',
    label: 'Schedule-making assistant',
    quadrant: 'agents-run',
    reason:
      'The agent can juggle calendars, travel time and clashes on its own, but only you know which meetings really matter, so you approve the week it proposes.',
  },
  {
    id: 'cancel-subscription',
    label: 'Cancelling a subscription',
    quadrant: 'agents-run',
    reason:
      'The agent can find the account and work through the cancel flow, but it stops for your confirmation before anything is final, because money and access are at stake.',
  },
  {
    id: 'market-survey',
    label: 'Market surveying',
    quadrant: 'person-leads',
    reason:
      'AI drafts the questions and tallies the answers fast, but a person decides what we need to learn and checks that the numbers hold up.',
  },
  {
    id: 'news-briefing',
    label: 'News briefing',
    quadrant: 'ai-alone',
    reason:
      "Summarising today's headlines is well-defined work AI can do on its own, with spot checks against the original sources.",
  },
  {
    id: 'product',
    label: 'Developing a business product and what to sell',
    quadrant: 'person-leads',
    reason:
      'AI can size demand, compare competitors and stress-test ideas, but a person owns the bet on what to sell and answers for it.',
  },
  {
    id: 'outfit',
    label: 'Outfit planner',
    quadrant: 'person-decides',
    reason:
      'There is no single right outfit. AI can suggest combinations from your wardrobe and the weather, but taste is personal, so you choose.',
  },
]
