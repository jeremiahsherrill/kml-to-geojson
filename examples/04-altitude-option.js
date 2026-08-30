/**
 * Example 4: The altitude constructor option
 *
 * KML coordinates are "longitude,latitude,altitude". By default the parser
 * keeps altitude as a third element in each GeoJSON position. Pass false to
 * the constructor to emit 2D [lng, lat] positions instead - some tools
 * (and some Mapbox/MapLibre operations) expect strictly 2D coordinates.
 */
const fs = require('fs');
const path = require('path');
const { KmlToGeojson } = require('../src');

const kmlContent = fs.readFileSync(path.join(__dirname, 'data', 'sample.kml'), 'utf-8');

const withAltitude = new KmlToGeojson();       // default: altitude = true
const withoutAltitude = new KmlToGeojson(false);

const point3d = withAltitude.parse(kmlContent).geojson.features[0];
const point2d = withoutAltitude.parse(kmlContent).geojson.features[0];

console.log(`Feature: "${point3d.properties.name}"`);
console.log('  new KmlToGeojson()      ->', JSON.stringify(point3d.geometry.coordinates));
console.log('  new KmlToGeojson(false) ->', JSON.stringify(point2d.geometry.coordinates));
