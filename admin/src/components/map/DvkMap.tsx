import Map from 'ol/Map';
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';
import { BackgroundLayerId, FeatureLayerId, Lang, MAP } from '../../utils/constants';
import { MousePosition, ScaleLine, Rotate } from 'ol/control';
import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import { useTranslation } from 'react-i18next';
import MVT from 'ol/format/MVT';
import { stylefunction } from 'ol-mapbox-style';
import bgSeaMapStyles from './merikartta_nls_basemap_v1.json';
import MapDetailsControl from './mapControls/MapDetailsControl';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import 'ol/ol.css';
import './DvkMap.css';
import { addAPILayers } from './layers';
import VectorSource from 'ol/source/Vector';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import { defaults } from 'ol/interaction/defaults';
import north_arrow_small from '../../theme/img/north_arrow_small.svg';
import InfoTextControl from './mapControls/InfoTextControl';
import VectorImageLayer from 'ol/layer/VectorImage';
import MapMaskControl from './mapControls/MapMaskControl';
import { Orientation } from '../../graphql/generated';
import { Extent } from 'ol/extent';
import { Stroke } from 'ol/style';

type OrientationType = Orientation | '';
type LangType = Lang | '';

class DvkMap {
  public olMap: Map | null = null;

  private rotateControl: Rotate = new Rotate({
    autoHide: false,
    tipLabel: '',
  });

  private readonly infoTextControl: InfoTextControl = new InfoTextControl();

  private readonly mapMaskControl: MapMaskControl = new MapMaskControl();

  private readonly mapDetailsControl: MapDetailsControl = new MapDetailsControl();

  private orientationType: OrientationType = '';

  private mapLanguage: LangType = '';

  private source: VectorTileSource | null = null;

  // eslint-disable-next-line
  public t: any;

  // eslint-disable-next-line
  public i18n: any;

  public initialized = false;

  public currentExtent: Extent | null = null;
  // eslint-disable-next-line
  init(t: any, i18n: any) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.t = t;
    this.i18n = i18n;
    const apiKey = import.meta.env.VITE_APP_BG_MAP_API_KEY;
    const cloudFrontUrl = import.meta.env.VITE_APP_FRONTEND_DOMAIN_NAME;
    const bgMapApiUrl = import.meta.env.VITE_APP_BG_MAP_API_URL;
    let tileUrl;
    if (cloudFrontUrl) {
      tileUrl = `https://${cloudFrontUrl}/mml/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/ETRS-TM35FIN/{z}/{y}/{x}.pbf`;
    } else if (bgMapApiUrl) {
      tileUrl = `https://${bgMapApiUrl}/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/ETRS-TM35FIN/{z}/{y}/{x}.pbf?api-key=${apiKey}`;
    } else {
      tileUrl = '/mml/vectortiles/taustakartta/wmts/1.0.0/taustakartta/default/v20/ETRS-TM35FIN/{z}/{y}/{x}.pbf';
    }
    const resolutions = [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5];
    const extent = [-548576, 6291456, 1548576, 8388608];
    const tileGrid = new TileGrid({
      extent: extent,
      resolutions: resolutions,
      tileSize: [256, 256],
    });

