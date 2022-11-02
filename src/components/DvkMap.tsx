import Map from 'ol/Map';
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';
import { MAP } from '../utils/constants';
import { MousePosition, ScaleLine, Zoom } from 'ol/control';
import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import { useTranslation } from 'react-i18next';
import MVT from 'ol/format/MVT';
import { stylefunction } from 'ol-mapbox-style';
import bgSeaMapStyles from './merikartta_nls_basemap_v1.json';
import bgLandMapStyles from './normikartta_nls_basemap_v1.json';
import CenterToOwnLocationControl from './mapControls/CenterToOwnLocationControl';
import OpenSidebarMenuControl from './mapControls/OpenSidebarMenuControl';
import MapDetailsControl from './mapControls/MapDetailsControl';
import LayerPopupControl from './mapControls/LayerPopupControl';
import { coordinatesToStringHDM } from '../utils/CoordinateUtils';
import 'ol/ol.css';
import './DvkMap.css';
import SearchbarControl from './mapControls/SearchbarControl';
import { addAPILayers } from './layers';
import { RouteComponentProps } from 'react-router-dom';
import VectorSource from 'ol/source/Vector';

export type BackgroundMapType = 'sea' | 'land';

class DvkMap {
  public olMap: Map | null = null;

  private zoomControl: Zoom = new Zoom({
    zoomInLabel: '',
    zoomOutLabel: '',
    zoomInTipLabel: '',
    zoomOutTipLabel: '',
  });

  private readonly centerToOwnLocationControl: CenterToOwnLocationControl = new CenterToOwnLocationControl();

  private readonly openSidebarMenuControl: OpenSidebarMenuControl = new OpenSidebarMenuControl();

  private readonly mapDetailsControl: MapDetailsControl = new MapDetailsControl();

  private readonly layerPopupControl: LayerPopupControl = new LayerPopupControl();

  private readonly searchbarControl: SearchbarControl = new SearchbarControl();

  private backgroundMapType: BackgroundMapType = 'sea';

  private source: VectorTileSource | null = null;

  // eslint-disable-next-line
  private t: any;

  public initialized = false;

  // eslint-disable-next-line
  init(t: any) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.t = t;
    const apiKey = process.env.REACT_APP_BG_MAP_API_KEY;
    const tileUrl = process.env.REACT_APP_BG_MAP_API_URL
      ? 'https://' +
        process.env.REACT_APP_BG_MAP_API_URL +
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

    this.olMap = new Map({
      view: new View({
        projection: projection,
        resolutions: MAP.RESOLUTIONS,
        center: MAP.INIT_CENTER,
        resolution: MAP.INIT_RESOLUTION,
        extent: MAP.EXTENT,
        constrainOnlyCenter: true,
      }),
      controls: [
        this.zoomControl,
        this.centerToOwnLocationControl,
        this.openSidebarMenuControl,
        this.mapDetailsControl,
        new ScaleLine({
          units: 'metric',
          target: this.mapDetailsControl.getScaleLineElement(),
        }),
        new MousePosition({
          coordinateFormat: coordinatesToStringHDM,
          projection: 'EPSG:4326',
          target: this.mapDetailsControl.getMousePositionElement(),
        }),
        this.layerPopupControl,
        this.searchbarControl,
      ],
    });

    addAPILayers(this.olMap);

    // override with tileURL
    // styleJSON has tileJSON url which does not work without further dev
    this.source = new VectorTileSource({
      projection: projection,
      tileGrid: tileGrid,
      format: new MVT(),
      url: tileUrl,
    });

    this.setBackGroundMapType(this.backgroundMapType);
    this.translate();

    setTimeout(() => {
      this.olMap?.updateSize();
    }, 100);
  }

  // eslint-disable-next-line
  private setBackgroundLayers = (olMap: Map, styleJson: any, bgColor: string) => {
    const resolutions = [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5];
    // Font replacement so we do not need to load web fonts in the worker
    const getFonts = (fonts: Array<string>) => {
      return fonts.map(() => {
        return 'Exo2';
      });
    };

    olMap
      .getLayers()
      .getArray()
      .forEach((layer) => {
        if (layer.get('type') === 'background') {
          olMap.removeLayer(layer);
        }
      });

    const backLayers: Array<VectorTileLayer> = [];

    const buckets: Array<{ source: string; layers: Array<string> }> = [];

    let currentSource: string;
    // eslint-disable-next-line
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
      const source = this.source;
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

    const mapLayers = olMap.getLayers();

    backLayers.forEach((layer, index) => {
      mapLayers.insertAt(index, layer);
    });
  };

  public setBackGroundMapType = (bgMapType: BackgroundMapType) => {
    if (this.olMap && bgMapType === 'sea') {
      this.setBackgroundLayers(this.olMap, bgSeaMapStyles, '#feefcf');
    } else if (this.olMap && bgMapType === 'land') {
      this.setBackgroundLayers(this.olMap, bgLandMapStyles, '#ffffff');
    }
  };

  public translate = () => {
    this.olMap?.removeControl(this.zoomControl);
    this.zoomControl = new Zoom({
      zoomInLabel: '',
      zoomOutLabel: '',
      zoomInTipLabel: this.t('zoom.zoomInTipLabel'),
      zoomOutTipLabel: this.t('zoom.zoomOutTipLabel'),
    });
    this.olMap?.addControl(this.zoomControl);

    this.centerToOwnLocationControl.setTipLabel(this.t('ownLocation.tipLabel'));
    this.openSidebarMenuControl.setTipLabel(this.t('openMenu.tipLabel'));
    this.mapDetailsControl.setCopyrightLabel(this.t('mapDetails.copyrightLabel'));
    this.mapDetailsControl.setMousePositionLabel(this.t('mapDetails.mousePositionLabel'));
    this.layerPopupControl.setTipLabel(this.t('layer.tipLabel'));
    this.searchbarControl?.setPlaceholder(this.t('searchbar.placeholder'));
  };

  public addShowSidebarMenuControl = () => {
    this.openSidebarMenuControl?.setMap(this.olMap);
  };

  public removeShowSidebarMenuControl = () => {
    this.openSidebarMenuControl?.setMap(null);
  };

  public addSearchbarControl = () => {
    this.searchbarControl?.setMap(this.olMap);
  };

  public removeSearchbarControl = () => {
    this.searchbarControl?.setMap(null);
  };

  public setTarget = (target: HTMLElement | string | undefined) => {
    this.olMap?.setTarget(target);
    if (target !== undefined) {
      const targetElement = this.olMap?.getTargetElement();
      targetElement?.classList.add('dvkMap');
      setTimeout(() => {
        this.olMap?.updateSize();
      }, 100);
    }
  };

  public setHistory = (history: RouteComponentProps['history']) => {
    this.searchbarControl.setHistory(history);
  };

  public getBackgroundMapType = () => {
    return this.backgroundMapType;
  };

  public getLayerPopupControl = () => {
    return this.layerPopupControl;
  };

  public getSearchbarControl = () => {
    return this.searchbarControl;
  };

  public getVectorSource(layerId: string) {
    const layer = this.olMap?.getAllLayers().find((layerObj) => layerId === layerObj.getProperties().id);
    return layer ? (layer.getSource() as VectorSource) : undefined;
  }
}

const dvkMap = new DvkMap();

function InitDvkMap() {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.map.controls' });
  if (!dvkMap.initialized) {
    dvkMap.init(t);
    i18n.on('languageChanged', () => {
      dvkMap.translate();
    });
  }
}

export function useMap() {
  return dvkMap;
}

export { InitDvkMap };
export default dvkMap;
