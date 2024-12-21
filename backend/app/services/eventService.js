import { prisma } from '../prismaClient.js';

export async function getAllEvents() {
  return await prisma.event.findMany({
    include: { type: true, user: true },
  });
}
