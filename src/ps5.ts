// Everything the Problem Set 5 section says lives here.

import type { QuadrantId } from './tasks.ts'

export interface AgentPart {
  label: string
  text: string
}

export const AGENT = {
  name: 'SG AI Startup Watch',
  finished: '19 Oct 2026, 10:20 PM',
  // Where the agent sits on the map.
  quadrant: 'ai-alone' as QuadrantId,
  parts: [
    {
      label: 'The job',
      text: 'emails a networking lead each time a Singapore AI startup is in the news, for an MSc student building a startup contact list.',
    },
    {
      label: 'The trigger',
      text: 'a new item in a Google News RSS search for "Singapore AI startup".',
    },
    {
      label: 'The tools',
      text: 'RSS by Zapier (New Item in Feed) → Gmail (Send Email).',
    },
    {
      label: 'It must never',
      text: 'email anyone but me — the To field is fixed to my own address, with Cc and Bcc empty.',
    },
    {
      label: 'Where a person checks',
      text: 'I read each email the same day and decide whether the company goes on my list.',
    },
  ] satisfies AgentPart[],
}

// Headings still to be written up, with how many screenshot placeholders each one shows.
export const SECTIONS: { title: string; shots: number }[] = [
  { title: 'Runs', shots: 3 },
  { title: 'The tricky case and the fix', shots: 2 },
  { title: 'Q1 · Where my agent sits on the map', shots: 0 },
  { title: 'Collaboration log', shots: 0 },
  { title: 'Reflection', shots: 0 },
]

export const PLACEHOLDER = 'To be written.'
