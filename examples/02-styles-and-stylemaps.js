/**
 * Example 2: Style preservation
 *
 * The main reason this library exists: KML styles are converted into
 * Mapbox-style feature properties instead of being thrown away.
 *
 *   <IconStyle>  -> icon-color, icon-opacity, icon-size, icon-image
 *   <LineStyle>  -> line-color, line-opacity, line-width
 *   <PolyStyle>  -> fill-color, fill-opacity, fill-outline-color
 *   <LabelStyle> -> text-color, text-opacity, text-size
 *
 * This example uses test-kmls/test1.kml (a Google Earth export), which
 * exercises <gx:CascadingStyle> and <StyleMap>. A StyleMap has a "normal"
 * and a "highlight" style; where the highlight differs from normal, the
 * difference is stored under a "highlight-" prefixed property.
 */
const fs = require('fs');
const path = require('path');
const { KmlToGeojson } = require('../src');

const kmlContent = fs.readFileSync(path.join(__dirname, '..', 'test-kmls', 'test1.kml'), 'utf-8');

const kmlToGeojson = new KmlToGeojson();
const { geojson } = kmlToGeojson.parse(kmlContent);

for (const feature of geojson.features) {
    console.log(`[${feature.geometry.type}] "${feature.properties.name}"`);
    console.log('Properties:');
    for (const [key, value] of Object.entries(feature.properties)) {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
}
