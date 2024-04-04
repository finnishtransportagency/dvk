import { isPlatform } from '@ionic/react';
import dvkMap, { getMap } from '../components/DvkMap';
import { FairwayCardPartsFragment, Text } from '../graphql/generated';
import { FeatureDataLayerId, FeatureLayerId, MAP, MAX_HITS, MINIMUM_QUERYLENGTH } from './constants';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { MarineWarningFeatureProperties } from '../components/features';
import coastal from '../theme/img/coastal_warning_icon.svg';
import local from '../theme/img/local_warning_icon.svg';
import boaters from '../theme/img/warning_to_boaters_icon.svg';
import * as olExtent from 'ol/extent';

export const isMobile = () => {
  return isPlatform('iphone') || (isPlatform('android') && !isPlatform('tablet'));
};

export const getCurrentDecimalSeparator = () => {
  const n = 1.1;
  const sep = n.toLocaleString().substring(1, 2);
  return sep;
};

export const filterFairways = (data: FairwayCardPartsFragment[] | undefined, lang: 'fi' | 'sv' | 'en', searchQuery: string) => {
  if (searchQuery.length < MINIMUM_QUERYLENGTH) return [];
  const filtered = data?.filter((card) => (card.name[lang] ?? '').toString().toLowerCase().indexOf(searchQuery.trim()) > -1).slice(0, MAX_HITS) ?? [];
  return filtered.sort((a, b) => {
    const nameA = a.name[lang] ?? '';
    const nameB = b.name[lang] ?? '';
    return nameA.localeCompare(nameB);
  });
};

export const getMapCanvasWidth = (): number => {
  const canvasSize = dvkMap.olMap?.getSize() ?? [0, 0];
  return canvasSize[0];
};

export const getMapCanvasHeight = (): number => {
  const canvasSize = dvkMap.olMap?.getSize() ?? [0, 0];
  return canvasSize[1];
};

function getOpacityValue(opacity: string) {
  return opacity === '' ? 1 : Number(opacity);
}

function mergeCanvasesToImage() {
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = getMapCanvasWidth();
  mapCanvas.height = getMapCanvasHeight();
  const mapContext = mapCanvas.getContext('2d');

  if (mapContext) {
    Array.prototype.forEach.call(dvkMap.olMap?.getViewport().querySelectorAll('.ol-layer canvas'), function (canvas) {
      if (canvas.width > 0) {
        mapContext.globalAlpha = getOpacityValue(canvas.parentNode.style.opacity || canvas.style.opacity);
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
        if (backgroundColor) {
          mapContext.fillStyle = backgroundColor;
          mapContext.fillRect(0, 0, canvas.width, canvas.height);
        }
        mapContext.drawImage(canvas, 0, 0);
      }
    });
    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
  }
  const img = new Image();
  img.src = mapCanvas.toDataURL('image/png');
  return img;
}

export const refreshPrintableMap = () => {
  const mapScale = dvkMap.olMap?.getViewport().querySelector('.ol-scale-line-inner');
  const rotation = dvkMap.olMap?.getView().getRotation();

  const mapExportScale = document.getElementById('mapScale');
  if (mapScale && mapExportScale) {
    mapExportScale.innerHTML = mapScale.innerHTML;
    mapExportScale.setAttribute('style', mapScale.getAttribute('style') ?? '');
  }

  const compassInfo = document.getElementById('compassInfo');
  const compassNeedle = document.getElementById('compassNeedle') as HTMLImageElement;
  if (compassInfo && compassNeedle) {
    compassNeedle.style.transform = 'rotate(' + rotation?.toPrecision(2) + 'rad)';
    const bbox = compassNeedle.getBoundingClientRect();
    const sidePadding = 8;
    compassNeedle.style.marginLeft = bbox.width / 2 - sidePadding + 'px';
    compassInfo.style.minWidth = (bbox.width + sidePadding).toString() + 'px';
    compassInfo.style.minHeight = (bbox.height + sidePadding).toString() + 'px';
  }

  const img = mergeCanvasesToImage();
  const mapExport = document.getElementById('mapExport');
  if (mapExport) {
    mapExport.innerHTML = '';
    mapExport.appendChild(img);
  }
};

