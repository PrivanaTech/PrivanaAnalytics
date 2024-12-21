import { prisma } from './app/prismaClient.js';

async function testQueries() {
  try {
    // Fetch all events
    const events = await prisma.event.findMany({
      include: { type: true, user: true },
    });
    console.log('Events:', events);

    // Insert a sample event
    const newEvent = await prisma.event.create({
      data: {
        type_id: 1, // Assuming type_id 1 exists
        user_id: null,
        timestamp: new Date(),
        metadata: { key: 'value' },
      },
    });
    console.log('New Event:', newEvent);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQueries();
