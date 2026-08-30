/**
 * Example 1: Basic parsing
 *
 * Parses a small KML file and shows the two things the library returns:
 *   - folders: the KML folder hierarchy (each folder has an id and parent id)
 *   - geojson: a standard GeoJSON FeatureCollection
 *
 * The result is also written to examples/output/sample.geojson so you can
 * drop it into geojson.io or QGIS to see it on a map.
 */
const fs = require('fs');
const path = require('path');
const { KmlToGeojson } = require('../src');

const kmlContent = fs.readFileSync(path.join(__dirname, 'data', 'sample.kml'), 'utf-8');

const kmlToGeojson = new KmlToGeojson();
const { folders, geojson } = kmlToGeojson.parse(kmlContent);

console.log('=== Folders ===');
for (const folder of folders) {
    const parent = folders.find(f => f.folder_id === folder.parent_folder_id);
    console.log(`- "${folder.name}"${parent ? ` (inside "${parent.name}")` : ' (top level)'}`);
}

console.log('\n=== Features ===');
for (const feature of geojson.features) {
    const folder = folders.find(f => f.folder_id === feature.properties.folder_id);
    console.log(`- [${feature.geometry.type}] "${feature.properties.name}" in folder "${folder?.name}"`);
}

const outDir = path.join(__dirname, 'output');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'sample.geojson');
fs.writeFileSync(outFile, JSON.stringify(geojson, null, 2));

console.log(`\nWrote ${geojson.features.length} features to ${outFile}`);
