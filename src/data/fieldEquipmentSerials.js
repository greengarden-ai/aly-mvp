// Aly-owned serial numbers by field equipment type.
// STUB — production version pulls live from Equipment Inventory master (~849 assets).
// Sub-Rented entries (free-form serial + vendor) write back to inventory in V1.
export const ownedSerialsByType = {
  DMP:   ['DMP-5', 'DMP-7', 'DMP-13', 'DMP-18', 'DMP-22', 'DMP-31', 'DMP-44'],
  RBFOW: ['RBFOW-11', 'RBFOW-22', 'RBFOW-63', 'RBFOW-88', 'RBFOW-104', 'RBFOW-117'],
  FB:    ['FB-928', 'FB-2402', 'FB-2572', 'FB-3001', 'FB-3210', 'FB-3445'],
  EMMP:  ['EMMP-4', 'EMMP-9', 'EMMP-15', 'EMMP-23'],
}
