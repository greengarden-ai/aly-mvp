/**
 * Price Books Data - v1.1 DEMO/PLACEHOLDER
 * Mock data extracted from Alya's pricing PDFs
 * Full price book management & calculations coming in v1.2
 */

export const priceBooks = {
  "sm-energy": {
    id: "sm-energy",
    name: "SM Energy",
    contact: "Jaime Salinas",
    rigs: {
      "x19": {
        name: "X19",
        equipmentRate: { value: 5000, unit: "day" },
        trucking: { value: 350, unit: "flat" },
        mobilization: { value: 2000, unit: "range", max: 5000 },
        containment: { value: 1200, unit: "day" },
      },
      "103": {
        name: "103",
        equipmentRate: { value: 4500, unit: "day" },
        trucking: { value: 300, unit: "flat" },
        mobilization: { value: 1800, unit: "range", max: 4500 },
        containment: { value: 1000, unit: "day" },
      },
    },
  },
  "trailblazer": {
    id: "trailblazer",
    name: "Trailblazer Yard",
    contact: "Jaime Salinas",
    locations: {
      "trailblazer-yard": {
        name: "Trailblazer",
        items: [
          {
            description: "(7) 500BBL Mud Circulating Tanks and Containment walls",
            rate: 6300,
            unit: "month",
          },
          {
            description: "Trucking for (7) 500BBL Mud Circulating Tanks and Containment",
            rate: 3000,
            unit: "total",
          },
          {
            description: "15K Extendaboom Forklift (Used for Aly Equipment), Trucking Forklift to and From Location",
            rate: 275,
            unit: "day",
          },
          {
            description: "Rig Up or Down (7) 500BBL Mud Circulating Tanks and Containment",
            rate: 2500,
            unit: "total",
          },
          {
            description: "30mil Liner",
            rate: 2800,
            unit: "total",
          },
          {
            description: "Environmental Disposal for Liner",
            rate: 450,
            unit: "each",
          },
          {
            description: "Washout OBM Tank",
            rate: 950,
            unit: "each",
          },
        ],
      },
    },
  },
  "exco-sr": {
    id: "exco-sr",
    name: "Exco SR",
    contact: "Operations Manager",
    locations: {
      "exco-sr-main": {
        name: "Standard Rate",
        items: [
          {
            description: "Equipment Rental",
            rate: 4200,
            unit: "day",
          },
          {
            description: "Trucking",
            rate: 250,
            unit: "flat",
          },
        ],
      },
    },
  },
};

/**
 * Helper function to get available price books for a customer
 */
export const getPriceBooksForCustomer = (customerId) => {
  const customer = priceBooks[customerId];
  if (!customer) return [];

  if (customer.rigs) {
    return Object.entries(customer.rigs).map(([key, rig]) => ({
      key,
      name: rig.name,
      type: "rig",
    }));
  }

  if (customer.locations) {
    return Object.entries(customer.locations).map(([key, location]) => ({
      key,
      name: location.name,
      type: "location",
    }));
  }

  return [];
};

/**
 * Helper function to get full price book details
 */
export const getPriceBookDetails = (customerId, bookKey) => {
  const customer = priceBooks[customerId];
  if (!customer) return null;

  if (customer.rigs && customer.rigs[bookKey]) {
    return {
      customer: customer.name,
      type: "rig",
      name: customer.rigs[bookKey].name,
      ...customer.rigs[bookKey],
    };
  }

  if (customer.locations && customer.locations[bookKey]) {
    return {
      customer: customer.name,
      type: "location",
      name: customer.locations[bookKey].name,
      items: customer.locations[bookKey].items,
    };
  }

  return null;
};

export default priceBooks;
