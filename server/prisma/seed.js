import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const units = [
  // Weight
  {
    name: "Gram",
    symbol: "g",
    baseType: "G",
    conversionFactor: 1,
    isBaseUnit: true,
  },
  {
    name: "Kilogram",
    symbol: "kg",
    baseType: "G",
    conversionFactor: 1000,
    isBaseUnit: false,
  },

  // Volume
  {
    name: "Milliliter",
    symbol: "ml",
    baseType: "ML",
    conversionFactor: 1,
    isBaseUnit: true,
  },
  {
    name: "Liter",
    symbol: "l",
    baseType: "ML",
    conversionFactor: 1000,
    isBaseUnit: false,
  },

  // Count
  {
    name: "Piece",
    symbol: "piece",
    baseType: "PIECE",
    conversionFactor: 1,
    isBaseUnit: true,
  },
];

async function main() {
  for (const u of units) {
    await prisma.measurementUnit.upsert({
      where: {
        baseType_symbol: {
          baseType: u.baseType,
          symbol: u.symbol,
        },
      },
      update: {
        name: u.name,
        conversionFactor: u.conversionFactor,
        isBaseUnit: u.isBaseUnit,
      },
      create: {
        name: u.name,
        symbol: u.symbol,
        baseType: u.baseType,
        conversionFactor: u.conversionFactor,
        isBaseUnit: u.isBaseUnit,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seeded measurement units");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
