// src/types/restaurant.ts
export const MOCK_RECIPES = [
  {
    id: "rec-1",
    hotelId: "h-1",
    branchId: "b-1",
    menuItemId: "mi-101",
    name: "Pan-Seared Ribeye Steak",
    description:
      "Prime cut ribeye with garlic herb compound butter, roasted asparagus, and truffle potato mash.",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    category: "MAIN_COURSE",
    yieldQuantity: 1,
    yieldUnit: { id: "u-1", name: "Portion", abbreviation: "port" },
    preparationInstructions:
      "1. Pat steaks dry and season aggressively with sea salt and cracked pepper.\n2. Sear in a screaming hot cast-iron skillet with grapeseed oil for 3 minutes per side.\n3. Toss in crushed garlic, rosemary sprigs, and compound butter to baste for final 60 seconds.\n4. Rest precisely 5 minutes before slicing across the grain to preserve juices.\n5. Plate with mash at 10 o'clock, asparagus spanning across, and steak rested atop.",
    status: "ACTIVE",
    totalCostCents: 850,
    sellingPriceCents: 3400,
    estimatedProfitCents: 2550,
    estimatedProfitMargin: 75.0,
    ingredients: [
      {
        id: "i-1",
        name: "Prime Ribeye Cut",
        quantity: 14,
        unit: "oz",
        isAllergen: false,
      },
      {
        id: "i-2",
        name: "Compound Herb Butter",
        quantity: 1.5,
        unit: "oz",
        isAllergen: true,
      },
      {
        id: "i-3",
        name: "Fresh Asparagus Speared",
        quantity: 5,
        unit: "pcs",
        isAllergen: false,
      },
      {
        id: "i-4",
        name: "Truffle Paste & Cream Mash",
        quantity: 6,
        unit: "oz",
        isAllergen: true,
      },
    ],
  },
  {
    id: "rec-2",
    hotelId: "h-1",
    branchId: "b-1",
    menuItemId: "mi-102",
    name: "Crispy Calamari Fritti",
    description:
      "Tender squid rings dusted in seasoned flour, flash-fried, served with citrus aioli.",
    imageUrl:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    category: "APPETIZER",
    yieldQuantity: 1,
    yieldUnit: { id: "u-1", name: "Portion", abbreviation: "port" },
    preparationInstructions:
      "1. Soak squid rings in seasoned buttermilk for minimum 15 minutes.\n2. Dredge lightly through seasoned cornstarch mixture.\n3. Flash-fry at 375°F for exactly 90 seconds until light blonde golden.\n4. Drain immediately, dusting lightly with sea salt and fresh lemon zest.\n5. Serve over structural grease-wicking paper with a side cold-cup of lemon aioli.",
    status: "ACTIVE",
    totalCostCents: 320,
    sellingPriceCents: 1450,
    estimatedProfitCents: 1130,
    estimatedProfitMargin: 77.9,
    ingredients: [
      {
        id: "i-5",
        name: "Squid Tube & Tentacles",
        quantity: 8,
        unit: "oz",
        isAllergen: false,
      },
      {
        id: "i-6",
        name: "Buttermilk Marinade Base",
        quantity: 2,
        unit: "fl oz",
        isAllergen: true,
      },
      {
        id: "i-7",
        name: "House Seasoned Flour Base",
        quantity: 4,
        unit: "oz",
        isAllergen: true,
      },
      {
        id: "i-8",
        name: "Citrus Garlic Aioli Dip",
        quantity: 1.5,
        unit: "oz",
        isAllergen: true,
      },
    ],
  },
  {
    id: "rec-3",
    hotelId: "h-1",
    branchId: "b-1",
    menuItemId: "mi-103",
    name: "Artisanal Matcha Tiramisu",
    description:
      "Layers of ceremonial green tea soaked ladyfingers and whipped egg-rich mascarpone cream.",
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
    category: "DESSERT",
    yieldQuantity: 1,
    yieldUnit: { id: "u-1", name: "Portion", abbreviation: "port" },
    preparationInstructions:
      "1. Ensure mascarpone cream mix is aerated properly during morning cold-prep shifts.\n2. Quickly dip savoiardi biscuits into lukewarm sugar-sweetened ceremonial matcha liquid.\n3. Alternate tight horizontal rows of soaked ladyfingers with high-offset piping bags of sweet mascarpone cream.\n4. Chill set inside service coolers for at least 6 full hours prior to shift opening.\n5. Sift fresh stone-ground emerald matcha powder cleanly over top surface right at order ticket pick.",
    status: "ACTIVE",
    totalCostCents: 210,
    sellingPriceCents: 1100,
    estimatedProfitCents: 890,
    estimatedProfitMargin: 80.9,
    ingredients: [
      {
        id: "i-9",
        name: "Ceremonial Grade Matcha",
        quantity: 5,
        unit: "g",
        isAllergen: false,
      },
      {
        id: "i-10",
        name: "Italian Savoiardi Biscuits",
        quantity: 4,
        unit: "pcs",
        isAllergen: true,
      },
      {
        id: "i-11",
        name: "Whipped Mascarpone Base",
        quantity: 4,
        unit: "oz",
        isAllergen: true,
      },
    ],
  },
];
