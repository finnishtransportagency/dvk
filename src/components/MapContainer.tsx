import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { get as getProjection } from 'ol/proj';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import MVT from 'ol/format/MVT';
import { stylefunction } from 'ol-mapbox-style';
import './MapContainer.css';
import bgMapStyles from './taustakartta.json';
import { MAP } from '../utils/constants';

const MapContainer: React.FC = () => {
  const mapElement = useRef<HTMLDivElement>(null);

  const [mapInitialized, initializeMap] = useState(false);

  useEffect(() => {
    if (mapInitialized) {
      return;
    }
    initializeMap(true);
    const apiKey = process.env.REACT_APP_BG_MAP_API_KEY;
    const tileUrl = `https://avoin-karttakuva.maanmittauslaitos.fi/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/ETRS-TM35FIN/{z}/{y}/{x}.pbf?api-key=${apiKey}`;
    const extent = [-548576, 6291456, 1548576, 8388608];
    const resolutions = [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5];
    const tileGrid = new TileGrid({
      extent: extent,
      resolutions: resolutions,
      tileSize: [256, 256],
    });

    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs(MAP.EPSG, '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
    register(proj4);
    let projection = getProjection(MAP.EPSG);

    projection?.setExtent(extent);

    if (!projection) {
      projection = new Projection({
        code: MAP.EPSG,
      });
    }

    // Font replacement so we do not need to load web fonts in the worker
    const getFonts = (fonts: Array<string>) => {
      return fonts.map(() => {
        return 'Exo2';
      });
    };

    const map = new Map({
      target: mapElement.current as HTMLElement,
      view: new View({
        projection: projection,
        resolutions: MAP.RESOLUTIONS,
        center: MAP.INIT_CENTER,
        resolution: MAP.INIT_RESOLUTION,
        extent: MAP.EXTENT,
        constrainOnlyCenter: true,
      }),
      controls: [],
    });
    // override with tileURL
    // styleJSON has tileJSON url which does not work without further dev
    const sources: { taustakartta: VectorTileSource } = {
      taustakartta: new VectorTileSource({
        projection: projection,
        tileGrid: tileGrid,
        format: new MVT(),
        url: tileUrl,
      }),
    };

    const layers: Array<VectorTileLayer> = [];
    const buckets: Array<{ source: string; layers: Array<string> }> = [];

    let currentSource: string;
    bgMapStyles.layers.forEach((layer) => {
      if (!layer.source) {
        return;
      }
      if (currentSource !== layer.source) {
        currentSource = layer.source;
        buckets.push({
          source: layer.source,
          layers: [],
        });
      }
      buckets[buckets.length - 1].layers.push(layer.id);
    });

    buckets.forEach((bucket: { source: string; layers: Array<string> }) => {
      const source = sources.taustakartta;
      if (!source) {
        return;
      }
      const layer = new VectorTileLayer({
        declutter: true,
        source,
      });
      stylefunction(layer, bgMapStyles, bucket.layers, resolutions, null, undefined, getFonts);
      layers.push(layer);
    });

    layers.forEach((layer) => {
      map.addLayer(layer);
    });
    setTimeout(() => {
      map.updateSize();
    }, 0);
  }, [mapInitialized]);

  return <div id="mapContainer" ref={mapElement}></div>;
};

export default MapContainer;
