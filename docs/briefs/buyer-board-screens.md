# HomeUP Buyer Board: Screen Spec

Companion to `2026-09-19-buyer-board-build-brief.md`. The brief says what to build and in what order. This file says what each screen looks like and how it behaves. Screenshots of the prototype, where available, are in `docs/briefs/screens/`.

Everything here is a starting point, not a brand standard. Replace the placeholder look with the real HomeUP logo and palette when they are supplied.

---

## 1. Design tokens

Put these in `tailwind.config.ts` rather than hard-coding hex values in components.

| Token | Value | Used for |
| --- | --- | --- |
| `ground` | `#F4F1EA` | Page background |
| `surface` | `#FFFFFF` | Cards |
| `surface-sunk` | `#ECE8DF` | Pipeline columns, paused items |
| `ink` | `#1A2420` | Body text, dark panels |
| `ink-muted` | `#56615B` | Secondary text |
| `ink-soft` | `#45504A` | Body text on tinted panels |
| `line` | `#E2DDD2` | Card borders |
| `line-strong` | `#D6D0C4` | Input borders, unselected buttons |
| `accent` | `#1E5A43` | Primary green: buttons, active nav, hero panels |
| `accent-deep` | `#174A37` | Panels inside a green hero |
| `accent-soft` | `#E3ECE6` | Green tint: chips, success states |
| `accent-onDark` | `#9FD3B8` | Green on the dark ink panel |
| `signal` | `#F2C57C` | Amber: live, in-progress, waiting |
| `signal-ink` | `#7A4A0E` | Text on amber tint |
| `signal-tint` | `#F7EBD9` | Amber tint chips |
| `warn` | `#9A4414` | Overdue text |
| `warn-bg` | `#FDF6EE` | Overdue row background |
| `closing` | `#2F3E6B` | Navy: closing stage, completed |

**Type.** Display font Fraunces (weights 500 and 600) for page titles, hero names and section headings. Body font DM Sans (400 to 700). Fall back to Georgia and system sans.

**Shape and space.** Cards `rounded-2xl` (18px to 22px). Chips and pills fully rounded. Buttons and inputs 12px. Inner padding 14px to 18px. Gap between sections 18px to 22px.

**Touch targets.** Every button, link and input is at least 44px tall. Buyers use this one-handed on a phone.

**Motion.** Three animations only, all disabled under `prefers-reduced-motion`:
1. **Hourglass** rotating 180 degrees every 2.4s, on any "waiting for someone else" state.
2. **Live dot** pulsing amber ring every 1.8s, next to the word LIVE and on the current step.
3. **Working stripes** diagonal stripes drifting across a progress bar while work is in progress. A finished bar is solid.

---

## 2. Shared patterns

**Header.** HomeUP wordmark left. Right side carries a LIVE pill (dark, pulsing amber dot) on the board, or a notification bell elsewhere.

**Journey bar.** Five equal segments labelled Brief, Shortlist, Viewings, Offer, Keys. Completed segments green, current segment amber with working stripes, future segments grey. The current label is bold. Buyers see this, never the internal pipeline stage.

**Bottom nav.** Four tabs, icon over label, 48px tall. The active tab is green and bold; the others grey. Tab set changes by stage (see section 4).

**Hero slot.** One card directly under the journey bar, holding the single most urgent thing. Its content is decided by the stage. Green for active work, dark ink for negotiation detail, navy for closing.

**Status chips.** 11px to 12px, bold, fully rounded. Pre-market: ink on white text. Just listed by HomeUP: amber tint. New launch: green tint. Overdue: warn. Done: green tint.

**Advisor voice.** Advisor notes appear with a round initials avatar and the label "Tong Boon's take" or "Latest from your advisor". Buyer-facing copy is plain, no jargon, no em-dashes.

---

## 3. Buyer screens

### 3.1 Login (`/my/login`)

- Dark ink hero: wordmark, an "OPEN 24/7" pill, the title "Your Buyer Board", one line of explanation, and a sample status card showing an hourglass with "Awaiting seller side's reply, next update by 6:00pm".
- Step 1: `+65` prefix box beside a phone input, then a full-width "Send me a code" button.
- Step 2: a 6-digit code input with wide letter spacing, an "Open my board" button, a "Use a different number" button, and a resend line.
- Two reassurance lines at the bottom: only numbers added by HomeUP can log in; stays logged in for 30 days.
- A number not in `buyers` gets a polite "ask your advisor" message, never a hint about whether the number exists.

