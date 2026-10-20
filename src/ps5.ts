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

/** A screenshot: the file name in public/ and the caption under it.
 *  If the file is not there yet, the page shows an empty frame with the caption. */
export interface Shot {
  file: string
  caption: string
}

export interface Section {
  title: string
  shots: Shot[]
  paragraphs: string[]
}

export const SECTIONS: Section[] = [
  {
    title: 'Runs',
    shots: [
      { file: 'run1.png', caption: 'Live run, Mon 19 Oct 22:35 — one new item, one email.' },
      { file: 'run2.png', caption: 'Zap history, 40 runs, all successful.' },
      {
        file: 'run3.png',
        caption: 'First run after the fix, Tue 20 Oct 03:05 — item dated 19 Oct 2026, nothing older.',
      },
    ],
    paragraphs: [],
  },
  {
    title: 'The tricky case and the fix',
    shots: [
      { file: 'tricky.png', caption: 'The 12:07am burst — 30 runs in one second, articles back to 2018.' },
      { file: 'fix.png', caption: 'The trigger after the fix — feed address with when:1d.' },
    ],
    paragraphs: [
      `Before the first live run I wrote down what I expected on a quiet night: no new news, so no runs and no emails.`,
      `At 12:07am on Tuesday the opposite happened. 30 emails dropped into my inbox at the same time. My first thought was, why is all the news coming at this hour? Then I looked closer. Some of the articles were from 2018 and older. Google News had reshuffled its search results, and since this is just a Zap and not a smart agent with guardrails, it treated every link it had not seen before as new and sent it to me. It has no sense of what is old and what is new.`,
      `The fix was a better feed address, not an extra step. Google News lets you add a date filter to the search, so I changed the query to "Singapore AI startup when:1d", which only returns articles from the last day, and published the Zap again. The next run at 3:05am sent me one article dated 19 October 2026 and nothing older.`,
      `The burst also showed me a second limit. The Zap matches words, not meaning. A Thai startup using Singapore as a hub and a Hong Kong IPO story both came through because the headline had "Singapore" and "AI startup" in it. There is no fix for that inside a one-step Zap. That part is mine to check.`,
    ],
  },
  {
    title: 'Q1 · Where my agent sits on the map',
    shots: [],
    paragraphs: [
      `(a) My agent sits in "AI alone, with checks", bottom left.`,
      `(b) Is it work with a right answer? Yes. Each time it runs it answers one question: is there a new article in this feed? There is no opinion in it. The 39 runs in my Zap history all look the same: a new link appears, an email goes out. Is it work that people and AI must do together? No. The research part, which is finding the latest news, is sorted for me and I do not have to monitor it. I could have done the same search myself every morning; the Zap just does it without me, at any hour, as the 12:07am burst proved.`,
      `(c) The person in the loop. The research on its own does not make sense or have meaning without a human. The Zap cannot tell a Singapore AI startup from a Thai one, or a bank running an AI project, so I am the one who reads each email and decides which articles are worth reading and acting on. Honestly, with this many emails it is a data overload, and I do not have the will to read all of them myself. The next step is a smarter agent that sorts them and summarises the ones worth reading. That is also what would move it to another box: once I decide what I want to do with the data and exactly what information I want out of it, the agent would be making judgement calls on my behalf, and it would sit in "Agents run it, a person judges", with me checking its shortlist instead of the raw feed.`,
      `(d) My group's view. I agree with five of our six placements. News briefing is in "AI alone, with checks", which is where my own agent ended up for the same reason. The one I would move is "Cancelling a subscription", from "Agents run it, a person judges" to "A person decides, AI alongside". Whether to cancel is my call, not the agent's. There is no right answer to "should I keep paying for this", only my answer. The AI's job is to find the cancellation page, the steps and the notice period, and sit alongside me while I decide. I would not want an agent cancelling things and then asking me to judge afterwards.`,
    ],
  },
  {
    title: 'Collaboration log',
    shots: [],
    paragraphs: [
      `What I delegated to AI: I used Claude for most of the build. It suggested the agent idea, gave me the Google News RSS feed address, walked me through the Zap one screen at a time, wrote the HTML email body, built this Problem Set 5 section in the Vite project, and read the Zap history JSON export to pull out the run times.`,
      `What I checked and how: I tested every step before publishing and read the test email myself. I matched the live runs in Zap history against the emails in Gmail. I opened the page in a private window to make sure it loads without a sign-in. And I read Prof Roh's brief myself, which is how I caught the first mistake below.`,
      `AI errors I caught: Two. First, I started building a Zapier Agent with written instructions, the same way I built my earlier agents, and Claude went along with it. The brief was very clear that this had to be a Zap with one trigger and one action, so I stopped and we started again as a Zap. Second, the feed address Claude gave me had no time limit on it. It never specified the timeline of the links, so I received emails from 2018 and beyond, which was redundant. I need the latest and now data, not old news. Around midnight it sent me 30 emails at once. The fix was adding the date filter to the feed.`,
      `Time and cost: Honestly about four hours across Monday night and Tuesday. More than I should have taken, but it was a learning process. Zapier free plan, 40 of 100 tasks used this month, no card added.`,
    ],
  },
  {
    title: 'Reflection',
    shots: [],
    paragraphs: [
      `The agent fit the job for the first half: finding the latest Singapore AI startup news without me monitoring anything. It did not fit the second half, which is making sense of it, and it failed badly when Google reshuffled the feed and it sent me 30 old articles in a second, because a one-step Zap has no guardrails, no sense of time and no sense of meaning. If I did it again I would put the date filter in the feed from the start, and I would set the Zap up as the first step of a bigger agent that sorts and summarises, because what I actually want is understanding, not more emails. I am glad I now understand the actual process rather than just the surface output.`,
    ],
  },
]
