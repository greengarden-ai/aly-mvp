export const ROLES = {
  CS_REP:       'CS_REP',
  FIELD_WORKER: 'FIELD_WORKER',
  BILLER:       'BILLER',
  APPROVER_STX: 'APPROVER_STX',
  APPROVER_WTX: 'APPROVER_WTX',
  ALYA:         'ALYA',
}

export const ROLE_LABELS = {
  CS_REP:       'CS Rep',
  FIELD_WORKER: 'Field Worker',
  BILLER:       'Biller',
  APPROVER_STX: 'Regional Approver (STX)',
  APPROVER_WTX: 'Regional Approver (WTX)',
  ALYA:         'Alya — CFO & Admin',
}

export const ROLE_DESCRIPTIONS = {
  CS_REP:       'Book jobs and manage customer order intake',
  FIELD_WORKER: 'Submit rig move and rental field tickets',
  BILLER:       'Review ticket completeness and release for approval',
  APPROVER_STX: 'Approve South Texas tickets (Jaime / Lindsey)',
  APPROVER_WTX: 'Approve West Texas tickets (Aaron)',
  ALYA:         'CFO pricing approval, exception queue, and full admin access',
}

export const ROLE_DEFAULT_ROUTES = {
  CS_REP:       '/cs/intake',
  FIELD_WORKER: '/fieldworker/rig-move',
  BILLER:       '/biller/tickets',
  APPROVER_STX: '/approver/routing',
  APPROVER_WTX: '/approver/routing',
  ALYA:         '/alya/dashboard',
}

export const TICKET_TYPES = {
  RIG_MOVE:     'RIG_MOVE',
  RENTAL:       'RENTAL',
  TRUCKING:     'TRUCKING',
  FIELD_TICKET: 'FIELD_TICKET',
}

export const TICKET_STATUSES = {
  DRAFT:                  'DRAFT',
  PENDING_BILLER:         'PENDING_BILLER',
  BILLER_APPROVED:        'BILLER_APPROVED',
  PENDING_APPROVER:       'PENDING_APPROVER',
  APPROVER_APPROVED:      'APPROVER_APPROVED',
  PENDING_CFO:            'PENDING_CFO',
  PENDING_ALYA_REVIEW:    'PENDING_ALYA_REVIEW',
  CFO_APPROVED:           'CFO_APPROVED',
  PENDING_SIGNATURE:      'PENDING_SIGNATURE',
  SIGNED:                 'SIGNED',
  INVOICED:               'INVOICED',
}

export const TICKET_STATUS_LABELS = {
  DRAFT:                  'Draft',
  PENDING_BILLER:         'Pending Biller Review',
  BILLER_APPROVED:        'Biller Approved',
  PENDING_APPROVER:       'Pending Regional Approval',
  APPROVER_APPROVED:      'Regionally Approved',
  PENDING_CFO:            'Pending CFO Approval',
  PENDING_ALYA_REVIEW:    'Pending Alya Review',
  CFO_APPROVED:           'CFO Approved',
  PENDING_SIGNATURE:      'Awaiting Signature',
  SIGNED:                 'Signed',
  INVOICED:               'Invoiced',
}

export const JOB_STATUSES = {
  DRAFT:    'DRAFT',
  ACTIVE:   'ACTIVE',
  INVOICED: 'INVOICED',
  CLOSED:   'CLOSED',
}

export const REGIONS = {
  STX: 'STX',
  WTX: 'WTX',
}

export const EQUIPMENT_STATUSES = {
  IN_YARD:    'IN_YARD',
  ON_JOB:     'ON_JOB',
  SUB_RENTED: 'SUB_RENTED',
}

export const EXCEPTION_TYPES = {
  DOUBLE_BOOKING:      'DOUBLE_BOOKING',
  SELF_MOVE_FLAGGED:   'SELF_MOVE_FLAGGED',
  PAST_SLA:            'PAST_SLA',
  ROUTING_COMPARISON:  'ROUTING_COMPARISON',
}

export const EXCEPTION_STATUS = {
  OPEN:     'OPEN',
  RESOLVED: 'RESOLVED',
}

export const SLA_DAYS = 30

export const EQUIPMENT_CATEGORIES = [
  'DRAWWORKS',
  'BOP_STACK',
  'MUD_PUMP',
  'TRAVELING_BLOCK',
  'SWIVEL',
  'TOP_DRIVE',
  'DRILL_COLLAR',
  'DRILL_PIPE',
  'CASING',
  'CONTAINER',
  'GENERATOR',
  'TANK',
  'CHOKE_MANIFOLD',
  'ACCUMULATOR',
  'IRON_ROUGHNECK',
]

export const OWNERSHIP_TYPES = {
  DMP:   'DMP',
  RBFOW: 'RBFOW',
  FB:    'FB',
  EMMP:  'EMMP',
}

export const CONTAINMENT_TYPES = [
  'Open Top',
  'Closed Top',
  'Poly',
  'Steel',
]
