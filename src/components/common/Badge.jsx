const STATUS_CLASS_MAP = {
  // Ticket statuses
  DRAFT:               'badge-draft',
  PENDING_BILLER:      'badge-pending',
  BILLER_APPROVED:     'badge-approved',
  PENDING_APPROVER:    'badge-pending',
  APPROVER_APPROVED:   'badge-approved',
  PENDING_CFO:         'badge-pending',
  CFO_APPROVED:        'badge-approved',
  PENDING_SIGNATURE:   'badge-pending',
  SIGNED:              'badge-signed',
  INVOICED:            'badge-closed',
  // Equipment
  IN_YARD:             'badge-in-yard',
  ON_JOB:              'badge-on-job',
  SUB_RENTED:          'badge-sub-rented',
  // Job
  ACTIVE:              'badge-approved',
  CLOSED:              'badge-closed',
  // Exception
  OPEN:                'badge-flagged',
  RESOLVED:            'badge-approved',
  // Generic
  flagged:             'badge-flagged',
  pending:             'badge-pending',
  approved:            'badge-approved',
  draft:               'badge-draft',
}

const STATUS_LABEL_MAP = {
  PENDING_BILLER:    'Pending Biller',
  BILLER_APPROVED:   'Biller Approved',
  PENDING_APPROVER:  'Pending Approval',
  APPROVER_APPROVED: 'Regionally Approved',
  PENDING_CFO:       'Pending CFO',
  CFO_APPROVED:      'CFO Approved',
  PENDING_SIGNATURE: 'Awaiting Signature',
  IN_YARD:           'In Yard',
  ON_JOB:            'On Job',
  SUB_RENTED:        'Sub-Rented',
}

export default function Badge({ status, label, className = '' }) {
  const cls = STATUS_CLASS_MAP[status] ?? 'badge-draft'
  const text = label ?? STATUS_LABEL_MAP[status] ?? status
  return (
    <span className={`badge ${cls} ${className}`}>
      {text}
    </span>
  )
}
