import {
  SET_ROLE, LOGOUT,
  CREATE_JOB, CREATE_TICKET, UPDATE_TICKET_STATUS,
  ADD_APPROVAL, ADD_SIGNATURE, CREATE_INVOICE, POST_INVOICE,
  ADD_EXCEPTION, RESOLVE_EXCEPTION,
  UPDATE_EQUIPMENT_STATUS, UPDATE_CONFIG,
} from './actions.js'

export function reducer(state, action) {
  switch (action.type) {

    case SET_ROLE:
      return { ...state, currentRole: action.payload }

    case LOGOUT:
      return { ...state, currentRole: null }

    case CREATE_JOB:
      return { ...state, jobs: [...state.jobs, action.payload] }

    case CREATE_TICKET:
      return { ...state, tickets: [...state.tickets, action.payload] }

    case UPDATE_TICKET_STATUS:
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.ticketId
            ? { ...t, status: action.payload.status, ...action.payload.updates }
            : t
        ),
      }

    case ADD_APPROVAL:
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.ticketId
            ? {
                ...t,
                status: action.payload.newStatus,
                approvalChain: [...t.approvalChain, action.payload.entry],
              }
            : t
        ),
      }

    case ADD_SIGNATURE:
      return {
        ...state,
        signatures: [...state.signatures, action.payload.signature],
        tickets: state.tickets.map(t =>
          t.id === action.payload.ticketId
            ? { ...t, status: 'SIGNED', signatureId: action.payload.signature.id }
            : t
        ),
      }

    case CREATE_INVOICE:
      return {
        ...state,
        invoices: [...state.invoices, action.payload.invoice],
        tickets: state.tickets.map(t =>
          action.payload.ticketIds.includes(t.id)
            ? { ...t, status: 'INVOICED', invoiceId: action.payload.invoice.id }
            : t
        ),
      }

    case POST_INVOICE:
      return {
        ...state,
        invoices: state.invoices.map(inv =>
          inv.id === action.payload.invoiceId
            ? {
                ...inv,
                status: 'POSTED',
                intacctPostId: action.payload.intacctPostId,
                intacctPostedAt: action.payload.postedAt,
              }
            : inv
        ),
      }

    case ADD_EXCEPTION:
      return { ...state, exceptions: [...state.exceptions, action.payload] }

    case RESOLVE_EXCEPTION:
      return {
        ...state,
        exceptions: state.exceptions.map(ex =>
          ex.id === action.payload.exceptionId
            ? {
                ...ex,
                status: 'RESOLVED',
                resolvedAt: action.payload.resolvedAt,
                resolvedBy: action.payload.resolvedBy,
                notes: action.payload.notes || ex.notes,
              }
            : ex
        ),
      }

    case UPDATE_EQUIPMENT_STATUS:
      return {
        ...state,
        equipment: state.equipment.map(eq =>
          eq.id === action.payload.equipmentId
            ? { ...eq, status: action.payload.status, jobId: action.payload.jobId ?? null }
            : eq
        ),
      }

    case UPDATE_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      }

    default:
      return state
  }
}
