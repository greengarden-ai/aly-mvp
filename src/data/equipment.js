import { EQUIPMENT_STATUSES, EQUIPMENT_CATEGORIES } from './constants.js'

const YARD_LOCATIONS = ['Yard A — Midland', 'Yard B — Odessa', 'Yard C — San Antonio']

const CATEGORY_NAMES = {
  DRAWWORKS:     'Drawworks Unit',
  BOP_STACK:     'BOP Stack',
  MUD_PUMP:      'Mud Pump',
  TRAVELING_BLOCK: 'Traveling Block',
  SWIVEL:        'Swivel Assembly',
  TOP_DRIVE:     'Top Drive Unit',
  DRILL_COLLAR:  'Drill Collar Set',
  DRILL_PIPE:    'Drill Pipe Stand',
  CASING:        'Casing String',
  CONTAINER:     'Containment Unit',
  GENERATOR:     'Generator Set',
  TANK:          'Frac Tank',
  CHOKE_MANIFOLD:'Choke Manifold',
  ACCUMULATOR:   'Accumulator Unit',
  IRON_ROUGHNECK:'Iron Roughneck',
}

function buildEquipment() {
  const items = []
  const categories = EQUIPMENT_CATEGORIES
  let id = 1

  for (let i = 0; i < 50; i++) {
    const category = categories[i % categories.length]
    const num = Math.floor(i / categories.length) + 1
    const name = `${CATEGORY_NAMES[category]} ${String(num).padStart(2, '0')}`

    let status, jobId, location
    if (i < 30) {
      status = EQUIPMENT_STATUSES.IN_YARD
      jobId = null
      location = YARD_LOCATIONS[i % YARD_LOCATIONS.length]
    } else if (i < 44) {
      status = EQUIPMENT_STATUSES.ON_JOB
      jobId = i < 37 ? 'JOB-001' : i < 41 ? 'JOB-002' : 'JOB-003'
      location = null
    } else {
      status = EQUIPMENT_STATUSES.SUB_RENTED
      jobId = null
      location = 'Sub-Rented — External'
    }

    items.push({
      id: `EQ-${String(id).padStart(4, '0')}`,
      name,
      category,
      serialNumber: `SN-${category.slice(0, 3)}-${String(1000 + id).slice(1)}`,
      status,
      jobId,
      location,
    })
    id++
  }

  // Specific items referenced by easter eggs
  items.push({
    id: 'EQ-BOP-001',
    name: 'BOP Stack (Primary)',
    category: 'BOP_STACK',
    serialNumber: 'SN-BOP-4421',
    status: EQUIPMENT_STATUSES.ON_JOB,
    jobId: 'JOB-002',
    location: null,
  })

  return items
}

export const equipment = buildEquipment()
