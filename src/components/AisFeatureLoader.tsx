import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Circle, Geometry, LineString, LinearRing, Point, Polygon } from 'ol/geom';
import { FeatureDataLayerId, MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { useFeatureData } from '../utils/dataLoader';
import { useEffect, useState } from 'react';
import { DvkLayerState } from './FeatureLoader';
import { useDvkContext } from '../hooks/dvkContext';
import _ from 'lodash';
import { calculateVesselDimensions, isVesselMoving, getVesselHeading, translatePoint, getPointRotationAngle } from '../utils/aisUtils';
import VectorSource from 'ol/source/Vector';
import { AisFeatureProperties } from './features';
import { Coordinate } from 'ol/coordinate';
import { fromCircle } from 'ol/geom/Polygon';

type VesselData = {
  name: string;
  timestamp: number;
  mmsi: number;
  callSign: string;
  imo: number;
  shipType: number;
  draught: number;
  eta: number;
  posType: number;
  referencePointA: number;
  referencePointB: number;
  referencePointC: number;
  referencePointD: number;
  destination: string;
};

type AisLayer = {
  id: FeatureDataLayerId;
  shipTypes: Array<number>;
};

const aisLayers: Array<AisLayer> = [
  { id: 'aisvesselcargo', shipTypes: _.range(70, 79) },
  { id: 'aisvesseltanker', shipTypes: _.range(80, 89) },
  { id: 'aisvesselpassenger', shipTypes: _.range(60, 69) },
  { id: 'aisvesselhighspeed', shipTypes: _.range(40, 49) },
  { id: 'aisvesseltugandspecialcraft', shipTypes: [31, 32, 33, 34, 35, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59] },
  { id: 'aisvesselpleasurecraft', shipTypes: [36, 37] },
  { id: 'aisunspecified', shipTypes: _.range(90, 99) },
];

function addVesselData(locationFeatures: Feature<Geometry>[], vesselData: Array<VesselData>) {
  for (const l of locationFeatures) {
    const vessel = vesselData.find((v) => v.mmsi === l.get('mmsi'));
    if (vessel) {
      const vesselDimensions = calculateVesselDimensions(
        vessel.referencePointA,
        vessel.referencePointB,
        vessel.referencePointC,
        vessel.referencePointD
      );
      l.setProperties({
        name: vessel.name,
        callSign: vessel.callSign,
        imo: vessel.imo,
        shipType: vessel.shipType,
        draught: vessel.draught,
        eta: vessel.eta,
        posType: vessel.posType,
        referencePointA: vessel.referencePointA,
        referencePointB: vessel.referencePointB,
        referencePointC: vessel.referencePointC,
        referencePointD: vessel.referencePointD,
        destination: vessel.destination,
        vesselLength: vesselDimensions[0],
        vesselWidth: vesselDimensions[1],
      });
    }
  }
}

function useAisFeatures() {
  const { state } = useDvkContext();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(aisLayers.some((layer) => state.layers.includes(layer.id)));
  const [aisFeatures, setAisFeatures] = useState<Feature<Geometry>[]>([]);
  const vesselQuery = useFeatureData('aisvessel', true, 10 * 60 * 1000, enabled);
  const locationQuery = useFeatureData('aislocation', true, 10 * 1000, enabled);
  const dataUpdatedAt = Math.max(vesselQuery.dataUpdatedAt, locationQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(vesselQuery.errorUpdatedAt, locationQuery.errorUpdatedAt);
  const isPaused = vesselQuery.isPaused || locationQuery.isPaused;
  const isError = vesselQuery.isError || locationQuery.isError;

  useEffect(() => {
    setEnabled(aisLayers.some((layer) => state.layers.includes(layer.id)));
  }, [state.layers]);

  useEffect(() => {
    const vesselData = vesselQuery.data;
    const locationData = locationQuery.data;
    if (vesselData && locationData) {
      const format = new GeoJSON();
      const locationFeatures = format.readFeatures(locationData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      addVesselData(locationFeatures, vesselData);
      setAisFeatures(locationFeatures);
      setReady(true);
    }
  }, [vesselQuery.data, locationQuery.data, dataUpdatedAt]);
  return { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

/* Get vessel rotation on the map */
function getRotation(feature: Feature): number | undefined {
  const props = feature.getProperties() as AisFeatureProperties;
  const heading = getVesselHeading(props.heading, props.cog);
  const geom = feature.getGeometry() as Point;

  if (heading !== undefined && geom !== undefined) {
    return getPointRotationAngle(geom, heading);
  }
  return undefined;
}

function knotsToMetresPerSecond(x: number) {
  return (x * 1.852) / 3.6;
}

export function getVesselGeometry(feature: Feature): Polygon | undefined {
  const props = feature.getProperties() as AisFeatureProperties;
  const geom = feature.getGeometry() as Point;
  const rotation = getRotation(feature);
  if (geom && rotation !== undefined && props.vesselWidth && props.vesselLength) {
    const vesselMoving = isVesselMoving(props.navStat, props.sog);
    const polygonPoints: Array<number[]> = [];
    const coordinates = geom.getCoordinates();
    const x = coordinates[0];
    const y = coordinates[1];
    const w = props.vesselWidth;
    const h = props.vesselLength;
    const dx1 = props.referencePointC ? -props.referencePointC : 0;
    const dy1 = props.referencePointA ? props.referencePointA : 0;
    const dx2 = props.referencePointD ? props.referencePointD : 0;
    const dy2 = props.referencePointB ? -props.referencePointB : 0;

    /* Calculate vesselshaped polygon points starting from the bow clockwise */
    polygonPoints.push([x + dx1 + (dx2 - dx1) / 2, y + dy1]);
    polygonPoints.push([x + dx2, y + dy1 - h / 5]);
    polygonPoints.push([x + dx2, y + dy2]);
    if (vesselMoving) {
      polygonPoints.push([x + dx1 + (dx2 - dx1) / 2, y + dy2 + h / 5]);
    }
    polygonPoints.push([x + dx1, y + dy2]);
    polygonPoints.push([x + dx1, y + dy1 - h / 5]);

    const polygon = new Polygon([polygonPoints]);

    /* Cut circular hole to polygon if vessel is no moving */
    if (!vesselMoving) {
      const holeCenterCoord = [x + dx1 + (dx2 - dx1) / 2, y + dy1 - h / 4];
      const holePoly = fromCircle(new Circle(holeCenterCoord, w / 4));
      const c = holePoly.getCoordinates();
      polygon.appendLinearRing(new LinearRing(c[0]));
    }

    /* Rotate polygon to the rigth angle */
    polygon.rotate(-rotation, coordinates);
    return polygon;
  }
  return undefined;
}

export function getPathPredictorGeometry(feature: Feature, startFromBow: boolean) {
  const props = feature.getProperties() as AisFeatureProperties;
  const rotation = getRotation(feature);
  const speed = knotsToMetresPerSecond(props.sog);
  let point = feature.getGeometry() as Point;

  if (startFromBow) {
    /* Calculate vessel bow coordinates */
    const coordinates = point.getCoordinates();
    const x = coordinates[0];
    const y = coordinates[1];
    const dx1 = props.referencePointC ? -props.referencePointC : 0;
    const dy1 = props.referencePointA ? props.referencePointA : 0;
    const dx2 = props.referencePointD ? props.referencePointD : 0;

    const bowCoordinates = [x + dx1 + (dx2 - dx1) / 2, y + dy1];
    point = new Point(bowCoordinates);
    if (rotation !== undefined) {
      point.rotate(-rotation, coordinates);
    }
  } else {
    const vesselGeom = getVesselGeometry(feature);
    if (vesselGeom) {
      point = vesselGeom.getInteriorPoint();
    }
  }

  const pathCoords: Array<Coordinate> = [];
  pathCoords.push(point.getCoordinates());
  const step = 60;
  for (let i = 0; i < 360; i += step) {
    const nextPoint = translatePoint(point, props.cog, speed * step);
    pathCoords.push(nextPoint.getCoordinates());
    point = nextPoint;
  }
  return new LineString(pathCoords);
}

function updateAisLayerFeatures(id: FeatureDataLayerId, aisFeatures: Feature<Geometry>[]) {
  const aisLayer = aisLayers.find((al) => al.id === id);
  const source = dvkMap.getVectorSource(id);
  if (aisLayer && source) {
    const features = aisFeatures.filter((f) => aisLayer.shipTypes.includes(f.get('shipType')));
    source.clear(true);

    /* Add vessel features */
    features.forEach((f) => {
      const feat = new Feature();
      feat.setId(f.getId());
      feat.setProperties(f.getProperties(), true);
      feat.set('dataSource', id, true);
      feat.set('aisPoint', f.getGeometry()?.clone(), true);
      const vesselGeom = getVesselGeometry(f);
      if (vesselGeom !== undefined) {
        feat.setGeometry(vesselGeom);
      } else {
        feat.setGeometry(f.getGeometry());
      }
      source.addFeature(feat);
    });

    /* Add path predictor features */
    features.forEach((f) => {
      const props = f.getProperties() as AisFeatureProperties;
      if (isVesselMoving(props.navStat, props.sog) && props.sog > 0.2 && props.sog < 100 && props.cog && props.cog >= 0 && props.cog < 360) {
        source.addFeature(
          new Feature({
            geometry: getPathPredictorGeometry(f, false),
            featureType: f.get('featureType') + '_pathpredictor',
            realSizeVessel: false,
            vesselLength: f.get('vesselLength'),
            vesselWidth: f.get('vesselWidth'),
            cog: f.get('cog'),
          })
        );
        source.addFeature(
          new Feature({
            geometry: getPathPredictorGeometry(f, true),
            featureType: f.getProperties().featureType + '_pathpredictor',
            realSizeVessel: true,
            vesselLength: f.get('vesselLength'),
            vesselWidth: f.get('vesselWidth'),
            cog: f.get('cog'),
          })
        );
      }
    });
  }
}

function useAisLayer(layerId: FeatureDataLayerId) {
  const { state } = useDvkContext();
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(layerId);
    if (ready && state.layers.includes(layerId) && layer.get('dataUpdatedAt') !== dataUpdatedAt) {
      updateAisLayerFeatures(layerId, aisFeatures);
      layer.set('dataUpdatedAt', dataUpdatedAt, true);
    }
    layer.set('errorUpdatedAt', errorUpdatedAt, true);
  }, [ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, state.layers, layerId]);

  useEffect(() => {
    if (ready) {
      const layer = dvkMap.getFeatureLayer(layerId);
      const source = layer.getSource() as VectorSource;
      source.forEachFeature((f) => {
        if (f.get('featureType') === 'aisvessel_pathpredictor') {
          if (state.showAisPredictor) {
            /* Remove feature style -> uses layer style */
            f.setStyle();
          } else {
            /* Hide path predictor by overwriting layers style */
            f.setStyle(() => {
              return undefined;
            });
          }
        }
      });
      layer.changed();
    }
  }, [ready, state.showAisPredictor, layerId, dataUpdatedAt]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselCargoLayer(): DvkLayerState {
  return useAisLayer('aisvesselcargo');
}

export function useAisVesselTankerLayer() {
  return useAisLayer('aisvesseltanker');
}

export function useAisVesselPassengerLayer() {
  return useAisLayer('aisvesselpassenger');
}

export function useAisVesselHighSpeedLayer() {
  return useAisLayer('aisvesselhighspeed');
}

export function useAisVesselTugAndSpecialCraftLayer() {
  return useAisLayer('aisvesseltugandspecialcraft');
}

export function useAisVesselPleasureCraftLayer() {
  return useAisLayer('aisvesselpleasurecraft');
}

export function useAisUnspecifiedLayer() {
  return useAisLayer('aisunspecified');
}
