// Script to migrate data from SQLite to PostgreSQL
// This will export your existing incident data and import it to the new database

import { PrismaClient } from '@prisma/client';

// Create two Prisma clients - one for SQLite, one for PostgreSQL
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db', // SQLite database
    },
  },
});

const postgresClient = new PrismaClient(); // Uses the DATABASE_URL from .env (PostgreSQL)

async function migrateData() {
  try {
    console.log('🔍 Starting data migration from SQLite to PostgreSQL...');

    // Step 1: Export data from SQLite
    console.log('📤 Exporting data from SQLite database...');
    
    const sqliteCameras = await sqliteClient.camera.findMany({
      include: {
        incidents: true,
      },
    });

    console.log(`Found ${sqliteCameras.length} cameras in SQLite database`);
    
    let totalIncidents = 0;
    sqliteCameras.forEach(camera => {
      totalIncidents += camera.incidents.length;
      console.log(`  - ${camera.name} (${camera.location}): ${camera.incidents.length} incidents`);
    });

    console.log(`Total incidents to migrate: ${totalIncidents}`);

    if (totalIncidents === 0) {
      console.log('❌ No data found in SQLite database. Nothing to migrate.');
      return;
    }

    // Step 2: Clear existing PostgreSQL data
    console.log('🗑️  Clearing existing PostgreSQL data...');
    await postgresClient.incident.deleteMany();
    await postgresClient.camera.deleteMany();

    // Step 3: Import cameras to PostgreSQL
    console.log('📥 Importing cameras to PostgreSQL...');
    const cameraMapping = new Map<number, number>(); // old ID -> new ID

    for (const sqliteCamera of sqliteCameras) {
      const newCamera = await postgresClient.camera.create({
        data: {
          name: sqliteCamera.name,
          location: sqliteCamera.location,
        },
      });
      
      cameraMapping.set(sqliteCamera.id, newCamera.id);
      console.log(`  ✅ Migrated camera: ${newCamera.name} (${newCamera.location})`);
    }

    // Step 4: Import incidents to PostgreSQL
    console.log('📥 Importing incidents to PostgreSQL...');
    let migratedIncidents = 0;

    for (const sqliteCamera of sqliteCameras) {
      const newCameraId = cameraMapping.get(sqliteCamera.id);
      
      if (!newCameraId) {
        console.error(`❌ Could not find new camera ID for ${sqliteCamera.name}`);
        continue;
      }

      for (const incident of sqliteCamera.incidents) {
        await postgresClient.incident.create({
          data: {
            cameraId: newCameraId,
            type: incident.type,
            tsStart: incident.tsStart,
            tsEnd: incident.tsEnd,
            thumbnailUrl: incident.thumbnailUrl,
            resolved: incident.resolved,
          },
        });
        
        migratedIncidents++;
      }
    }

    console.log(`✅ Successfully migrated ${migratedIncidents} incidents`);

    // Step 5: Verify migration
    console.log('🔍 Verifying migration...');
    const postgresIncidents = await postgresClient.incident.count();
    const postgresCameras = await postgresClient.camera.count();

    console.log(`PostgreSQL now has:`);
    console.log(`  - ${postgresCameras} cameras`);
    console.log(`  - ${postgresIncidents} incidents`);

    if (postgresIncidents === totalIncidents) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed but incident counts don\'t match');
      console.log(`Expected: ${totalIncidents}, Got: ${postgresIncidents}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Run the migration
migrateData()
  .catch((error) => {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  })
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  });
