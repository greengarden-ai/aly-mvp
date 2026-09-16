import { equipment } from '../data/equipment.js'
import { priceBooks } from '../data/priceBooks.js'
import {
  TICKET_STATUSES,
  JOB_STATUSES,
} from '../data/constants.js'

export const initialState = {
  // ── Session ──────────────────────────────────────────────
  currentRole: null,

  // ── Config Toggles ───────────────────────────────────────
  config: {
    requireCFOApprovalOnRentals: true,
    rentalSLADays: 30,
    routingRules: {
      STX: ['ALYA', 'JAIME', 'LINDSEY', 'CUSTOMER'],
      WTX: ['ALYA', 'AARON', 'CUSTOMER'],
    },
  },

  // ── Price Books ──────────────────────────────────────────
  priceBooks,
  activePriceBooks: {},  // Keyed by jobId: { [jobId]: "sm-energy#x19" }

  // ── Customers ────────────────────────────────────────────
  customers: [
    { id: 'CUST-A', name: 'Permian Basin Resources LLC',    region: 'STX', contact: 'Jane Sample',    email: 'jane@pbr-sample.example',      phone: '(432) 555-0101' },
    { id: 'CUST-B', name: 'Gulf Coast Upstream LLC',        region: 'STX', contact: 'Robert Marsh',   email: 'rmarsh@gcu-sample.example',    phone: '(713) 555-0188' },
    { id: 'CUST-C', name: 'Lone Star Extraction Partners',  region: 'WTX', contact: 'Tom Whitfield',  email: 'tom@lsep-sample.example',      phone: '(432) 555-0255' },
    { id: 'CUST-D', name: 'Desert Ridge Operating Co.',     region: 'WTX', contact: 'Maria Salazar',  email: 'msalazar@dro-sample.example',  phone: '(432) 555-0302' },
    { id: 'CUST-E', name: 'Maverick Oilfield Services',     region: 'STX', contact: 'Chad Burnett',   email: 'chad@maverick-sample.example', phone: '(210) 555-0477' },
  ],

  // ── Jobs ─────────────────────────────────────────────────
  jobs: [
    { id: 'JOB-001', jobNumber: '2816', customerId: 'CUST-A', region: 'STX', wellName: 'PBR Well A-1',      lease: 'PBR Well A-1 Pad',        rig: 'Cactus 140',    status: JOB_STATUSES.ACTIVE, createdAt: '2026-06-15T08:00:00Z', createdBy: 'u-005', notes: 'Standard rig move. No known complications.' },
    { id: 'JOB-002', jobNumber: '2840', customerId: 'CUST-B', region: 'STX', wellName: 'GCU Well B-3',      lease: 'GCU Well B-3 Location',   rig: 'H&P 537',       status: JOB_STATUSES.ACTIVE, createdAt: '2026-06-20T09:30:00Z', createdBy: 'u-005', notes: 'Rental equipment carried over from prior job. Verify closure.' },
    { id: 'JOB-003', jobNumber: '2807', customerId: 'CUST-C', region: 'WTX', wellName: 'LSE Well C-7',      lease: 'LSE Well C-7 Pad',         rig: 'H&P 430',       status: JOB_STATUSES.ACTIVE, createdAt: '2026-07-01T07:00:00Z', createdBy: 'u-006', notes: '' },
    { id: 'JOB-004', jobNumber: '2810', customerId: 'CUST-D', region: 'WTX', wellName: 'DRO Well D-2',      lease: 'DRO Well D-2 Site',        rig: 'Ensign 103',    status: JOB_STATUSES.ACTIVE, createdAt: '2026-07-05T10:00:00Z', createdBy: 'u-006', notes: 'Equipment relocated with rig. Flagged for review.' },
    { id: 'JOB-005', jobNumber: '2855', customerId: 'CUST-E', region: 'STX', wellName: 'Maverick Well E-1', lease: 'Maverick Well E-1 Pad',    rig: 'Patterson 219', status: JOB_STATUSES.ACTIVE, createdAt: '2026-07-10T08:00:00Z', createdBy: 'u-013', notes: 'New customer. Baseline job, no issues anticipated.' },
  ],

  // ── Field Tickets ─────────────────────────────────────────
  tickets: [
    // ── JOB-001 STX — rig move in approval flow (routing comparison, Easter egg #4)
    {
      id: 'TKT-RM-001',
      type: 'RIG_MOVE',
      jobId: 'JOB-001',
      region: 'STX',
      status: TICKET_STATUSES.PENDING_APPROVER,
      fieldWorkerId: 'u-007',
      submittedAt: '2026-06-18T14:30:00Z',
      rigUpDate: '2026-06-16',
      rigDownDate: '2026-06-18',
      crewSource: 'Aly Energy — STX Crew 2',
      managerApproval: 'Kyle Odom',
      equipmentItems: [
        { equipmentId: 'EQ-0001', description: 'Drawworks Unit 01', ownership: 'DMP', serialNumber: 'SN-DRA-1001', quantity: 1, containmentType: 'Steel',    containmentSize: '20 BBL', hasTruckingForm: true },
        { equipmentId: 'EQ-0002', description: 'BOP Stack 01',      ownership: 'DMP', serialNumber: 'SN-BOP-1002', quantity: 1, containmentType: 'Steel',    containmentSize: '10 BBL', hasTruckingForm: true },
      ],
      hasTruckingFormForAll: true,
      billerNotes: 'All forms present. Releasing for approval.',
      approvalChain: [{ step: 'BILLER', approvedBy: 'u-001', approvedAt: '2026-06-19T09:00:00Z', notes: '' }],
      exceptionFlags: [],
      selfMove: false,
      signatureId: null,
      invoiceId: null,
    },

    // ── JOB-002 STX — rental with DOUBLE_BOOKING + PAST_SLA (Easter eggs #1 & #3)
    {
      id: 'TKT-RT-002',
      type: 'RENTAL',
      jobId: 'JOB-002',
      region: 'STX',
      status: TICKET_STATUSES.PENDING_BILLER,
      fieldWorkerId: 'u-008',
      submittedAt: '2026-07-01T09:00:00Z',
      wellName: 'GCU Well B-3',
      stints: [
        {
          // Prior job rental — never closed. $475/day still running.
          id: 'STINT-002-PRIOR',
          startDate: '2026-05-15',
          endDate: null,          // OPEN — the root cause of the double-booking
          dailyRate: 475,
          notes: 'Carried over from prior job (JOB-PREV-18). Rental period was never formally closed.',
        },
        {
          // New rental opened for same equipment on the current job
          id: 'STINT-002-NEW',
          startDate: '2026-07-01',
          endDate: null,          // OPEN — running concurrently
          dailyRate: 475,
          notes: 'New rental period opened on JOB-002 for same BOP Stack.',
        },
      ],
      billerNotes: '',
      approvalChain: [],
      // $475 × 27 days of overlap (2026-07-01 through 2026-07-28 when detected)
      exceptionFlags: ['DOUBLE_BOOKING', 'PAST_SLA'],
      daysOpen: 47,
      signatureId: null,
      invoiceId: null,
    },

    // ── JOB-003 WTX — rig move in approval flow (routing comparison, Easter egg #4)
    {
      id: 'TKT-RM-003',
      type: 'RIG_MOVE',
      jobId: 'JOB-003',
      region: 'WTX',
      status: TICKET_STATUSES.PENDING_APPROVER,
      fieldWorkerId: 'u-009',
      submittedAt: '2026-07-03T11:00:00Z',
      rigUpDate: '2026-07-01',
      rigDownDate: '2026-07-03',
      crewSource: 'Aly Energy — WTX Crew 1',
      managerApproval: 'Deon Harlow',
      equipmentItems: [
        { equipmentId: 'EQ-0016', description: 'Top Drive Unit 01', ownership: 'DMP', serialNumber: 'SN-TOP-1016', quantity: 1, containmentType: 'Open Top', containmentSize: '15 BBL', hasTruckingForm: true },
      ],
      hasTruckingFormForAll: true,
      billerNotes: '',
      approvalChain: [{ step: 'BILLER', approvedBy: 'u-012', approvedAt: '2026-07-04T08:00:00Z', notes: '' }],
      exceptionFlags: [],
      selfMove: false,
      signatureId: null,
      invoiceId: null,
    },

    // ── JOB-004 WTX — rig self-move (Easter egg #2)
    {
      id: 'TKT-RM-004',
      type: 'RIG_MOVE',
      jobId: 'JOB-004',
      region: 'WTX',
      status: TICKET_STATUSES.PENDING_BILLER,
      fieldWorkerId: null,        // No field worker — equipment moved with the rig itself
      submittedAt: '2026-07-08T08:00:00Z',
      rigUpDate: '2026-07-05',
      rigDownDate: '2026-07-07',
      crewSource: 'N/A — Self-Move',
      managerApproval: 'Aaron Griffith',
      equipmentItems: [
        { equipmentId: 'EQ-BOP-001', description: 'BOP Stack (Primary)', ownership: 'DMP', serialNumber: 'SN-BOP-4421', quantity: 1, containmentType: 'Steel', containmentSize: '10 BBL', hasTruckingForm: false },
        { equipmentId: 'EQ-0031',    description: 'Generator Set 01',    ownership: 'RBFOW', serialNumber: 'SN-GEN-1031', quantity: 1, containmentType: 'Poly',  containmentSize: '5 BBL',  hasTruckingForm: false },
      ],
      hasTruckingFormForAll: false,
      billerNotes: 'FLAGGED: Equipment relocated with rig during transit. No field event was created — this movement is not captured in KPA/JobUTrax. Manually flagged for audit trail.',
      approvalChain: [],
      exceptionFlags: ['SELF_MOVE_FLAGGED'],
      selfMove: true,
      signatureId: null,
      invoiceId: null,
    },

    // ── JOB-005 STX — rental, clean baseline (no exceptions)
    {
      id: 'TKT-RT-005',
      type: 'RENTAL',
      jobId: 'JOB-005',
      region: 'STX',
      status: TICKET_STATUSES.PENDING_BILLER,
      fieldWorkerId: 'u-008',
      submittedAt: '2026-07-12T10:00:00Z',
      wellName: 'Maverick Well E-1',
      stints: [
        { id: 'STINT-005-A', startDate: '2026-07-10', endDate: '2026-07-20', dailyRate: 350, notes: '' },
      ],
      billerNotes: '',
      approvalChain: [],
      exceptionFlags: [],
      daysOpen: 10,
      signatureId: null,
      invoiceId: null,
    },
  ],

  // ── Exceptions — four preloaded easter eggs ───────────────
  exceptions: [
    // Easter egg #1: Double-booking
    {
      id: 'EX-001',
      type: 'DOUBLE_BOOKING',
      ticketId: 'TKT-RT-002',
      jobId: 'JOB-002',
      detectedAt: '2026-07-28T00:00:00Z',
      status: 'OPEN',
      resolvedAt: null,
      resolvedBy: null,
      amount: 12825,   // $475/day × 27 days of overlap
      equipmentId: 'EQ-BOP-001',
      equipmentName: 'BOP Stack (Primary) — SN-BOP-4421',
      notes: "Prior rental period on JOB-PREV-18 was never formally closed before BOP Stack was rebooked on JOB-002. Two open rental periods running concurrently for the same equipment — $475/day × 27 days = $12,825 in duplicate charges before detection.",
    },

    // Easter egg #2: Rig self-move
    {
      id: 'EX-002',
      type: 'SELF_MOVE_FLAGGED',
      ticketId: 'TKT-RM-004',
      jobId: 'JOB-004',
      detectedAt: '2026-07-08T08:00:00Z',
      status: 'OPEN',
      resolvedAt: null,
      resolvedBy: null,
      amount: null,
      equipmentId: 'EQ-BOP-001',
      equipmentName: 'BOP Stack (Primary) + Generator Set 01',
      notes: "Equipment relocated with the rig during transit to DRO Well D-2. No Field Worker tablet event was created. This movement type is invisible in KPA/JobUTrax — equipment simply appears at the new location. Platform captures it here via manual flag and preserves the audit trail.",
    },

    // Easter egg #3: Past SLA
    {
      id: 'EX-003',
      type: 'PAST_SLA',
      ticketId: 'TKT-RT-002',
      jobId: 'JOB-002',
      detectedAt: '2026-08-10T00:00:00Z',
      status: 'OPEN',
      resolvedAt: null,
      resolvedBy: null,
      amount: null,
      daysOpen: 47,
      notes: "Rental ticket TKT-RT-002 (GCU Well B-3) has been open for 47 days without resolution — exceeding the 30-day SLA threshold by 17 days. Ticket involves an unresolved double-booking that is pending billing team action.",
    },

    // Easter egg #4: STX vs WTX routing comparison (demo highlight, not an error)
    {
      id: 'EX-004',
      type: 'ROUTING_COMPARISON',
      ticketIds: ['TKT-RM-001', 'TKT-RM-003'],
      jobIds: ['JOB-001', 'JOB-003'],
      detectedAt: null,
      status: 'OPEN',
      resolvedAt: null,
      resolvedBy: null,
      amount: null,
      notes: "Two active rig move tickets — one STX (JOB-001, Permian Basin Resources), one WTX (JOB-003, Lone Star Extraction Partners) — showing different approval chains side by side. STX requires Alya → Jaime → Lindsey → Customer. WTX routes Alya → Aaron → Customer. Same ticket type, different paths, modeled as a real rule.",
    },
  ],

  // ── Signatures ────────────────────────────────────────────
  signatures: [],

  // ── Invoices — two seed invoices for dashboard aging demo ─
  invoices: [
    {
      id: 'INV-SEED-001',
      ticketIds: ['TKT-RM-001'],
      jobId: 'JOB-001',
      status: 'DRAFT',
      totalAmount: 0,
      intacctPostId: null,
      intacctPostedAt: null,
      createdAt: '2026-06-22T08:00:00Z',  // 61 days old — 60+ aging bucket
    },
    {
      id: 'INV-SEED-002',
      ticketIds: ['TKT-RM-003'],
      jobId: 'JOB-003',
      status: 'DRAFT',
      totalAmount: 0,
      intacctPostId: null,
      intacctPostedAt: null,
      createdAt: '2026-07-12T08:00:00Z',  // 41 days old — 31-60 aging bucket
    },
  ],

  // ── Equipment ────────────────────────────────────────────
  equipment,
}