    proj4.defs('EPSG:4258', '+proj=longlat +ellps=GRS80 +no_defs +type=crs');
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs('EPSG:3395', '+proj=merc +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs');
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
      pixelRatio: 1,
      view: new View({
        projection: projection,
        resolutions: MAP.RESOLUTIONS,
        center: MAP.INIT_CENTER,
        resolution: MAP.INIT_RESOLUTION,
        extent: MAP.EXTENT,
        constrainOnlyCenter: true,
      }),
      controls: [
        this.mapMaskControl,
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
        this.rotateControl,
        this.infoTextControl,
      ],
      interactions: defaults({ altShiftDragRotate: true, pinchRotate: true }),
    });

    // override with tileURL
    // styleJSON has tileJSON url which does not work without further dev
    this.source = new VectorTileSource({
      projection: projection,
      tileGrid: tileGrid,
      format: new MVT(),
      url: tileUrl,
    });

    const bgFinlandLayer = new VectorImageLayer({
      properties: { id: 'finland' },
      source: new VectorSource({
        features: [],
        overlaps: false,
      }),
      zIndex: 1,
      imageRatio: 3,
    });

    this.olMap.addLayer(bgFinlandLayer);
    const bgBalticseaLayer = new VectorImageLayer({
      properties: { id: 'balticsea' },
      source: new VectorSource({
        features: [],
        overlaps: false,
      }),
      zIndex: 4,
      imageRatio: 3,
    });
    this.olMap.addLayer(bgBalticseaLayer);

    const bgMmlsatamatLayer = new VectorLayer({
      properties: { id: 'mml_satamat' },
      source: new VectorSource(),
      maxResolution: 30,
      zIndex: 104,
      renderBuffer: 1,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
      renderOrder: undefined,
    });
    this.olMap.addLayer(bgMmlsatamatLayer);

    this.setBackgroundLayers(this.olMap, bgSeaMapStyles, '#feefcf', '#c7eafc');
    this.setOrientationType(this.orientationType);
    this.setMapLanguage(this.mapLanguage);
    this.translate();
  }
  // eslint-disable-next-line
  private setBackgroundLayers = (olMap: Map, styleJson: any, bgColor: string, waterColor: string) => {
    const resolutions = [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5];
    // Font replacement so we do not need to load web fonts in the worker
    const getFonts = (fonts: Array<string>) => {
      return fonts.map(() => {
        return 'Exo2';
      });
    };

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
        declutter: false,
        source,
        minResolution: undefined,
        maxResolution: undefined,
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        useInterimTilesOnError: false,
      });
      stylefunction(layer, styleJson, bucket.layers, resolutions, null, undefined, getFonts);
      layer.set('type', 'backgroundTile');
      backLayers.push(layer);
    });

    const bgFiLayer = this.getFeatureLayer('finland') as VectorLayer<VectorSource>;
    bgFiLayer.setStyle(
      new Style({
        fill: new Fill({
          color: bgColor,
        }),
      })
    );

    const bgBsLayer = this.getFeatureLayer('balticsea') as VectorLayer<VectorSource>;
    bgBsLayer.setStyle(
      new Style({
        fill: new Fill({
          color: waterColor,
        }),
      })
    );

    const bgMmlsatamatLayer = this.getFeatureLayer('mml_satamat') as VectorLayer<VectorSource>;
    bgMmlsatamatLayer.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#333333',
          width: 1,
        }),
        fill: new Fill({
          color: '#d8d8d8',
        }),
      })
    );

    olMap
      .getLayers()
      .getArray()
      .filter((layer) => layer.get('type') === 'backgroundTile')
      .forEach((layer) => olMap.removeLayer(layer));

    backLayers.forEach((layer, index) => {
      // Background vector layers must be behind this
      layer.set('zIndex', 10 + index);
      olMap.addLayer(layer);
    });
  };

  public setOrientationType = (orientationType: OrientationType) => {
    if (this.olMap) {
      this.orientationType = orientationType;
      const targetElement = this.olMap?.getTargetElement();
      targetElement?.classList.remove(Orientation.Portrait, Orientation.Landscape);
      if (orientationType) targetElement?.classList.add(orientationType);
    }
  };

  public setMapLanguage = (lang: LangType) => {
    this.mapLanguage = lang;
  };

  public getCanvasDimensions = () => {
    let canvasSize = [0, 0];
    if (this.olMap) {
      const orientationType = this.getOrientationType();
      if (orientationType === Orientation.Portrait) {
        canvasSize = [MAP.PRINT.EXPORT_WIDTH, MAP.PRINT.EXPORT_HEIGHT];
      }
      if (orientationType === Orientation.Landscape) {
        canvasSize = [MAP.PRINT.EXPORT_HEIGHT, MAP.PRINT.EXPORT_WIDTH];
      }
    }
    return canvasSize;
  };

  public translate = () => {
    const span = document.createElement('span');
    span.innerHTML = '<img src="' + north_arrow_small + '">';
    this.olMap?.removeControl(this.rotateControl);
    this.rotateControl = new Rotate({
      autoHide: false,
      label: span,
      tipLabel: this.t('homePage.map.controls.resetRotation'),
    });
    this.olMap?.addControl(this.rotateControl);

    this.mapDetailsControl.setMousePositionLabel(this.t('homePage.map.controls.mapDetails.mousePositionLabel'));
    this.infoTextControl.setText(this.t('homePage.map.controls.infoText'));

    // Workaround to add aria-labels for Zoom control (no support OOTB)
    const rotationResetButton = this.olMap?.getViewport().querySelector('.ol-rotate') as HTMLButtonElement;
    rotationResetButton.ariaLabel = this.t('homePage.map.controls.resetRotation');
  };

  public addRotationControl = () => {
    this.rotateControl?.setMap(this.olMap);
  };

  public setTarget = (target: HTMLElement | string | undefined) => {
    this.olMap?.setTarget(target);
    if (target !== undefined) {
      const targetElement = this.olMap?.getTargetElement();
      targetElement?.classList.add('dvkMap');
      if (this.getOrientationType()) targetElement?.classList.add(this.getOrientationType());
    }
  };

  public getOrientationType = () => {
    return this.orientationType;
  };

  public getMapLanguage = () => {
    return this.mapLanguage;
  };

  public getFeatureLayer(layerId: FeatureLayerId | BackgroundLayerId) {
    return this.olMap?.getAllLayers().find((layerObj) => layerId === layerObj.getProperties().id) as Layer;
  }

  public getFeatureLayers(layerId: FeatureLayerId | BackgroundLayerId) {
    return this.olMap?.getAllLayers().filter((layerObj) => layerId === layerObj.getProperties().id) as Layer[];
  }

  public getVectorSource(layerId: FeatureLayerId | BackgroundLayerId) {
    const layer = this.olMap?.getAllLayers().find((layerObj) => layerId === layerObj.getProperties().id) as Layer;
    return layer.getSource() as VectorSource;
  }
}

const dvkMap = new DvkMap();

function InitDvkMap() {
  const { t, i18n } = useTranslation();
  if (!dvkMap.initialized) {
    dvkMap.init(t, i18n);
    if (dvkMap.olMap) {
      addAPILayers(dvkMap.olMap);
    }
    i18n.on('languageChanged', () => {
      dvkMap.translate();
    });
  }
}

export function getMap() {
  return dvkMap;
}

export { InitDvkMap };
export default dvkMap;
