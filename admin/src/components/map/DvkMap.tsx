import Map from 'ol/Map';
import View from 'ol/View';
import Projection from 'ol/proj/Projection';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';
import { BackgroundLayerId, FeatureLayerId, MAP } from '../../utils/constants';
import { MousePosition, ScaleLine, Zoom, Rotate } from 'ol/control';
import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import { useTranslation } from 'react-i18next';
import MVT from 'ol/format/MVT';
import { stylefunction } from 'ol-mapbox-style';
import bgSeaMapStyles from './merikartta_nls_basemap_v1.json';
import bgLandMapStyles from './normikartta_nls_basemap_v1.json';
import FitFeaturesOnMapControl from './mapControls/FitFeaturesOnMapControl';
import MapDetailsControl from './mapControls/MapDetailsControl';
import LayerPopupControl from './mapControls/LayerPopupControl';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
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
import TakeScreenshotControl from './mapControls/TakeScreenshotControl';
import SelectPortraitControl from './mapControls/SelectPortraitControl';
import SelectLandscapeControl from './mapControls/SelectLandscapeControl';
import MapMaskControl from './mapControls/MapMaskControl';
import { Orientation } from '../../graphql/generated';

export type BackgroundMapType = 'sea' | 'land';
export type OrientationType = Orientation | '';

class DvkMap {
  public olMap: Map | null = null;

  private zoomControl: Zoom = new Zoom({
    zoomInLabel: '',
    zoomOutLabel: '',
    zoomInTipLabel: '',
    zoomOutTipLabel: '',
  });

  private rotateControl: Rotate = new Rotate({
    autoHide: false,
    tipLabel: '',
  });

  private readonly infoTextControl: InfoTextControl = new InfoTextControl();

  private readonly fitFeaturesOnMapControl: FitFeaturesOnMapControl = new FitFeaturesOnMapControl();

  private readonly takeScreenshotControl: TakeScreenshotControl = new TakeScreenshotControl();

  private readonly selectPortraitControl: SelectPortraitControl = new SelectPortraitControl();

  private readonly selectLandscapeControl: SelectLandscapeControl = new SelectLandscapeControl();

  private readonly mapMaskControl: MapMaskControl = new MapMaskControl();

  private readonly mapDetailsControl: MapDetailsControl = new MapDetailsControl();

  private readonly layerPopupControl: LayerPopupControl = new LayerPopupControl();

  private backgroundMapType: BackgroundMapType = 'sea';

  private orientationType: OrientationType = '';

  private source: VectorTileSource | null = null;

  // eslint-disable-next-line
  public t: any;

  // eslint-disable-next-line
  public i18n: any;

  public initialized = false;

  public tileStatus: 'ok' | 'error' = 'ok';

  public onTileStatusChange: () => void = () => {};

  // eslint-disable-next-line
  init(t: any, i18n: any) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.t = t;
    this.i18n = i18n;
    const apiKey = process.env.REACT_APP_BG_MAP_API_KEY;
    const cloudFrontUrl = process.env.REACT_APP_FRONTEND_DOMAIN_NAME;
    const bgMapApiUrl = process.env.REACT_APP_BG_MAP_API_URL;
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
        this.zoomControl,
        this.fitFeaturesOnMapControl,
        //this.takeScreenshotControl,
        //this.selectPortraitControl,
        //this.selectLandscapeControl,
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
        this.layerPopupControl,
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
    this.setBackgroundMapType(this.backgroundMapType);
    this.setOrientationType(this.orientationType);
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

      source.on('tileloadend', () => {
        if (this.tileStatus !== 'ok') {
          this.tileStatus = 'ok';
          this.onTileStatusChange();
        }
      });

      source.on('tileloaderror', () => {
        if (this.tileStatus !== 'error') {
          this.tileStatus = 'error';
          this.onTileStatusChange();
        }
      });

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

  public setBackgroundMapType = (bgMapType: BackgroundMapType) => {
    if (this.olMap && bgMapType === 'sea') {
      this.setBackgroundLayers(this.olMap, bgSeaMapStyles, '#feefcf', '#c7eafc');
    } else if (this.olMap && bgMapType === 'land') {
      this.setBackgroundLayers(this.olMap, bgLandMapStyles, '#ffffff', 'rgb(158,189,255)');
    }
  };

  public setOrientationType = (orientationType: OrientationType) => {
    if (this.olMap) {
      this.orientationType = orientationType;
      this.takeScreenshotControl.setDisabled(!orientationType);

      const targetElement = this.olMap?.getTargetElement();
      targetElement?.classList.remove(Orientation.Portrait, Orientation.Landscape);
      if (orientationType) targetElement?.classList.add(orientationType);
    }
  };

  public getCanvasDimensions = () => {
    let canvasSize = [0, 0];
    if (this.olMap) {
      const orientationType = this.getOrientationType();
      if (orientationType === Orientation.Portrait) {
        canvasSize = [595, 842];
      }
      if (orientationType === Orientation.Landscape) {
        canvasSize = [842, 595];
      }
    }
    return canvasSize;
  };

