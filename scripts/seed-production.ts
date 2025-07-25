// Run this script after deploying to production to seed the database
// Usage: npx ts-node scripts/seed-production.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting production database seed...');

  // Clear existing data
  await prisma.incident.deleteMany();
  await prisma.camera.deleteMany();

  // Create cameras
  const cameras = await Promise.all([
    prisma.camera.create({ data: { name: 'Shop Floor A', location: 'First Floor' } }),
    prisma.camera.create({ data: { name: 'Vault', location: 'Basement' } }),
    prisma.camera.create({ data: { name: 'Entrance', location: 'Ground Floor' } }),
  ]);

  console.log('Created cameras:', cameras);

  // Create sample incidents
  const incidentTypes = ['Unauthorised Access', 'Gun Threat', 'Suspicious Loitering'];
  const incidents = [];

  for (let i = 0; i < 24; i++) {
    const camera = cameras[Math.floor(Math.random() * cameras.length)];
    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const startTime = new Date(Date.now() - Math.random() * 86400000); // Random time in last 24 hours
    const endTime = new Date(startTime.getTime() + Math.random() * 3600000); // End time up to 1 hour later

    const incident = await prisma.incident.create({
      data: {
        cameraId: camera.id,
        type,
        tsStart: startTime,
        tsEnd: endTime,
        thumbnailUrl: `/thumbnails/cam${Math.floor(Math.random() * 3) + 1}.jpg`,
        resolved: Math.random() > 0.7, // 30% chance of being resolved
      },
    });

    incidents.push(incident);
  }

  console.log(`Seeded ${incidents.length} incidents`);
  console.log('Production database seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding production database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
