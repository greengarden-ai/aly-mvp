# Aly Energy Prototype — Workflow Map

**Purpose:** Pre-SQL, navigable prototype for Alya's review (meeting tomorrow afternoon). This map captures every locked decision from architecture scoping and is the direct source for the VS Code handoff document. Not for Alya's eyes — internal planning only.

**Prior assets:** Existing field ticket form and architecture schematic are reference-only. Schematic does not appear in the prototype. The field ticket form's *input fields* carry forward into the rebuilt Field Worker screen; its UX/visual system does not — the whole prototype uses one new unified design system.

---

## 1. Demo Structure

Navigable app — Alya moves freely between screens/roles in any order. No fixed guided sequence. This is deliberate: it should feel like exploring a real product, not watching a scripted demo.

---

## 2. Login & Roles

Simulated login/landing screen. Alya (or whoever is at the keyboard) picks a role to "sign in as" and sees only that role's view until switching back via logout/role-switch.

**Roles (6 total):**
1. **CS Rep** — books job/customer, order intake
2. **Field Worker** — submits rig-up/rig-down and rental tickets, tablet-style UI
3. **Biller** (Amanda-equivalent) — assembles/reviews tickets for completeness, releases for approval
4. **Regional Approver** — Jaime/Lindsey (STX path) or Aaron (WTX path); routing differs by region
5. **Alya — CFO + Super Admin** — combined role. Pricing approval, exception queue ownership, and full user management live under one login
6. *(No separate Super Admin login — folded into Alya's role per above)*

No real authentication. Login = role selection only.

---

## 3. Shared State Model

**Architecture:** Single in-memory JS object, alive for the browser session. No database, no persistence — refresh clears it. This is intentional: the pitch is "one system, one source of truth," and static per-role mockups would undercut that.

**Live/shared entities** (the "spine" — must be real and reactive across all role views):
- Job/customer record
- Field tickets (rig move + rental)
- Equipment/fleet status (in-yard / on-job / sub-rented)
- Exception flags
- Signature status
- Invoice (incl. mock Intacct post state)

**Static/decorative entities** (no need to be live):
- Super Admin's user list (self-contained, see §9)
- Notification settings
- Historical/past-job flavor data, if any

---

## 4. Lifecycle Stages (10)

Full transaction/ops lifecycle, customer order through final invoice. All stages accessible in any order via navigation — this list defines *what exists*, not a forced path.

1. **Customer order intake** — CS Rep books job/customer
2. **Field ticket capture — rig move** — Field Worker, tablet-style, rig-up/rig-down + equipment repeater (inputs carried over from existing field ticket form)
3. **Field ticket capture — rental** — Field Worker, well selection + 2–3 non-consecutive date-range stints per well
4. **Ticket assembly/review — Biller role.** Two logic paths:
   - *Rig move:* completeness cross-check made visible/automatic — does the ticket have a matching rig-up/rig-down form and a matching trucking form for every hauled item? (Manual/error-prone in the real process; prototype's value is surfacing this automatically.) Marked "ready" moves to approval routing.
   - *Rental:* per-well ticket with its date-range stints; "release for signature" action once a well is confirmed complete. (Real process: this often bypasses Alya's review entirely — ties to the toggle in stage 6.)
   - *Explicitly not modeled:* the phone-clarification pain point (STX/WTX pricing back-and-forth) — verbal talking point for David, not a UI element.
5. **Approval routing — Regional Approver.** STX vs. WTX branch shown as a real workflow rule (see easter egg #4, §7).
6. **CFO pricing approval — Alya.** Rig move: always required, no exceptions. Rental: gated by an admin toggle ("Require CFO approval on rental tickets: On/Off") — staged as an open decision for Alya to make live, not a baked-in default.
7. **Signature capture**
8. **Invoice generation + Post to Sage Intacct** — inline mock, woven into the invoicing flow (see §8)
9. **Exception Queue** — cuts across all stages above; flags can surface at any point. Preloaded with the four easter eggs (§7).
10. **Dashboards/reporting** — subset of KPIs (§10)

---

## 5. Fleet & Equipment Management

**Both** a dedicated screen and inline surfacing, same source of truth:
- **Dedicated screen:** browsable equipment list, status (in-yard / on-job / sub-rented), tied to the ~400-unit fleet concept
- **Inline:** same live status surfaced in ticket detail, exception queue, and dashboard fleet KPI

The duplication is deliberate — same data shown twice reinforces "one place, not many."

---

## 6. Region-Specific Routing (STX/WTX)

Two open jobs (one STX, one WTX) whose rig move tickets show different approval chains:
- **STX:** Alya → Jaime → Lindsey → customer
- **WTX:** Alya → Aaron (or direct) → customer

Modeled as a real workflow rule, not a generic "manager review" step. Region routing itself should read as an editable rule in the admin toggle area (staged as open decision — see §6 note under stage 6 above and §11).

---

## 7. Easter Eggs (Alya-facing — appear in the in-app guide)

Reframed from "hidden test data" to **guided demo highlights** — each one showcases a specific platform capability when found. Four locked:

1. **Double-booking bug (preloaded, not live-triggered)** — reconstructs the confirmed real incident: old job's rental ticket not closed before a new one opened for the same carried-over equipment, $475/day, ~$12,825 accrued before catch. Proves continuity/overlap detection.
2. **Rig-self-move flagged ticket** — equipment moved with the rig itself, no field event, manually flagged rather than tablet-captured. Proves the platform closes a blind spot the current KPA/JobUTrax system cannot represent.
3. **Rental ticket past SLA in Exception Queue** — unresolved past its aging threshold, visible with a days-open/aging indicator. Proves SLA/backlog tracking.
4. **STX vs. WTX region-specific routing** — two jobs, compare approval chains (§6). Proves region-specific routing is a real modeled rule.

*(Candidate "signature-gated ticket blocking invoice" was proposed and rejected — not included.)*

---

## 8. Sage Intacct Integration (Mocked)

Woven into the invoicing flow itself — no dedicated sync screen. A "Post to Sage Intacct" button on the invoice, which produces an inline, believable success state: mock confirmation, invoice ID, timestamp. No real API calls.

---

## 9. Super Admin (Alya's combined role)

Self-contained — **no ripple into shared state.** Scope:
- View user list (~22–30 users with roles)
- Add a new user
- Edit a user's role/region assignment
- Deactivate a user (deactivated user disappears from *this screen's* list only)

All actions work locally within the Super Admin screen but do not affect the rest of the demo (e.g., deactivating "Aaron" here does not remove him from the WTX routing shown elsewhere).

---

## 10. Dashboards

**Included (meaningful at 3–5 job scale):**
- Fleet status (in-yard/on-job/sub-rented) — snapshot, not trend-dependent
- Exception queue volume/backlog — directly reflects the four seeded easter eggs
- Open invoice aging — a few tickets is enough to populate aging buckets

**Deferred, with an explicit, prominently-positioned note** (top of dashboard, clear at first glance) stating the prototype was built with sparse/small-sample data and these won't look statistically meaningful yet — "coming in V1 with full data":
- Revenue by customer/job
- Billing error rate
- Job/ticket throughput

---

## 11. In-App Help / Reference Screen

Replaces standalone docs. Built into the prototype itself, pullable at any time while exploring. Contains:
- **Navigation guide** — how to move between roles, what each role can do
- **Easter egg list** — the four items from §7, framed as "here's what to go look for," written for Alya as guided highlights (not internal test notes)

---

## 12. Seed Data

- **Volume:** 3–5 jobs total — enough to house all four easter eggs plus one or two "normal, nothing wrong here" baseline examples
- **Customer names:** fictionalized (e.g., "Sample Customer A") — avoids confusion with real records
- **Internal personnel names:** real — Aaron, Jaime, Lindsey, Amanda — reinforces that the platform models Alya's actual team and approval chain

---

## 13. Design System

- Base: light / navy-and-amber theme, pulled from the existing field ticket form
- Fully responsive: desktop, tablet, and mobile
- One unified system across all role screens (rebuilt fresh, not a patchwork of the two prior prototypes)

---

## 14. Tech Stack

React project (component-based). Chosen over single-file HTML/JS specifically because pieces may carry forward into the eventual live V1 build.

---

## 15. Explicit Non-Goals (out of scope for this prototype)

- No real database/backend
- No real authentication (login = role selection only)
- No real Sage Intacct API calls (mocked only)
- No historical data migration
- No EHS/compliance module
- No ADP/payroll integration
- No fleet auto-assignment
- No offline tablet mode

---

## 16. Downstream Deliverables (not part of this build, noted for sequencing)

After this prototype is reviewed with Alya:
- Handoff doc #2, for a future agent: (1) work with David and Alya to gather her feedback on this prototype, and (2) build the live enterprise V1 platform incorporating that feedback. Out of scope for the current VS Code handoff — flagged here so it isn't lost.
