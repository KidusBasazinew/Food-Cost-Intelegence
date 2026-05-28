import { prisma } from "../../../prisma/client.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayStampUTC(d = new Date()) {
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  return `${yyyy}${mm}${dd}`;
}

function randomChunk(len = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export async function generatePosOrderNumber({ tx, hotelId }) {
  const client = tx ?? prisma;
  const prefix = `POS-${todayStampUTC()}-`;

  // Small retry loop to satisfy unique constraint.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `${prefix}${randomChunk(5)}`;
    const exists = await client.posOrder.findFirst({
      where: { hotelId, orderNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  // Extremely unlikely, but deterministic fallback.
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}
