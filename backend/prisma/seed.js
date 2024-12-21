import { prisma } from '../app/prismaClient.js';

async function main() {
  // Create Event Types
  const pageView = await prisma.eventType.create({
    data: { name: 'page_view', description: 'Page view event' },
  });

  const click = await prisma.eventType.create({
    data: { name: 'click', description: 'Click event' },
  });

  // Create User
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword',
      role: 'USER',
    },
  });

  // Log an Event
  await prisma.event.create({
    data: {
      type_id: pageView.id,
      user_id: user.id,
      timestamp: new Date(),
      metadata: { page: '/home' },
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
