// Simple JavaScript script to export SQLite data to JSON
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ SQLite database not found at:', dbPath);
  process.exit(1);
}

console.log('🔍 Opening SQLite database...');
const db = new sqlite3.Database(dbPath);

async function exportData() {
  try {
    // Export cameras
    const cameras = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Camera', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Found ${cameras.length} cameras:`);
    cameras.forEach(camera => {
      console.log(`  - ${camera.name} (${camera.location}), ID: ${camera.id}`);
    });

    // Export incidents
    const incidents = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Incident', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Found ${incidents.length} incidents`);

    // Count incidents by camera
    const incidentsByCamera = {};
    incidents.forEach(incident => {
      incidentsByCamera[incident.cameraId] = (incidentsByCamera[incident.cameraId] || 0) + 1;
    });

    console.log('Incidents by camera:');
    Object.entries(incidentsByCamera).forEach(([cameraId, count]) => {
      const camera = cameras.find(c => c.id == cameraId);
      console.log(`  - Camera ${camera ? camera.name : 'Unknown'}: ${count} incidents`);
    });

    // Count by type
    const incidentsByType = {};
    incidents.forEach(incident => {
      incidentsByType[incident.type] = (incidentsByType[incident.type] || 0) + 1;
    });

    console.log('Incidents by type:');
    Object.entries(incidentsByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    // Count resolved vs unresolved
    const resolved = incidents.filter(i => i.resolved).length;
    const unresolved = incidents.length - resolved;
    console.log(`Status: ${resolved} resolved, ${unresolved} unresolved`);

    // Export to JSON
    const exportData = {
      cameras,
      incidents,
      exportedAt: new Date().toISOString(),
      summary: {
        totalCameras: cameras.length,
        totalIncidents: incidents.length,
        resolvedIncidents: resolved,
        unresolvedIncidents: unresolved,
        incidentsByType: incidentsByType
      }
    };

    const exportPath = path.join(__dirname, 'exported-data.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n✅ Data exported to: ${exportPath}`);
    console.log('📋 Summary:');
    console.log(`  - ${cameras.length} cameras`);
    console.log(`  - ${incidents.length} incidents`);
    console.log(`  - Export completed successfully!`);

    return exportData;

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

exportData()
  .then(() => {
    console.log('\n🎉 SQLite data export completed!');
    console.log('Next step: Run the import script to load this data into PostgreSQL');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
