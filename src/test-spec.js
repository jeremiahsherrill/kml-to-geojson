const { readFileSync } = require("fs");
const { KmlToGeojson } = require(".");

const kmlToGeojson = new KmlToGeojson(false);

const content = readFileSync('./test-kmls/test6.kml', 'utf-8');

(async () => {
    let geometry_count = 0;
    let folder_count = 0;

    let geometries = [];
    let folders = [];

    return kmlToGeojson.streamParse(
        content,
        (folder) => {
            folder_count++;
            folders.push(folder);
        },
        async (geometry) => {
            geometry_count++;
            geometries.push(geometry);
            if (geometries.length >= 2500) {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        console.log('Finished uploading...');
                        geometries = [];
                        resolve();
                    }, 2500);
                });
            }
        },
    ).then(() => {
        console.log('Done');
        console.log(geometries.length);
        console.log(geometry_count);
    });
})();
