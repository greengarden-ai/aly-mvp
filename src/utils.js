export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0)
}

export function genId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export function daysBetween(startStr, endStr) {
  if (!startStr || !endStr) return 0
  const ms = new Date(endStr) - new Date(startStr)
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export function computeStintTotal(stints) {
  return stints.reduce((total, s) => {
    if (!s.endDate) return total
    return total + daysBetween(s.startDate, s.endDate) * s.dailyRate
  }, 0)
}

export function isRigMoveComplete(ticket) {
  if (ticket.type !== 'RIG_MOVE') return true
  const hasRigUp = !!ticket.rigUpDate
  const hasRigDown = !!ticket.rigDownDate
  const allHaveTrucking = ticket.equipmentItems?.every(eq => eq.hasTruckingForm) ?? false
  const hasItems = (ticket.equipmentItems?.length ?? 0) > 0
  return hasRigUp && hasRigDown && allHaveTrucking && hasItems
}

export function getCustomer(customers, customerId) {
  return customers.find(c => c.id === customerId) ?? null
}

export function getJob(jobs, jobId) {
  return jobs.find(j => j.id === jobId) ?? null
}

export function getTicket(tickets, ticketId) {
  return tickets.find(t => t.id === ticketId) ?? null
}
