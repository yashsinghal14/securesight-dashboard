// Script to migrate data from SQLite to PostgreSQL
// This handles the database connection properly

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface Camera {
  id: number;
  name: string;
  location: string;
}

interface Incident {
  id: number;
  cameraId: number;
  type: string;
  tsStart: string;
  tsEnd: string;
  thumbnailUrl: string;
  resolved: boolean;
}

async function migrateData() {
  console.log('🔍 Starting SQLite to PostgreSQL migration...\n');

  // Step 1: Backup current .env and schema
  console.log('📋 Backing up current configuration...');
  const originalEnv = fs.readFileSync('.env', 'utf8');
  const originalSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');

  try {
    // Step 2: Temporarily switch to SQLite
    console.log('🔄 Switching to SQLite configuration...');
    
    // Create temporary SQLite schema
    const sqliteSchema = originalSchema.replace(
      'provider = "postgresql"',
      'provider = "sqlite"'
    );
    fs.writeFileSync('prisma/schema.prisma', sqliteSchema);
    
    // Create temporary SQLite env
    fs.writeFileSync('.env', 'DATABASE_URL="file:./prisma/dev.db"');
    
    // Generate SQLite client
    console.log('🔧 Generating SQLite Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 3: Export data from SQLite
    console.log('📤 Exporting data from SQLite...');
    
    const { PrismaClient: SQLitePrismaClient } = await import('@prisma/client');
    const sqliteClient = new SQLitePrismaClient();
    
    const cameras = await sqliteClient.camera.findMany({
      include: {
        incidents: true,
      },
    });

    await sqliteClient.$disconnect();

    console.log(`Found ${cameras.length} cameras with data:`);
    let totalIncidents = 0;
    cameras.forEach(camera => {
      totalIncidents += camera.incidents.length;
      console.log(`  - ${camera.name} (${camera.location}): ${camera.incidents.length} incidents`);
    });
    console.log(`Total incidents to migrate: ${totalIncidents}`);

    if (totalIncidents === 0) {
      console.log('❌ No incidents found in SQLite database!');
      return;
    }

    // Step 4: Switch back to PostgreSQL
    console.log('🔄 Switching back to PostgreSQL configuration...');
    fs.writeFileSync('prisma/schema.prisma', originalSchema);
    fs.writeFileSync('.env', originalEnv);
    
    // Generate PostgreSQL client
    console.log('🔧 Generating PostgreSQL Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 5: Import data to PostgreSQL
    console.log('📥 Importing data to PostgreSQL...');
    
    // Clear the require cache to get fresh client
    delete require.cache[require.resolve('@prisma/client')];
    const { PrismaClient: PostgresPrismaClient } = await import('@prisma/client');
    const postgresClient = new PostgresPrismaClient();

    // Clear existing data
    console.log('🗑️  Clearing existing PostgreSQL data...');
    await postgresClient.incident.deleteMany();
    await postgresClient.camera.deleteMany();

    // Import cameras with ID mapping
    console.log('📥 Importing cameras...');
    const cameraMapping = new Map<number, number>();

    for (const camera of cameras) {
      const newCamera = await postgresClient.camera.create({
        data: {
          name: camera.name,
          location: camera.location,
        },
      });
      
      cameraMapping.set(camera.id, newCamera.id);
      console.log(`  ✅ ${camera.name} (${camera.location})`);
    }

    // Import incidents
    console.log('📥 Importing incidents...');
    let migratedCount = 0;

    for (const camera of cameras) {
      const newCameraId = cameraMapping.get(camera.id);
      if (!newCameraId) continue;

      for (const incident of camera.incidents) {
        await postgresClient.incident.create({
          data: {
            cameraId: newCameraId,
            type: incident.type,
            tsStart: new Date(incident.tsStart),
            tsEnd: new Date(incident.tsEnd),
            thumbnailUrl: incident.thumbnailUrl,
            resolved: incident.resolved,
          },
        });
        migratedCount++;
      }
    }

    console.log(`✅ Successfully migrated ${migratedCount} incidents!`);

    // Verify migration
    const finalIncidentCount = await postgresClient.incident.count();
    const finalCameraCount = await postgresClient.camera.count();

    console.log(`\n🔍 Verification:`);
    console.log(`  - Cameras: ${finalCameraCount}`);
    console.log(`  - Incidents: ${finalIncidentCount}`);

    if (finalIncidentCount === totalIncidents) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log(`⚠️  Warning: Expected ${totalIncidents} incidents, got ${finalIncidentCount}`);
    }

    await postgresClient.$disconnect();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Step 6: Restore original configuration
    console.log('🔄 Restoring original configuration...');
    fs.writeFileSync('prisma/schema.prisma', originalSchema);
    fs.writeFileSync('.env', originalEnv);
    execSync('npx prisma generate', { stdio: 'inherit' });
  }
}

migrateData()
  .then(() => {
    console.log('\n🎉 Migration process completed successfully!');
    console.log('Your SQLite data has been migrated to PostgreSQL.');
    console.log('You can now deploy to Vercel and your incidents will appear.');
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
