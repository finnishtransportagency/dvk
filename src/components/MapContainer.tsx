import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Map from 'ol/Map';
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { get as getProjection } from 'ol/proj';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import Zoom from 'ol/control/Zoom';
import MVT from 'ol/format/MVT';
import { stylefunction } from 'ol-mapbox-style';
import './MapContainer.css';
import { MAP } from '../utils/constants';
import 'ol/ol.css';
import CenterToOwnLocationControl from './CenterToOwnLocationControl';
import OpenSidebarMenuControl from './OpenSidebarMenuControl';
import LayerPopupControl from './LayerPopupControl';
import LayerModal from './LayerModal';
import { addAPILayers } from './layers';
import bgSeaMapStyles from './merikartta_nls_basemap_v1.json';
import bgLandMapStyles from './normikartta_nls_basemap_v1.json';

const MapContainer: React.FC = () => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.map.controls' });
  const mapElement = useRef<HTMLDivElement>(null);

  const [map, setMap] = useState<Map | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundMapType, setBackgroundMapType] = useState<'land' | 'sea'>('sea');

  const layerControl = new LayerPopupControl({
    label: '',
    tipLabel: t('layer.tipLabel'),
    setIsOpen: setIsOpen,
  });
  const layerControlRef = useRef<LayerPopupControl>(layerControl);

  // Font replacement so we do not need to load web fonts in the worker
  const getFonts = (fonts: Array<string>) => {
    return fonts.map(() => {
      return 'Exo2';
    });
  };

  useLayoutEffect(() => {
    const apiKey = process.env.REACT_APP_BG_MAP_API_KEY;
    const tileUrl = process.env.REACT_APP_FRONTEND_DOMAIN_NAME
      ? 'https://' +
        process.env.REACT_APP_FRONTEND_DOMAIN_NAME +
        `/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/ETRS-TM35FIN/{z}/{y}/{x}.pbf?api-key=${apiKey}`
      : `/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/ETRS-TM35FIN/{z}/{y}/{x}.pbf?api-key=${apiKey}`;
    const resolutions = [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5];
    const extent = [-548576, 6291456, 1548576, 8388608];
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

    if (!map) {
      const olMap = new Map({
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

      let zoomControl = new Zoom({
        zoomInLabel: '',
        zoomOutLabel: '',
        zoomInTipLabel: t('zoom.zoomInTipLabel'),
        zoomOutTipLabel: t('zoom.zoomOutTipLabel'),
      });

      olMap.addControl(zoomControl);

      let centerToOwnLocationControl = new CenterToOwnLocationControl({
        label: '',
        tipLabel: t('ownLocation.tipLabel'),
      });

      let openSidebarMenuControl = new OpenSidebarMenuControl({
        label: '',
        tipLabel: t('openMenu.tipLabel'),
      });

      olMap.addControl(centerToOwnLocationControl);
      olMap.addControl(openSidebarMenuControl);
      olMap.addControl(layerControlRef.current);

      i18n.on('languageChanged', () => {
        olMap.removeControl(zoomControl);
        zoomControl = new Zoom({
          zoomInLabel: '',
          zoomOutLabel: '',
          zoomInTipLabel: t('zoom.zoomInTipLabel'),
          zoomOutTipLabel: t('zoom.zoomOutTipLabel'),
        });
        olMap.addControl(zoomControl);

        olMap.removeControl(centerToOwnLocationControl);
        centerToOwnLocationControl = new CenterToOwnLocationControl({
          label: '',
          tipLabel: t('ownLocation.tipLabel'),
        });
        olMap.addControl(centerToOwnLocationControl);

        olMap.removeControl(openSidebarMenuControl);
        openSidebarMenuControl = new OpenSidebarMenuControl({
          label: '',
          tipLabel: t('openMenu.tipLabel'),
        });
        olMap.addControl(openSidebarMenuControl);

        olMap.removeControl(layerControlRef.current);
        layerControlRef.current = new LayerPopupControl({
          label: '',
          tipLabel: t('layer.tipLabel'),
          setIsOpen: setIsOpen,
        });
        olMap.addControl(layerControlRef.current);
      });
      addAPILayers(olMap);
      setMap(olMap);
    } else {
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

      const setBackgroundLayers = (olMap: Map, styleJson: any, bgColor: string) => {
        map
          .getLayers()
          .getArray()
          .forEach((layer) => {
            if (layer.get('type') === 'background') {
              map.removeLayer(layer);
            }
          });

        const backLayers: Array<VectorTileLayer> = [];

        const buckets: Array<{ source: string; layers: Array<string> }> = [];

        let currentSource: string;
        styleJson.layers.forEach((layer: any) => {
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
            background: bgColor,
          });
          stylefunction(layer, styleJson, bucket.layers, resolutions, null, undefined, getFonts);
          layer.set('type', 'background');
          backLayers.push(layer);
        });

        const mapLayers = map.getLayers();

        backLayers.forEach((layer, index) => {
          mapLayers.insertAt(index, layer);
        });
      };

      if (backgroundMapType === 'sea') {
        setBackgroundLayers(map, bgSeaMapStyles, '#feefcf');
      } else if (backgroundMapType === 'land') {
        setBackgroundLayers(map, bgLandMapStyles, '#ffffff');
      }

      setTimeout(() => {
        map.updateSize();
      }, 100);
    }
  }, [t, i18n, map, backgroundMapType]);

  return (
    <>
      <div id="mapContainer" ref={mapElement}></div>
      <LayerModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        layerPopupControl={layerControlRef.current}
        bgMapType={backgroundMapType}
        setBgMapType={setBackgroundMapType}
      />
    </>
  );
};

export default MapContainer;
