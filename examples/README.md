# Examples

Runnable examples for `kml-to-geojson`. Each script requires the library from
`../src` so they work straight from a clone; in your own project you would
`npm install kml-to-geojson` and require it by name instead.

## Setup

From the repository root:

```
npm install
```

## Running the examples

```
node examples/01-basic-parse.js
node examples/02-styles-and-stylemaps.js
node examples/03-stream-parse.js
node examples/04-altitude-option.js
```

| Script | What it demonstrates |
| --- | --- |
| `01-basic-parse.js` | The basic `parse()` call: folder hierarchy + GeoJSON FeatureCollection. Writes `output/sample.geojson`, which you can preview at [geojson.io](https://geojson.io). |
| `02-styles-and-stylemaps.js` | How KML styles (`IconStyle`, `LineStyle`, `StyleMap`, `gx:CascadingStyle`) become Mapbox-style feature properties like `icon-color` and `line-width`, including `highlight-*` properties from StyleMaps. |
| `03-stream-parse.js` | `streamParse()` for large files: per-feature async callbacks with batching, instead of building one big array in memory. |
| `04-altitude-option.js` | The constructor's `altitude` flag: 3D `[lng, lat, alt]` positions (default) vs 2D `[lng, lat]`. |

## Input data

- `data/sample.kml` - a small hand-written KML with nested folders, two styled
  points, and a styled line. Used by examples 1 and 4.
- `../test-kmls/` - real-world Google Earth exports bundled with the repo.
  Used by examples 2 and 3.

## Output

Generated files land in `examples/output/` (created on first run).
