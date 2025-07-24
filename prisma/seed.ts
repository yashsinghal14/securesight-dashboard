import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create cameras
  await prisma.camera.createMany({
    data: [
      { name: 'Shop Floor A', location: 'First Floor' },
      { name: 'Vault', location: 'Basement' },
      { name: 'Entrance', location: 'Ground Floor' },
    ],
  });

  // Fetch camera IDs
  const allCameras = await prisma.camera.findMany();
  console.log('Cameras:', allCameras);

  function randomTime() {
    const now = new Date();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tsStart = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
    const tsEnd = new Date(tsStart.getTime() + Math.random() * 30 * 60 * 1000);
    return { tsStart, tsEnd };
  }

  const threatTypes = [
    'Unauthorised Access',
    'Gun Threat',
    'Suspicious Loitering',
  ];

  for (let i = 0; i < 12; i++) {
    const cam = allCameras[i % allCameras.length];
    const type = threatTypes[i % threatTypes.length];
    const { tsStart, tsEnd } = randomTime();
    await prisma.incident.create({
      data: {
        cameraId: cam.id,
        type,
        tsStart,
        tsEnd,
        thumbnailUrl: `/thumbnails/incident${(i % 6) + 1}.jpg`,
        resolved: false,
      },
    });
  }

  const count = await prisma.incident.count();
  console.log(`Seeded ${count} incidents`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 