  public printCurrentMapView = () => {
    if (this.olMap) {
      const mapScale = this.olMap?.getViewport().querySelector('.ol-scale-line-inner');
      const mapScaleWidth = mapScale?.getAttribute('style')?.replace(/\D/g, '');
      const rotation = this.olMap?.getView().getRotation();

      console.log(mapScale, rotation, mapScaleWidth, mapScale?.innerHTML);

      // Merge canvases to one canvas
      const mapCanvas = document.createElement('canvas');
      const mapSize = this.olMap?.getSize() || [0, 0];
      mapCanvas.width = mapSize[0];
      mapCanvas.height = mapSize[1];
      const mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(this.olMap?.getViewport().querySelectorAll('.ol-layer canvas'), function (canvas) {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
          if (mapContext) mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          let matrix;
          const transform = canvas.style.transform;
          if (transform) {
            // Get the transform parameters from the style's transform matrix
            matrix = transform
              .match(/^matrix\(([^(]*)\)$/)[1]
              .split(',')
              .map(Number);
          } else {
            matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
          }
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
          const backgroundColor = canvas.parentNode.style.backgroundColor;
          if (backgroundColor && mapContext) {
            mapContext.fillStyle = backgroundColor;
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
          }
          if (mapContext) mapContext.drawImage(canvas, 0, 0);
        }
      });
      if (mapContext) {
        mapContext.globalAlpha = 1;
        mapContext.setTransform(1, 0, 0, 1, 0, 0);
      }

      // Crop the canvas and create image
      const mapCanvasCropped = document.createElement('canvas');
      const canvasSize = this.getCanvasDimensions();
      mapCanvasCropped.width = canvasSize[0];
      mapCanvasCropped.height = canvasSize[1];
      const mapContextCropped = mapCanvasCropped.getContext('2d');
      if (mapContextCropped)
        mapContextCropped.drawImage(
          mapCanvas,
          (mapSize[0] - mapCanvasCropped.width) / 2,
          (mapSize[1] - mapCanvasCropped.height) / 2,
          mapCanvasCropped.width,
          mapCanvasCropped.height,
          0,
          0,
          mapCanvasCropped.width,
          mapCanvasCropped.height
        );

      const img = new Image();
      img.src = mapCanvasCropped.toDataURL('image/png');
      const mapExport = document.getElementById('mapExport');
      if (mapExport) {
        mapExport.innerHTML = '';
        mapExport.appendChild(img);
      }
    }
  };

  public translate = () => {
    this.olMap?.removeControl(this.zoomControl);
    this.zoomControl = new Zoom({
      zoomInLabel: '',
      zoomOutLabel: '',
      zoomInTipLabel: this.t('homePage.map.controls.zoom.zoomInTipLabel'),
      zoomOutTipLabel: this.t('homePage.map.controls.zoom.zoomOutTipLabel'),
    });
    this.olMap?.addControl(this.zoomControl);

    const span = document.createElement('span');
    span.innerHTML = '<img src="' + north_arrow_small + '">';
    this.olMap?.removeControl(this.rotateControl);
    this.rotateControl = new Rotate({
      autoHide: false,
      label: span,
      tipLabel: this.t('homePage.map.controls.resetRotation'),
    });
    this.olMap?.addControl(this.rotateControl);

    this.fitFeaturesOnMapControl.setTipLabel(this.t('homePage.map.controls.features.tipLabel'));
    this.takeScreenshotControl.setTipLabel(this.t('homePage.map.controls.screenshot.tipLabel'));
    this.selectPortraitControl.setTipLabel(this.t('homePage.map.controls.orientation.selectPortrait'));
    this.selectLandscapeControl.setTipLabel(this.t('homePage.map.controls.orientation.selectLandscape'));
    this.mapDetailsControl.setMousePositionLabel(this.t('homePage.map.controls.mapDetails.mousePositionLabel'));
    this.layerPopupControl.setTipLabel(this.t('homePage.map.controls.layer.tipLabel'));
    this.infoTextControl.setText(this.t('homePage.map.controls.infoText'));

    // Workaround to add aria-labels for Zoom control (no support OOTB)
    const zoomInButton = this.olMap?.getViewport().querySelector('.ol-zoom-in') as HTMLButtonElement;
    zoomInButton.ariaLabel = this.t('homePage.map.controls.zoom.zoomInTipLabel');
    const zoomOutButton = this.olMap?.getViewport().querySelector('.ol-zoom-out') as HTMLButtonElement;
    zoomOutButton.ariaLabel = this.t('homePage.map.controls.zoom.zoomOutTipLabel');
    const rotationResetButton = this.olMap?.getViewport().querySelector('.ol-rotate') as HTMLButtonElement;
    rotationResetButton.ariaLabel = this.t('homePage.map.controls.resetRotation');
  };

  public addLayerPopupControl = () => {
    this.layerPopupControl?.setMap(this.olMap);
  };

  public addFitFeaturesOnMapControl = () => {
    this.fitFeaturesOnMapControl?.setMap(this.olMap);
  };

  public addTakeScreenshotControl = () => {
    this.takeScreenshotControl?.setMap(this.olMap);
  };

  public addSelectPortraitControl = () => {
    this.selectPortraitControl?.setMap(this.olMap);
  };

  public addSelectLandscapeControl = () => {
    this.selectLandscapeControl?.setMap(this.olMap);
  };

  public addZoomControl = () => {
    this.zoomControl?.setMap(this.olMap);
  };

  public addRotationControl = () => {
    this.rotateControl?.setMap(this.olMap);
  };

  public setTarget = (target: HTMLElement | string | undefined) => {
    this.olMap?.setTarget(target);
    if (target !== undefined) {
      const targetElement = this.olMap?.getTargetElement();
      targetElement?.classList.add('dvkMap');
    }
  };

  public getBackgroundMapType = () => {
    return this.backgroundMapType;
  };

  public getOrientationType = () => {
    return this.orientationType;
  };

  public getLayerPopupControl = () => {
    return this.layerPopupControl;
  };

  public getFeatureLayer(layerId: FeatureLayerId | BackgroundLayerId) {
    return this.olMap?.getAllLayers().find((layerObj) => layerId === layerObj.getProperties().id) as Layer;
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
