import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import * as turf from '@turf/turf';
import { MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { intersects } from 'ol/extent';
import { useFeatureData } from '../utils/featureData';
import { useEffect } from 'react';

function getSpeedLimitFeatures(rafs: Feature<Geometry>[], fafs: Feature<Geometry>[]) {
  const speedLimitFeatures: Feature<Geometry>[] = [];
  const format = new GeoJSON();
  for (const raf of rafs) {
    const speedLimit = raf.getProperties().value;
    // Only analyse restriction areas with speed limit value
    if (speedLimit === null) {
      continue;
    }
    const rafExtent = raf.getGeometry()?.getExtent();
    const raGeomPoly = format.writeGeometryObject(raf.getGeometry() as Geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });

    for (const faf of fafs) {
      const fafExtent = faf.getGeometry()?.getExtent();
      // No need to analyze more if bounding boxes do not intersect
      if (!rafExtent || !fafExtent || !intersects(rafExtent, fafExtent)) {
        continue;
      }

      const aGeomPoly = format.writeGeometryObject(faf.getGeometry() as Geometry, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      // Check if fairway area polygone is inside restriction area polygone
      if (turf.booleanContains(raGeomPoly as turf.Polygon, aGeomPoly as turf.Polygon)) {
        faf.setProperties({ speedLimit: speedLimit });
        speedLimitFeatures.push(faf);
      } else {
        // Find intersection of fairway area and restriction area polygons
        const intersection = turf.intersect(raGeomPoly as turf.Polygon, aGeomPoly as turf.Polygon);
        if (intersection) {
          const feat = format.readFeature(intersection.geometry, {
            dataProjection: 'EPSG:4326',
            featureProjection: MAP.EPSG,
          });
          feat.setProperties({ speedLimit: speedLimit });
          speedLimitFeatures.push(feat);
        }
      }
    }
  }
  return speedLimitFeatures;
}

async function InitLine12() {
  const { data } = useFeatureData('line12');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('line12');
      features.forEach((f) => f.set('dataSource', 'line12', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitLine3456() {
  const { data } = useFeatureData('line3456');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('line3456');
      features.forEach((f) => f.set('dataSource', 'line3456', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitArea12() {
  const { data } = useFeatureData('area12');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('area12');
      features.forEach((f) => f.set('dataSource', 'area12', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitArea3456() {
  const { data } = useFeatureData('area3456');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('area3456');
      features.forEach((f) => f.set('dataSource', 'area3456', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitDepth12() {
  const { data } = useFeatureData('area12');
  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('depth12');
      features.forEach((f) => f.set('dataSource', 'depth12', true));
      source.addFeatures(features);
    }
  }, [data]);
}

function InitSpeedlimit() {
  const aQuery = useFeatureData('area12');
  const raQuery = useFeatureData('restrictionarea');

  useEffect(() => {
    const aData = aQuery.data;
    const raData = raQuery.data;
    if (aData && raData) {
      const format = new GeoJSON();
      const afs = format.readFeatures(aData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const rafs = format.readFeatures(raData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });

      const speedLimitFeatures = getSpeedLimitFeatures(rafs, afs);
      const source = dvkMap.getVectorSource('speedlimit');
      source.addFeatures(speedLimitFeatures);
    }
  }, [aQuery.data, raQuery.data]);
}

async function InitSpecialarea() {
  const { data } = useFeatureData('specialarea');
  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('specialarea');
      features.forEach((f) => f.set('dataSource', 'specialarea', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitPilot() {
  const { data } = useFeatureData('pilot');
  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('pilot');
      features.forEach((f) => f.set('dataSource', 'pilot', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitHarbor() {
  const { data } = useFeatureData('harbor');
  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('harbor');
      features.forEach((f) => f.set('dataSource', 'harbor', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitSafetyequipment() {
  const { data } = useFeatureData('safetyequipment');
  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      const source = dvkMap.getVectorSource('safetyequipment');
      features.forEach((f) => f.set('dataSource', 'safetyequipment', true));
      source.addFeatures(features);
    }
  }, [data]);
}

async function InitFeatures() {
  InitLine12();
  InitLine3456();
  InitArea12();
  InitArea3456();
  InitDepth12();
  InitSpeedlimit();
  InitSpecialarea();
  InitPilot();
  InitHarbor();
  InitSafetyequipment();
}

export { InitFeatures };
