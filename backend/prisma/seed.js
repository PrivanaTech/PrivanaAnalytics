import { prisma } from '../app/prismaClient.js';

const eventTypes = [
    { name: 'click', description: 'Tracks user clicks' },
    { name: 'page_view', description: 'Tracks page views' },
    { name: 'form_submission', description: 'Tracks form submissions' },
    { name: 'error', description: 'Tracks application errors' },
    { name: 'login', description: 'Tracks user logins' },
    { name: 'logout', description: 'Tracks user logouts' },
    { name: 'search', description: 'Tracks user searches' },
    { name: 'file_download', description: 'Tracks file downloads' },
    { name: 'api_call', description: 'Tracks API interactions' },
    { name: 'notification', description: 'Tracks user notifications' },
    { name: 'signup', description: 'Tracks user signups' },
    { name: 'threshold_breach', description: 'Tracks when thresholds are breached' },
    { name: 'custom', description: 'Custom user-defined events' },
];

async function seedEventTypes() {
    for (const eventType of eventTypes) {
        await prisma.eventType.upsert({
        where: { name: eventType.name },
        update: {},
        create: eventType,
        });
    }
    console.log('Event types seeded successfully.');
}

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

seedEventTypes()
  .catch((error) => {
    console.error('Error seeding event types:', error.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
