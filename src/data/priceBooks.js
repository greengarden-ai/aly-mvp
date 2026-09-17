// v1.1 ACTUAL: Price book data from customer service sheets
// Source: SM Energy SR 4-14-2026.xlsx (Lindsey Tillery)
// Updated: September 16, 2026

export const priceBooks = {
  "sm-energy": {
    name: "SM Energy",
    contact: "Lindsey Tillery (979) 540-9217",
    email: "lindsey.tillery@alyenergy.com",
    rigs: {
      "X19": {
        name: "SM Energy X19",
        description: "Surface Rental Equipment Quote - X19",
        dailyEquipment: [
          { description: "500BBL Mobile Roundbottom Mud Circulating Tank", rate: 30, unit: "day" },
          { description: "500BBL Mobile Flat Bottom Frac Tank", rate: 25, unit: "day" },
          { description: "200BBL Heavy Duty Flatbottom Opentop Tank", rate: 35, unit: "day" },
          { description: "Diesel Powered (6 cyl) Mud Pump - 8x6 includes 100' of 4\"x20' of hoses", rate: 110, unit: "day" },
          { description: "20' Hose with Aly Equipment", rate: 3, unit: "day" },
          { description: "36\" Poly Containment Walls with Stairs Around 10 Tanks and a Pump", rate: 85, unit: "day" },
          { description: "Heavy Duty Drive Overs (Mud or Flare)", rate: 20, unit: "day" },
          { description: "15K Extendaboom Forklift (Used for Aly Equipment)", rate: 250, unit: "day" }
        ],
        saleItems: [
          { description: "30mil Liner Per Location for 10 Tanks, With (1-2) Pump(s)", rate: 5000, unit: "per location" }
        ],
        rigup: {
          inFieldMove: { rate: 11700, distance: "0-10 miles", unit: "flat", additionalPerTenMiles: 1100 },
          initialRigupOrFinalRigdown: { rate: 16250, unit: "flat" }
        },
        services: [
          { description: "Hauling (Flatbottoms, Open Tops, and All Other Equipment) with Winch Truck", rate: 135, unit: "hourly" },
          { description: "Crew Leader", rate: 49, unit: "hourly" },
          { description: "Roustabout", rate: 41, unit: "hourly" },
          { description: "Truck and Tools", rate: 45, unit: "hourly" }
        ],
        washout: [
          { description: "Washout Water Tank", rate: 550, unit: "each" },
          { description: "Washout OBM Roundbottom Tank", rate: 950, unit: "each" }
        ],
        disposal: [
          { description: "Environmental Disposal Fee of Containment Liner per Move", rate: 400, unit: "each" }
        ]
      },
      "103": {
        name: "SM Energy 103",
        description: "Surface Rental Equipment Quote - 103",
        dailyEquipment: [
          { description: "500BBL Mobile Roundbottom Mud Circulating Tank", rate: 30, unit: "day" },
          { description: "500BBL Mobile Flat Bottom Frac Tank", rate: 25, unit: "day" },
          { description: "200BBL Heavy Duty Flatbottom Opentop Tank", rate: 35, unit: "day" },
          { description: "Diesel Powered (6 cyl) Mud Pump - 8x6 includes 100' of 4\"x20' of hoses", rate: 110, unit: "day" },
          { description: "20' Hose with Aly Equipment", rate: 3, unit: "day" },
          { description: "36\" Poly Containment Walls with Stairs Around 10 Tanks, Mud Mixing Plant and a Pump", rate: 115, unit: "day" },
          { description: "Heavy Duty Drive Overs (Mud or Flare)", rate: 20, unit: "day" },
          { description: "15K Extendaboom Forklift (Used for Aly Equipment)", rate: 250, unit: "day" }
        ],
        saleItems: [
          { description: "30mil Liner Per Location for 10 Tanks, With (1-2) Pump(s), and Mud Mixing Plant", rate: 6000, unit: "per location" }
        ],
        rigup: {
          inFieldMove: { rate: 13750, distance: "0-10 miles", unit: "flat", additionalPerTenMiles: 1100 },
          initialRigupOrFinalRigdown: { rate: 17500, unit: "flat" }
        },
        services: [
          { description: "Hauling (Flatbottoms, Open Tops, and All Other Equipment) with Winch Truck", rate: 135, unit: "hourly" },
          { description: "Crew Leader", rate: 49, unit: "hourly" },
          { description: "Roustabout", rate: 41, unit: "hourly" },
          { description: "Truck and Tools", rate: 45, unit: "hourly" }
        ],
        washout: [
          { description: "Washout Water Tank", rate: 550, unit: "each" },
          { description: "Washout OBM Roundbottom Tank", rate: 950, unit: "each" }
        ],
        disposal: [
          { description: "Environmental Disposal Fee of Containment Liner per Move", rate: 400, unit: "each" }
        ]
      }
    }
  },
  "trailblazer": {
    name: "Trailblazer Yard",
    contact: "TBD",
    rigs: {
      "Trailblazer": {
        description: "Placeholder — awaiting pricing documentation"
      }
    }
  },
  "exco-sr": {
    name: "Exco SR",
    contact: "TBD",
    rigs: {
      "Standard": {
        description: "Placeholder — awaiting pricing documentation"
      }
    }
  }
};

export function getPriceBooksForCustomer(customerId) {
  const customer = priceBooks[customerId];
  if (!customer) return null;
  
  const books = customer.rigs ? Object.keys(customer.rigs) : [];
  
  return {
    name: customer.name,
    books,
    contact: customer.contact
  };
}

export function getPriceBookDetails(customerId, rigOrLocationKey) {
  const customer = priceBooks[customerId];
  if (!customer) return null;
  
  if (customer.rigs && customer.rigs[rigOrLocationKey]) {
    return customer.rigs[rigOrLocationKey];
  }
  
  return null;
}
