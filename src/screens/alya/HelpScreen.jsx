import Card, { CardHeader } from '../../components/common/Card.jsx'

const ROLES = [
  {
    role: 'CS Rep',
    icon: '📋',
    route: '/cs/intake',
    desc: 'Creates new jobs by selecting a customer and entering well details. Every ticket in the system traces back to a job created here.',
    can: [
      'Create a new job (customer + well name + region)',
      'View the list of active jobs',
    ],
  },
  {
    role: 'Field Worker',
    icon: '🔧',
    route: '/fieldworker/rig-move  or  /fieldworker/rental',
    desc: 'Submits the two core ticket types — rig move and rental — from the field, ideally on a tablet.',
    can: [
      'Submit a rig move ticket (equipment list, crew, containment details, manager approval)',
      'Submit a rental ticket (well + one or more open/closed date-range stints)',
    ],
  },
  {
    role: 'Biller',
    icon: '🧾',
    route: '/biller/tickets',
    desc: 'Reviews submitted tickets for completeness before releasing them into the approval chain.',
    can: [
      'See all tickets awaiting biller review',
      'Check rig move completeness (trucking forms per hauled item)',
      'Review rental stints and computed totals',
      'Approve a ticket → moves it to Regional Approver',
    ],
  },
  {
    role: 'Regional Approver',
    icon: '✅',
    route: '/approver/routing',
    desc: 'STX and WTX approvers see only their region\'s tickets. The routing chain differs by region — that\'s the point.',
    can: [
      'View the approval chain for each ticket (STX: Alya → Jaime → Lindsey → Customer; WTX: Alya → Aaron → Customer)',
      'Approve a ticket → moves it to CFO or directly to Pending Signature (if CFO rental toggle is off)',
    ],
  },
  {
    role: 'CFO / Alya',
    icon: '👤',
    route: '/alya/cfo-approval',
    desc: 'Alya\'s primary approval screen. Rig moves always require her sign-off. Rentals only do if the live toggle is on.',
    can: [
      'See all tickets pending CFO approval',
      'Flip the "Require CFO approval on rentals" toggle and watch it affect routing immediately',
      'Approve tickets → moves them to Pending Signature',
      'See the waiting-for-signature queue',
    ],
  },
  {
    role: 'Signature (shared)',
    icon: '✍️',
    route: '/shared/signature/:ticketId',
    desc: 'Customer or authorized signer captures their signature on a touch-friendly canvas. Accessible from the invoice screen.',
    can: [
      'Enter signer name and title',
      'Draw signature on canvas (works with mouse or touch)',
      'Confirm → advances ticket to Signed',
    ],
  },
  {
    role: 'Invoice (shared)',
    icon: '📄',
    route: '/shared/invoice/:ticketId',
    desc: 'Final billing document. The "Post to Sage Intacct" button is locked until both CFO approval and a signature are on file.',
    can: [
      'View full ticket summary with workflow breadcrumb',
      'See captured signature image',
      'Generate the invoice record',
      'Post to Sage Intacct (mock — shows confirmation + fake invoice number)',
    ],
  },
]

const ALYA_ONLY = [
  {
    icon: '📊',
    label: 'Dashboard',
    route: '/alya/dashboard',
    desc: 'Fleet snapshot, open exception count, and invoice aging buckets. The note at the top explains why numbers are small — this is intentional with prototype data.',
  },
  {
    icon: '🚨',
    label: 'Exception Queue',
    route: '/alya/exceptions',
    desc: 'All flagged anomalies in one place. Exceptions are preloaded — no action is needed to trigger them.',
  },
  {
    icon: '🚛',
    label: 'Fleet & Equipment',
    route: '/alya/fleet',
    desc: '50 items representing a 400-unit fleet. Filterable by status and sortable by any column.',
  },
  {
    icon: '👥',
    label: 'Super Admin',
    route: '/alya/admin',
    desc: 'User management. Add users, edit roles and regions, deactivate accounts. Changes here are self-contained and do not affect approval chains elsewhere in the demo.',
  },
]