### 3.2 Board home (`/my`)

Order of sections, top to bottom:

1. Greeting with the buyer's first name and a "Last updated" time.
2. Journey bar.
3. Hero slot, by stage (section 4).
4. Advisor card: avatar, name, role, Message button, and the advisor's latest note with a link to where it came from.
5. Stage-specific second section (section 4).
6. Latest updates: a timestamped list, four items, newest first.
7. While you wait: a horizontal strip of new launch news and short reads.
8. Referral card on a green tint: "Know someone upgrading?" with a Share my advisor button.

### 3.3 My Brief (`/my/brief`)

- Title, one line of explanation, then a green tint receipt: "Last update seen by [advisor], [date, time]". The receipt is the point of the screen.
- Fields in order: property types (multi-select pills), max budget (slider showing `$X.XM`), bedrooms (4 single-select boxes), areas (region pills plus a free-text field), must-haves (multi-select pills), deal-breakers (textarea), "Do you need to sell an HDB first?" (Yes, No, Not sure), "When do you want to buy?" (Ready now, 3 to 6 months, Exploring).
- Selected pills are solid green with white text; unselected are white with a grey border.
- A sticky bar above the nav holds "Send update to my advisor". After sending it becomes a green tint confirmation. Any further change turns it back into a button.
- Each Send writes a new `buyer_briefs` row, never an edit in place.

### 3.4 Discover (`/my/discover`)

- Header: title, "Matched to your brief" plus a summary of the brief in one line, then a horizontal filter row: All for you, Pre-market, Just listed by HomeUP, New launches.
- A dark ink notice explains that pre-market units are shown before the public portals.
- Cards: photo area with the source chip top left and a heart button top right (filled red when saved), then name, price, one meta line, a green tint match line, and two buttons: "Ask my advisor" and "Request viewing".
- Only units whose seller consent is recorded may appear.

### 3.5 Shortlist (`/my/shortlist`)

- Title and the line that does the work: "Spotted something on PropertyGuru? Paste the link. No screenshots, no forgetting to tell us."
- Paste box: a URL input plus a Send button, with a note that the advisor checks every link.
- Each item card: source label ("You sent from PropertyGuru" or "HomeUP pick"), name, meta, a status chip (Checking, Take ready, Viewing Sat), the advisor's take in a tinted block with avatar, and three rating buttons: Love it, Maybe, Pass.
- Pasting a link creates the item immediately with status Checking, so the buyer sees it landed.

### 3.6 Team at work (`/my/projects`)

This is the screen that occupies impatient buyers.

- Tabs: In progress (n), Queued (n), Done (n).
- Each project card: owner avatar and name, start time, status chip, title, then:
  - **What we are filtering:** the criteria as chips, taken from the brief.
  - **Funnel:** four boxes showing scanned, match brief, advisor checked, ready. The last box is solid green.
  - **Progress bar** with working stripes, plus a short note and a percentage.
  - **Waiting state** instead of a bar where the team is waiting on someone else: green panel, amber hourglass, "Awaiting seller side's reply" and the waiting time.
  - Footer: a clock icon with the finish time ("Shortlist ready by 5:00pm"), warn colour if a promise is overdue, and one action link.
- Bottom card: "Want us to look into something?" with a Request a project button.

### 3.7 Deal room (`/my/deal`)

- Back arrow, "Deal room" title, then the unit name and unit number.
- Dark ink live panel: amber hourglass, "RIGHT NOW" label, the status in large bold, the waiting time, then a sub-panel: "We will update you by 6:00pm today, even if there is no news." Then the advisor's note with avatar.
- Offer progress: a vertical five-step timeline with timestamps. Done steps are green with a tick; the current step is an amber pulsing dot; future steps are hollow. Steps: offer agreed with you, offer sent, seller reviewing, seller responds, OTP issued.
- The numbers: two boxes, asking and your offer.
- "While we wait: if the seller counters": three single-select options (call me first, counter up to a stated ceiling, hold firm), a Send button, and the line "Nothing is agreed without your final yes."

---

## 4. Stage logic

`buyers.journey_step` decides the hero slot, the second section and the tab set. Only an advisor action changes it.

