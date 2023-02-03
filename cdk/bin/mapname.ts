import fs from 'fs';
import { Feature, FeatureCollection, Point } from 'geojson';
import { roundGeometry } from '../lib/lambda/util';
import proj4 from 'proj4';
import { gzip } from 'zlib';

const gzipString = async (input: string): Promise<Buffer> => {
  const buffer = Buffer.from(input);
  return new Promise((resolve, reject) =>
    gzip(buffer, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
};

const ignoredNames = ['Vuosaaren satama'];

async function main() {
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
  proj4.defs('EPSG:3067', '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
  if (process.argv.length > 2) {
    const features: Feature[] = [];
    let i = 0;
    for (const file of process.argv.slice(2)) {
      const names = JSON.parse(fs.readFileSync(file).toString()) as FeatureCollection;
      for (const feature of names.features) {
        if (feature.geometry.type === 'Point' && !ignoredNames.includes(feature.properties?.AHTI_NAMFI)) {
          const coordinates = proj4('EPSG:4326', 'EPSG:3067').forward(feature.geometry.coordinates);
          const geometry = { type: 'Point', coordinates: coordinates } as Point;
          roundGeometry(geometry, 0);
          features.push({
            id: ++i,
            type: 'Feature',
            geometry,
            properties: {
              name: {
                fi: feature.properties?.AHTI_NAMFI,
                sv: feature.properties?.AHTI_NAMSV,
              },
              priority: Number.parseInt(feature.properties?.AHTI_PRIOR, 10),
              // TODO: set based on source
              level: Number.parseInt(feature.properties?.AHTI_PRIOR, 10),
            },
          });
        }
      }
    }
    const collection: FeatureCollection = { type: 'FeatureCollection', features };
    fs.writeFileSync('names.json.gz', await gzipString(JSON.stringify(collection, undefined, 2) + '\n'));
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
