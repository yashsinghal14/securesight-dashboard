// Script to import JSON data into PostgreSQL
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExportedCamera {
  id: number;
  name: string;
  location: string;
}

interface ExportedIncident {
  id: number;
  cameraId: number;
  type: string;
  tsStart: string;
  tsEnd: string;
  thumbnailUrl: string;
  resolved: number; // SQLite uses 0/1 for boolean
}

interface ExportedData {
  cameras: ExportedCamera[];
  incidents: ExportedIncident[];
  exportedAt: string;
  summary: {
    totalCameras: number;
    totalIncidents: number;
    resolvedIncidents: number;
    unresolvedIncidents: number;
    incidentsByType: Record<string, number>;
  };
}

async function importData() {
  try {
    console.log('📥 Starting PostgreSQL import...\n');

    // Read exported JSON data
    const dataPath = path.join(__dirname, 'exported-data.json');
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Exported data file not found. Please run export-sqlite-data.js first.');
      process.exit(1);
    }

    const exportedData: ExportedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('📊 Import Summary:');
    console.log(`  - Cameras to import: ${exportedData.cameras.length}`);
    console.log(`  - Incidents to import: ${exportedData.incidents.length}`);
    console.log(`  - Data exported at: ${exportedData.exportedAt}`);

    // Remove duplicate cameras (keep unique name+location combinations)
    const uniqueCameras = exportedData.cameras.reduce((acc, camera) => {
      const key = `${camera.name}-${camera.location}`;
      if (!acc.find(c => `${c.name}-${c.location}` === key)) {
        acc.push(camera);
      }
      return acc;
    }, [] as ExportedCamera[]);

    console.log(`\n🎥 Found ${uniqueCameras.length} unique cameras (removed duplicates):`);
    uniqueCameras.forEach(camera => {
      console.log(`  - ${camera.name} (${camera.location})`);
    });

    // Clear existing PostgreSQL data
    console.log('\n🗑️  Clearing existing PostgreSQL data...');
    await prisma.incident.deleteMany();
    await prisma.camera.deleteMany();

    // Import unique cameras
    console.log('\n📥 Importing cameras to PostgreSQL...');
    const cameraMapping = new Map<number, number>(); // old SQLite ID -> new PostgreSQL ID

    for (const camera of uniqueCameras) {
      const newCamera = await prisma.camera.create({
        data: {
          name: camera.name,
          location: camera.location,
        },
      });

      // Map all old camera IDs with same name+location to the new ID
      exportedData.cameras
        .filter(c => c.name === camera.name && c.location === camera.location)
        .forEach(c => {
          cameraMapping.set(c.id, newCamera.id);
        });

      console.log(`  ✅ ${newCamera.name} (${newCamera.location}) - ID: ${newCamera.id}`);
    }

    // Import incidents
    console.log('\n📥 Importing incidents to PostgreSQL...');
    let importedCount = 0;
    let skippedCount = 0;

    for (const incident of exportedData.incidents) {
      const newCameraId = cameraMapping.get(incident.cameraId);
      
      if (!newCameraId) {
        console.log(`  ⚠️  Skipping incident ${incident.id} - camera not found`);
        skippedCount++;
        continue;
      }

      await prisma.incident.create({
        data: {
          cameraId: newCameraId,
          type: incident.type,
          tsStart: new Date(incident.tsStart),
          tsEnd: new Date(incident.tsEnd),
          thumbnailUrl: incident.thumbnailUrl,
          resolved: incident.resolved === 1, // Convert SQLite boolean
        },
      });

      importedCount++;
    }

    console.log(`\n✅ Import completed!`);
    console.log(`  - Incidents imported: ${importedCount}`);
    console.log(`  - Incidents skipped: ${skippedCount}`);

    // Verify the import
    console.log('\n🔍 Verifying import...');
    const finalCameraCount = await prisma.camera.count();
    const finalIncidentCount = await prisma.incident.count();
    const unresolvedCount = await prisma.incident.count({ where: { resolved: false } });

    console.log(`PostgreSQL now contains:`);
    console.log(`  - ${finalCameraCount} cameras`);
    console.log(`  - ${finalIncidentCount} incidents`);
    console.log(`  - ${unresolvedCount} unresolved incidents`);

    // Show incidents by type
    const incidentsByType = await prisma.incident.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    });

    console.log('\nIncidents by type:');
    incidentsByType.forEach(({ type, _count }) => {
      console.log(`  - ${type}: ${_count._all}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('Your SQLite incidents are now available in PostgreSQL.');
    console.log('Deploy to Vercel and your incident list should load properly!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData()
  .catch((error) => {
    console.error('\n💥 Fatal error during import:', error);
    process.exit(1);
  });
