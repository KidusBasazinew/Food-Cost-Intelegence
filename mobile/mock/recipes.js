export const recipes = [
  {
    id: "r1",
    name: "Doro Wat",
    category: "MAIN",
    description:
      "A rich, slow-simmered Ethiopian chicken stew in a deeply spiced berbere sauce, traditionally served with injera.",
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800",
    prepMinutes: 45,
    yieldQuantity: 1,
    yieldUnit: "PORTION",
    sellingPriceCents: 45000,
    totalCostCents: 14200,
    isFeatured: true,
    ingredients: [
      {
        id: "ri1",
        name: "Chicken Breast",
        quantity: 0.35,
        unit: "kg",
        costCents: 11200,
      },
      {
        id: "ri2",
        name: "Berbere Spice",
        quantity: 0.04,
        unit: "kg",
        costCents: 1120,
      },
      { id: "ri3", name: "Onions", quantity: 0.15, unit: "kg", costCents: 675 },
      {
        id: "ri4",
        name: "Cooking Oil",
        quantity: 0.05,
        unit: "l",
        costCents: 650,
      },
      {
        id: "ri5",
        name: "Tomatoes",
        quantity: 0.1,
        unit: "kg",
        costCents: 600,
      },
    ],
  },
  {
    id: "r2",
    name: "Tibs",
    category: "MAIN",
    description:
      "Pan-seared cubes of beef sautéed with onions, peppers, and rosemary — served sizzling.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    prepMinutes: 30,
    yieldQuantity: 1,
    yieldUnit: "PORTION",
    sellingPriceCents: 38000,
    totalCostCents: 13800,
    ingredients: [
      {
        id: "ri6",
        name: "Beef Cubes",
        quantity: 0.3,
        unit: "kg",
        costCents: 10500,
      },
      { id: "ri7", name: "Onions", quantity: 0.12, unit: "kg", costCents: 540 },
      {
        id: "ri8",
        name: "Cooking Oil",
        quantity: 0.04,
        unit: "l",
        costCents: 520,
      },
      {
        id: "ri9",
        name: "Berbere Spice",
        quantity: 0.02,
        unit: "kg",
        costCents: 560,
      },
    ],
  },
  {
    id: "r3",
    name: "Shiro",
    category: "MAIN",
    description:
      "A smooth, spiced chickpea flour stew — a comforting vegetarian staple.",
    imageUrl:
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800",
    prepMinutes: 20,
    yieldQuantity: 1,
    yieldUnit: "PORTION",
    sellingPriceCents: 25000,
    totalCostCents: 6100,
    ingredients: [
      {
        id: "ri10",
        name: "Chickpea Flour",
        quantity: 0.15,
        unit: "kg",
        costCents: 3200,
      },
      {
        id: "ri11",
        name: "Cooking Oil",
        quantity: 0.04,
        unit: "l",
        costCents: 520,
      },
      {
        id: "ri12",
        name: "Onions",
        quantity: 0.08,
        unit: "kg",
        costCents: 360,
      },
      {
        id: "ri13",
        name: "Berbere Spice",
        quantity: 0.03,
        unit: "kg",
        costCents: 840,
      },
    ],
  },
  {
    id: "r4",
    name: "Caesar Salad",
    category: "SALAD",
    sellingPriceCents: 22000,
    prepMinutes: 15,
    description:
      "Crisp romaine, shaved parmesan, and garlic croutons in a classic Caesar dressing.",
    imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800",
    totalCostCents: 5400,
    yieldQuantity: 1,
    yieldUnit: "PORTION",
    ingredients: [
      {
        id: "ri14",
        name: "Romaine Lettuce",
        quantity: 0.2,
        unit: "kg",
        costCents: 1800,
      },
      {
        id: "ri15",
        name: "Parmesan",
        quantity: 0.03,
        unit: "kg",
        costCents: 2100,
      },
      {
        id: "ri16",
        name: "Croutons",
        quantity: 0.05,
        unit: "kg",
        costCents: 900,
      },
    ],
  },
  {
    id: "r5",
    name: "Club Sandwich",
    category: "SNACK",
    sellingPriceCents: 28000,
    prepMinutes: 12,
    description:
      "Triple-decker with grilled chicken, crisp bacon, lettuce, and tomato.",
    imageUrl:
      "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=800",
    totalCostCents: 8900,
    yieldQuantity: 1,
    yieldUnit: "PORTION",
    ingredients: [
      {
        id: "ri17",
        name: "Chicken Breast",
        quantity: 0.15,
        unit: "kg",
        costCents: 4800,
      },
      { id: "ri18", name: "Bread", quantity: 3, unit: "pc", costCents: 900 },
      {
        id: "ri19",
        name: "Tomatoes",
        quantity: 0.05,
        unit: "kg",
        costCents: 300,
      },
    ],
  },
  {
    id: "r6",
    name: "Fresh Juice",
    category: "DRINK",
    sellingPriceCents: 12000,
    prepMinutes: 5,
    description: "Freshly pressed seasonal fruit juice, made to order.",
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",
    totalCostCents: 2800,
    yieldQuantity: 1,
    yieldUnit: "CUP",
    ingredients: [
      {
        id: "ri20",
        name: "Fresh Orange Juice Base",
        quantity: 0.3,
        unit: "l",
        costCents: 2100,
      },
    ],
  },
  {
    id: "r7",
    name: "Grilled Tilapia",
    category: "MAIN",
    sellingPriceCents: 52000,
    prepMinutes: 35,
    description:
      "Whole grilled tilapia marinated in lemon, garlic, and herbs, served with rice.",
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800",
    totalCostCents: 17200,
    yieldQuantity: 1,
    yieldUnit: "PLATE",
    ingredients: [
      {
        id: "ri21",
        name: "Tilapia Fillet",
        quantity: 0.35,
        unit: "kg",
        costCents: 14350,
      },
      {
        id: "ri22",
        name: "Cooking Oil",
        quantity: 0.05,
        unit: "l",
        costCents: 650,
      },
      {
        id: "ri23",
        name: "Tomatoes",
        quantity: 0.1,
        unit: "kg",
        costCents: 600,
      },
    ],
  },
];

export function recipeById(id) {
  return recipes.find((r) => r.id === id);
}

export function estimateProfitMargin(recipe) {
  const profit = recipe.sellingPriceCents - recipe.totalCostCents;
  const margin =
    recipe.sellingPriceCents > 0
      ? (profit / recipe.sellingPriceCents) * 100
      : 0;
  return { profitCents: profit, marginPercent: Math.round(margin) };
}