const EASTER_EGGS = [
  {
    icon: '🔄',
    label: 'Double-Booking',
    where: 'Exception Queue → "Double-Booking" card',
    what: 'A rental ticket for Gulf Coast Upstream LLC (JOB-002) has two overlapping rental periods for the same piece of equipment — the first stint was never closed before the second opened. The platform detected this automatically and computed the duplicate charge: $12,825 (27 days × $475/day). Click "Mark Resolved" to walk through the resolution flow.',
  },
  {
    icon: '🚩',
    label: 'Rig Self-Move Flagged',
    where: 'Exception Queue → "Rig Self-Move" card',
    what: 'Desert Ridge Operating Co. (JOB-004) moved a rig without a rig move ticket. The equipment physically relocated, but KPA and JobUTrax have no record of it. This platform caught the discrepancy. The card shows the affected equipment list and the explicit note: this is the only record of the move in any system.',
  },
  {
    icon: '⏱️',
    label: 'Past SLA',
    where: 'Exception Queue → look for the age badge on the Double-Booking card',
    what: 'The same Gulf Coast ticket (TKT-RT-002) has been open for 47 days — past the 30-day SLA threshold. The red age indicator surfaces on the exception card and on the Dashboard exception details.',
  },
  {
    icon: '🗺️',
    label: 'Routing Comparison',
    where: 'Exception Queue → "Demo Highlights" section → "Routing Highlight" card',
    what: 'A side-by-side view of an STX ticket (Alya → Jaime → Lindsey → Customer) vs. a WTX ticket (Alya → Aaron → Customer). Both approval chains are live — they read from the same routing rules config that Alya could update. This shows the platform enforcing different regional workflows from one central rule set, not hardcoded logic.',
  },
]

export default function HelpScreen() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Help & Guide</h1>
        <p className="page-subtitle">How to navigate the prototype and where to find the highlights</p>
      </div>

      {/* Navigation tip */}
      <Card style={{ marginBottom: 'var(--space-6)', background: 'var(--navy)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 'var(--text-base)', marginBottom: 6 }}>
              You can see everything from this login
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              As CFO / Super Admin you have access to every screen in the sidebar — including all role-specific views.
              Use <strong style={{ color: 'white' }}>Switch Role</strong> (top right) to step into any other role and experience the workflow from their perspective.
              State is shared across roles in the same session, so actions you take as a Field Worker will immediately be visible when you switch to Biller.
            </div>
          </div>
        </div>
      </Card>

      {/* Role breakdown */}
      <h3 className="section-title">Role-by-Role Navigation</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-7)' }}>
        {ROLES.map(({ role, icon, route, desc, can }) => (
          <Card key={role}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--navy)' }}>{role}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)', background: 'var(--bg)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    padding: '1px 8px',
                  }}>{route}</span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
                  {desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {can.map(item => (
                    <div key={item} style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--status-approved)', flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alya-only screens */}
      <h3 className="section-title">CFO-Only Screens</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-7)' }}>
        {ALYA_ONLY.map(({ icon, label, route, desc }) => (
          <Card key={label}>
            <div style={{ fontSize: 24, marginBottom: 'var(--space-2)' }}>{icon}</div>
            <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 'var(--space-1)' }}>{label}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)', marginBottom: 'var(--space-2)',
            }}>{route}</div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.6 }}>{desc}</p>
          </Card>
        ))}
      </div>

      {/* Easter eggs */}
      <h3 className="section-title">Demo Highlights — Where to Look</h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.6 }}>
        These four scenarios are preloaded in the prototype. You don't need to create any data to find them — just navigate to the screen listed below each one.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {EASTER_EGGS.map(({ icon, label, where, what }) => (
          <Card key={label} style={{ borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 'var(--text-base)', marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-dark)',
                  background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
                  padding: '2px 10px', display: 'inline-block', marginBottom: 'var(--space-2)',
                }}>
                  {where}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.7 }}>{what}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick tip footer */}
      <Card style={{ background: 'var(--bg)', border: '1px dashed var(--border-dark)' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
          Quick tips for the demo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            'All state is session-only — refreshing the page resets everything to the seed data.',
            'Switch Role resets you to the login screen. Your in-session data persists until you reload.',
            'The "Post to Sage Intacct" button on the Invoice screen simulates a live integration — it shows a fake confirmation number and timestamp.',
            'The CFO rental approval toggle on the CFO Approval screen is a live control — flip it and submit a rental ticket to see the routing change.',
          ].map(tip => (
            <div key={tip} style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              <span style={{ flexShrink: 0 }}>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
