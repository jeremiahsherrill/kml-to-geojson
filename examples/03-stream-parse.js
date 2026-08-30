/**
 * Example 3: Streaming parse for large files
 *
 * streamParse() invokes a callback per folder and per feature instead of
 * building one big array in memory. The callbacks may be async - the parser
 * awaits each one, so you can batch inserts into a database or an API
 * without buffering the whole file.
 *
 * test-kmls/test6.kml is the largest bundled file (thousands of features
 * inside MultiGeometry nodes).
 */
const fs = require('fs');
const path = require('path');
const { KmlToGeojson } = require('../src');

const kmlContent = fs.readFileSync(path.join(__dirname, '..', 'test-kmls', 'test6.kml'), 'utf-8');

// Pass altitude=false to get [lng, lat] coordinates instead of [lng, lat, alt]
const kmlToGeojson = new KmlToGeojson(false);

const BATCH_SIZE = 2500;
let batch = [];
let folder_count = 0;
let feature_count = 0;
let batches_flushed = 0;

const flushBatch = async () => {
    // Stand-in for a real bulk insert (database, API, file append, ...)
    await new Promise(resolve => setTimeout(resolve, 50));
    batches_flushed++;
    console.log(`Flushed batch ${batches_flushed} (${batch.length} features)`);
    batch = [];
};

(async () => {
    console.time('streamParse');

    await kmlToGeojson.streamParse(
        kmlContent,
        (folder) => {
            folder_count++;
        },
        async (feature) => {
            feature_count++;
            batch.push(feature);
            if (batch.length >= BATCH_SIZE) await flushBatch();
        }
    );

    if (batch.length > 0) await flushBatch();

    console.timeEnd('streamParse');
    console.log(`Folders: ${folder_count}`);
    console.log(`Features: ${feature_count}`);
})();
