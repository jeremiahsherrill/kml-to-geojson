# kml-to-geojson

Convert KML content to GeoJSON, preserving style and folder data.

Most KML-to-GeoJSON converters throw away the styling and folder structure. This library keeps both:

- **Styles** (`IconStyle`, `LineStyle`, `PolyStyle`, `LabelStyle`, `StyleMap`, `gx:CascadingStyle`) become Mapbox/MapLibre-friendly feature properties like `icon-color` and `line-width`.
- **Folders** are returned as a flat list with parent references, so you can rebuild the KML folder tree (e.g. for a layer panel).

Supports `Point`, `LineString`, and `Polygon` (including holes), also when nested inside `MultiGeometry`.

## Installation

```
npm install kml-to-geojson
```

Written in TypeScript — typings are included out of the box.

## Quick start

```javascript
const { KmlToGeojson } = require('kml-to-geojson');
const fs = require('fs');

const kmlToGeojson = new KmlToGeojson();
const kmlContent = fs.readFileSync('./my-file.kml', 'utf-8');

const { folders, geojson } = kmlToGeojson.parse(kmlContent);
```

`geojson` is a standard GeoJSON FeatureCollection you can pass straight to Mapbox GL / MapLibre, Leaflet, or save to a `.geojson` file. `folders` describes the KML folder hierarchy.

### Example output

For a KML with a styled placemark inside a folder:

```json
{
  "folders": [
    {
      "folder_id": "d219a44b-...",
      "name": "Landmarks",
      "parent_folder_id": null
    }
  ],
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": "8005ec87-...",
        "geometry": {
          "type": "Point",
          "coordinates": [-122.4783, 37.8199, 67]
        },
        "properties": {
          "name": "Golden Gate Bridge",
          "description": "Suspension bridge in San Francisco",
          "folder_id": "d219a44b-...",
          "icon-color": "#ff0000",
          "icon-opacity": 1,
          "icon-size": 1.3,
          "icon-image": "https://maps.google.com/mapfiles/kml/paddle/red-circle.png"
        }
      }
    ]
  }
}
```

Each feature's `properties.folder_id` points at the folder that contained the placemark, and each folder's `parent_folder_id` points at its parent folder (`null` for top level).

## Style properties

KML styles are flattened onto each feature's `properties`, using the naming conventions of Mapbox/MapLibre style layers:

| KML element | Feature properties |
| --- | --- |
| `<IconStyle>` | `icon-color`, `icon-opacity`, `icon-size`, `icon-image` |
| `<LineStyle>` | `line-color`, `line-opacity`, `line-width` |
| `<PolyStyle>` | `fill-color`, `fill-opacity`, `fill-outline-color` |
| `<LabelStyle>` | `text-color`, `text-opacity`, `text-size` |

Notes:

- KML `aabbggrr` colors are converted to `#rrggbb` plus a separate 0–1 opacity value.
- Only the properties relevant to the geometry are kept (a `Point` keeps `icon-*`/`text-*`, a `LineString` keeps `line-*`, a `Polygon` keeps `fill-*`).
- For a `<StyleMap>`, the `normal` style is applied directly; anywhere the `highlight` style differs, the difference is added under a `highlight-` prefix (e.g. `highlight-line-width`), which you can use for hover states.

## Streaming large files

For big KML files, `streamParse()` invokes a callback per folder and per feature instead of building one large array in memory. Callbacks may be async — the parser awaits each one, which makes batched database or API inserts straightforward:

```javascript
const { KmlToGeojson } = require('kml-to-geojson');
const fs = require('fs');

const kmlToGeojson = new KmlToGeojson();
const kmlContent = fs.readFileSync('./big-file.kml', 'utf-8');

let batch = [];

await kmlToGeojson.streamParse(
    kmlContent,
    async (folder) => {
        await db.insertFolder(folder);
    },
    async (feature) => {
        batch.push(feature);
        if (batch.length >= 2500) {
            await db.insertFeatures(batch);
            batch = [];
        }
    }
);

if (batch.length > 0) await db.insertFeatures(batch);
```

## Options

The constructor takes a single `altitude` flag (default `true`). KML coordinates are `longitude,latitude,altitude`; pass `false` to emit 2D `[lng, lat]` positions instead of `[lng, lat, alt]`:

```javascript
new KmlToGeojson().parse(kml);      // coordinates: [-122.4783, 37.8199, 67]
new KmlToGeojson(false).parse(kml); // coordinates: [-122.4783, 37.8199]
```

## TypeScript

```typescript
import { KmlToGeojson, KmlFolder, KmlFeature } from 'kml-to-geojson';

const kmlToGeojson = new KmlToGeojson();
const { folders, geojson } = kmlToGeojson.parse(kmlContent);

await kmlToGeojson.streamParse(
    kmlContent,
    (folder: KmlFolder) => console.log(folder.name),
    (feature: KmlFeature) => console.log(feature.geometry.type)
);
```

## Runnable examples

The [`examples/`](./examples) folder contains runnable scripts covering all of the above (basic parsing, style/StyleMap handling, streaming with batching, and the altitude option), plus sample data. From a clone of this repo:

```
npm install
node examples/01-basic-parse.js
```

## Errors and edge cases

- Content without a `<kml>` root element throws `[kml-to-geojson] Invalid KML: no <kml> root element found`.
- Placemarks with malformed or missing coordinates are skipped (a warning is logged) rather than corrupting the output.
- Polygon inner boundaries (holes) are preserved, and linear rings are closed automatically if the KML left them open.
