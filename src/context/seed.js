import { equipment } from '../data/equipment.js'
import {
  TICKET_STATUSES,
  JOB_STATUSES,
  EQUIPMENT_STATUSES,
  EXCEPTION_STATUS,
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

  // ── Customers ────────────────────────────────────────────
  customers: [
    {
      id: 'CUST-A',
      name: 'Permian Basin Resources LLC',
      region: 'STX',
      contact: 'Jane Sample',
      email: 'jane@pbr-sample.example',
      phone: '(432) 555-0101',
    },
    {
      id: 'CUST-B',
      name: 'Gulf Coast Upstream LLC',
      region: 'STX',
      contact: 'Robert Marsh',
      email: 'rmarsh@gcu-sample.example',
      phone: '(713) 555-0188',
    },
    {
      id: 'CUST-C',
      name: 'Lone Star Extraction Partners',
      region: 'WTX',
      contact: 'Tom Whitfield',
      email: 'tom@lsep-sample.example',
      phone: '(432) 555-0255',
    },
    {
      id: 'CUST-D',
      name: 'Desert Ridge Operating Co.',
      region: 'WTX',
      contact: 'Maria Salazar',
      email: 'msalazar@dro-sample.example',
      phone: '(432) 555-0302',
    },
    {
      id: 'CUST-E',
      name: 'Maverick Oilfield Services',
      region: 'STX',
      contact: 'Chad Burnett',
      email: 'chad@maverick-sample.example',
      phone: '(210) 555-0477',
    },
  ],

  // ── Jobs ─────────────────────────────────────────────────
  jobs: [
    {
      id: 'JOB-001',
      customerId: 'CUST-A',
      region: 'STX',
      wellName: 'PBR Well A-1',
      status: JOB_STATUSES.ACTIVE,
      createdAt: '2026-06-15T08:00:00Z',
      createdBy: 'u-005',
      notes: 'Standard rig move. No known complications.',
    },
    {
      id: 'JOB-002',
      customerId: 'CUST-B',
      region: 'STX',
      wellName: 'GCU Well B-3',
      status: JOB_STATUSES.ACTIVE,
      createdAt: '2026-06-20T09:30:00Z',
      createdBy: 'u-005',
      notes: 'Rental equipment carried over from prior job. Verify closure.',
    },
    {
      id: 'JOB-003',
      customerId: 'CUST-C',
      region: 'WTX',
      wellName: 'LSE Well C-7',
      status: JOB_STATUSES.ACTIVE,
      createdAt: '2026-07-01T07:00:00Z',
      createdBy: 'u-006',
      notes: '',
    },
    {
      id: 'JOB-004',
      customerId: 'CUST-D',
      region: 'WTX',
      wellName: 'DRO Well D-2',
      status: JOB_STATUSES.ACTIVE,
      createdAt: '2026-07-05T10:00:00Z',
      createdBy: 'u-006',
      notes: 'Equipment relocated with rig. Flagged for review.',
    },
    {
      id: 'JOB-005',
      customerId: 'CUST-E',
      region: 'STX',
      wellName: 'Maverick Well E-1',
      status: JOB_STATUSES.ACTIVE,
      createdAt: '2026-07-10T08:00:00Z',
      createdBy: 'u-013',
      notes: 'New customer. Baseline job, no issues anticipated.',
    },
  ],

  // ── Field Tickets ─────────────────────────────────────────
  // Stage 1: minimal placeholder tickets. Easter egg content added in Stage 3.
  tickets: [
    // JOB-001 STX — rig move, mid-flow (for routing demo)
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
        {
          equipmentId: 'EQ-0001',
          description: 'Drawworks Unit 01',
          ownership: 'DMP',
          serialNumber: 'SN-DRA-1001',
          quantity: 1,
          containmentType: 'Steel',
          containmentSize: '20 BBL',
          hasTruckingForm: true,
        },
        {
          equipmentId: 'EQ-0002',
          description: 'BOP Stack 01',
          ownership: 'DMP',
          serialNumber: 'SN-BOP-1002',
          quantity: 1,
          containmentType: 'Steel',
          containmentSize: '10 BBL',
          hasTruckingForm: true,
        },
      ],
      hasTruckingFormForAll: true,
      billerNotes: 'All forms present. Releasing for approval.',
      approvalChain: [
        { step: 'BILLER', approvedBy: 'u-001', approvedAt: '2026-06-19T09:00:00Z', notes: '' },
      ],
      exceptionFlags: [],
      selfMove: false,
      signatureId: null,
      invoiceId: null,
    },

    // JOB-003 WTX — rig move, pending biller (comparison job for routing easter egg)
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
        {
          equipmentId: 'EQ-0016',
          description: 'Top Drive Unit 01',
          ownership: 'DMP',
          serialNumber: 'SN-TOP-1016',
          quantity: 1,
          containmentType: 'Open Top',
          containmentSize: '15 BBL',
          hasTruckingForm: true,
        },
      ],
      hasTruckingFormForAll: true,
      billerNotes: '',
      approvalChain: [
        { step: 'BILLER', approvedBy: 'u-012', approvedAt: '2026-07-04T08:00:00Z', notes: '' },
      ],
      exceptionFlags: [],
      selfMove: false,
      signatureId: null,
      invoiceId: null,
    },

    // JOB-005 STX — rental, clean baseline
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
        {
          id: 'STINT-005-A',
          startDate: '2026-07-10',
          endDate: '2026-07-20',
          dailyRate: 350,
          notes: '',
        },
      ],
      billerNotes: '',
      approvalChain: [],
      exceptionFlags: [],
      daysOpen: 10,
      signatureId: null,
      invoiceId: null,
    },
  ],

  // ── Exceptions ────────────────────────────────────────────
  // Stage 1: empty. Four easter eggs preloaded in Stage 3.
  exceptions: [],

  // ── Signatures ────────────────────────────────────────────
  signatures: [],

  // ── Invoices ─────────────────────────────────────────────
  invoices: [],

  // ── Equipment ────────────────────────────────────────────
  equipment,
}
