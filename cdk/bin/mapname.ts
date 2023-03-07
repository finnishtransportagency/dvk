import fs from 'fs';
import { Feature, FeatureCollection, Point } from 'geojson';
import { roundGeometry } from '../lib/lambda/util';
import proj4 from 'proj4';
import { gzip } from 'zlib';
import Config from '../lib/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'eu-west-1' });

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

function getBucketName() {
  return `static.dvk${Config.getEnvironment()}.testivaylapilvi.fi`;
}

async function saveToS3(filename: string, data: Buffer) {
  const command = new PutObjectCommand({
    Key: filename,
    Bucket: getBucketName(),
    Body: data,
    ContentType: 'application/json',
    ContentEncoding: 'gzip',
  });
  await s3Client.send(command);
}

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
            },
          });
        }
      }
    }
    const collection: FeatureCollection = { type: 'FeatureCollection', features };
    const data = await gzipString(JSON.stringify(collection) + '\n');
    const filename = 'names.json.gz';
    fs.writeFileSync(filename, data);
    await saveToS3(filename, data);
    console.log(`${filename} uploaded to S3 bucket ${getBucketName()}`);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
