import { prisma } from '../app/prismaClient.js';

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');

    // Delete all events
    await prisma.event.deleteMany({});
    console.log('Deleted all events.');

    // Delete all event types
    await prisma.eventType.deleteMany({});
    console.log('Deleted all event types.');

    // Delete all users
    await prisma.user.deleteMany({});
    console.log('Deleted all users.');

    console.log('Database cleaned successfully.');
  } catch (error) {
    console.error('Error cleaning database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