export function getDuration(dataUpdatedAt: number, decimals = 1) {
  const power = Math.pow(10, decimals);
  const now = Date.now(); // for testing warning vs danger + 1000 * 60 * 60 * 11;
  const duration = Math.floor(Math.abs(now - dataUpdatedAt) / 1000 / 60 / 60);
  return Math.round(duration * power) / power;
}

export function getAlertProperties(dataUpdatedAt: number, layer: FeatureDataLayerId) {
  const duration = getDuration(dataUpdatedAt);
  let warningDurationHours = 2;
  if (layer === 'buoy' || layer === 'mareograph' || layer === 'observation') {
    warningDurationHours = 1;
  }
  if (duration < warningDurationHours) {
    return undefined;
  } else if (duration < 12) {
    return { duration, color: 'warning' };
  } else {
    return { duration, color: 'danger' };
  }
}

export const isGeneralMarineWarning = (area: Text | undefined): boolean => {
  return ['KAIKKI MERIALUEET', 'SUOMEN_MERIALUEET', 'SUOMEN MERIALUEET JA SISÄVESISTÖT'].includes(area?.fi ?? '');
};

export const hasOfflineSupport = (id: FeatureDataLayerId): boolean => {
  const layer = MAP.FEATURE_DATA_LAYERS.find((l) => l.id === id);
  return layer ? layer.offlineSupport : false;
};

export const getMarineWarningDataLayerId = (type: Text | undefined): FeatureDataLayerId => {
  switch (type?.fi) {
    case 'COASTAL WARNING':
      return 'coastalwarning';
    case 'LOCAL WARNING':
      return 'localwarning';
    case 'VAROITUKSIA VENEILIJÖILLE':
      return 'boaterwarning';
    default:
      return 'coastalwarning';
  }
};

export const filterMarineWarnings = (layerId: FeatureDataLayerId) => {
  return (features: Feature<Geometry>[]): Feature<Geometry>[] => {
    return features.filter((feature) => {
      const featureProperties = feature.getProperties() as MarineWarningFeatureProperties;
      const type = featureProperties.type?.fi;
      switch (layerId) {
        case 'coastalwarning':
          return type === 'COASTAL WARNING';
        case 'localwarning':
          return type === 'LOCAL WARNING';
        case 'boaterwarning':
          return type === 'VAROITUKSIA VENEILIJÖILLE';
        default:
          return false;
      }
    });
  };
};

export function getWarningImgSource(type: string) {
  switch (type) {
    case 'COASTAL WARNING':
      return coastal;
    case 'LOCAL WARNING':
      return local;
    default:
      return boaters;
  }
}

export function updateIceLayerOpacity() {
  const res = dvkMap.olMap?.getView()?.getResolution();
  if (res !== undefined) {
    let opacity;
    if (res < 10) {
      opacity = 0.15;
    } else if (res < 35) {
      opacity = 0.2;
    } else if (res < 90) {
      opacity = 0.3;
    } else {
      opacity = 0.4;
    }
    dvkMap.getFeatureLayer('ice').setOpacity(opacity);
  }
}

export function gotoFeature(id: number | string | undefined, layerId: FeatureLayerId) {
  const dvkMap = getMap();
  const feature = dvkMap.getVectorSource(layerId).getFeatureById(id ?? '') as Feature<Geometry>;
  if (feature) {
    const geometry = feature.getGeometry();
    if (geometry) {
      const extent = olExtent.createEmpty();
      olExtent.extend(extent, geometry.getExtent());
      dvkMap.olMap?.getView().fit(extent, { minResolution: 10, padding: [50, 50, 50, 50], duration: 1000 });
    }
  }
}
