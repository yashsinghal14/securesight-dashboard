// Script to inspect existing SQLite data
import { PrismaClient } from '@prisma/client';

const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

async function inspectData() {
  try {
    console.log('🔍 Inspecting SQLite database data...\n');

    const cameras = await sqliteClient.camera.findMany({
      include: {
        incidents: {
          orderBy: {
            tsStart: 'desc',
          },
        },
      },
    });

    console.log(`📊 Found ${cameras.length} cameras:`);
    
    let totalIncidents = 0;
    let unresolvedIncidents = 0;

    for (const camera of cameras) {
      console.log(`\n🎥 Camera: ${camera.name} (${camera.location})`);
      console.log(`   ID: ${camera.id}`);
      console.log(`   Incidents: ${camera.incidents.length}`);

      if (camera.incidents.length > 0) {
        console.log(`   Recent incidents:`);
        camera.incidents.slice(0, 3).forEach((incident, index) => {
          const status = incident.resolved ? '✅ Resolved' : '🔴 Unresolved';
          console.log(`     ${index + 1}. ${incident.type} - ${status}`);
          console.log(`        Time: ${incident.tsStart.toLocaleString()}`);
          console.log(`        Thumbnail: ${incident.thumbnailUrl}`);
        });

        if (camera.incidents.length > 3) {
          console.log(`     ... and ${camera.incidents.length - 3} more incidents`);
        }
      }

      totalIncidents += camera.incidents.length;
      unresolvedIncidents += camera.incidents.filter(i => !i.resolved).length;
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total cameras: ${cameras.length}`);
    console.log(`   Total incidents: ${totalIncidents}`);
    console.log(`   Unresolved incidents: ${unresolvedIncidents}`);
    console.log(`   Resolved incidents: ${totalIncidents - unresolvedIncidents}`);

    // Show incident types breakdown
    const allIncidents = cameras.flatMap(c => c.incidents);
    const incidentTypes: Record<string, number> = {};
    allIncidents.forEach(incident => {
      incidentTypes[incident.type] = (incidentTypes[incident.type] || 0) + 1;
    });

    console.log(`\n🏷️  Incident types:`);
    Object.entries(incidentTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error inspecting SQLite data:', error);
  } finally {
    await sqliteClient.$disconnect();
  }
}

inspectData();