| Stage | Hero slot | Second section | Tabs |
| --- | --- | --- | --- |
| Searching | Live filtering project: criteria chips, striped bar, funnel counts, "ready by" time, Adjust brief button | New for you, then shortlist summary | Home, Discover, Shortlist, Brief |
| Viewing | Next viewing: countdown chip, date and meeting point, Viewing pack and Reschedule buttons | Rate the last viewing, then the price room project | Home, Discover, Shortlist, Brief |
| Offer | Negotiation card: hourglass, status, waiting time, next update promise, Deal room button | Counter instruction, while you wait, "3 other units on hold" | Home, Deal room (red dot), Shortlist, Brief |
| Closing | Navy panel: OTP issued, exercise deadline, days remaining, steps-done bar | Five-row checklist (loan, lawyer, CPF, exercise, completion), then referral card | Home, Deal room, Checklist, Brief |

**Transition rules**

- Each switch shows one dismissable amber banner, for example "Your board switched to offer mode. Deal room is now in the menu."
- Nothing is deleted. Paused items are shown as on hold, not hidden.
- If an offer lapses, the stage returns to Viewing with the shortlist intact.
- My Brief, the journey bar, the latest update and Message advisor are present at every stage.

---

## 5. Advisor screens

Built by Jiang Heng in his dashboard. Same tokens, desktop layout, dark ink left rail 220px wide with Today, Pipeline, Client files and Team health, and an advisor card at the bottom.

### 5.1 Today

- Four metric cards: owed replies, overdue (amber tint card, warn number), viewings today, your median reply time.
- Reply queue: filter pills (All, Overdue, Today, Links, Briefs), then rows of checkbox, client name with a type chip, the detail in one line, the due text, and Open file plus WhatsApp buttons. Overdue rows have the warn background. Ticking a row requires a short reply, which posts to the buyer's board.
- Right column: today's viewings by time, then Signals (Hot, Quiet, Sell-side lead) with one action button each.

### 5.2 Pipeline

- Five columns: Standby, Nurture, Active, Closed, Not closed, each with a colour dot, a count and a one-line description of who belongs there.
- Cards show the client, an owed badge or Hot or Quiet tag, the journey step the buyer sees, one line of brief summary, and the last activity. Cards open the client file. Dragging a card changes the stage.
- A toggle switches between My clients and All advisors; in All, cards also show the advisor.

### 5.3 Client file

- Header: client name, then chips for stage, budget, bedrooms and areas, and "Selling HDB first" where it applies. Buttons: View their page, WhatsApp client.
- Four panels: What changed (brief diffs with timestamps), Buying signals, Your follow-ups (checkboxes with due dates), and a dark "More deals from this client" panel with Introduce, Say hello and Book call actions.

### 5.4 Team health (manager only)

- Four metric cards: team owed, overdue now, team median reply, quiet buyers.
- A table per advisor: active buyers, owed, overdue, median reply time as a bar on a 0 to 10 hour scale, quiet buyers, viewings, and a status chip (On track, Watch, Needs help). Advisors needing help are listed first.
- Below: "Overdue right now" rows with advisor, client, what is owed, how late, and Ping advisor plus Reassign buttons.

### 5.5 Back office: update the board

The screen that keeps the buyer board truthful.

- Deal status: six single-select options (Preparing offer, Offer sent, Awaiting seller reply, Counter received, Offer accepted, OTP issued).
- "Promise the next update by": Within 1 hour, Within 3 hours, By 6:00pm, Tomorrow 10am. This writes `deals.next_update_due` and creates the advisor task.
- Note to the buyer: a short textarea.
- Projects the buyer can watch: each with a progress slider and a visibility toggle, plus template buttons to start a new one (Filter listings, Check seller flexibility, Transaction check, New launch comparison).
- Right side: a live phone preview showing exactly what the buyer sees, updating as the admin changes anything.

---

## 6. Copy rules

- Say what will happen and when: "Next update from us by 6:00pm today, even if there is no news."
- Never promise a time the team cannot keep. Every promise becomes a tracked task.
- Keep advisor notes about the seller side general. Buyers may screenshot the board and forward it.
- HomeUP is an advisory, never an agency. No "specialist".
- No rankings or statistics on buyer pages unless they meet the verified claim standard.
- No em-dashes.
