import { isPlatform } from '@ionic/react';
import dvkMap from '../components/DvkMap';
import { FairwayCardPartsFragment, Text } from '../graphql/generated';
import { COASTAL_WARNING, FeatureDataLayerId, MAP, MAX_HITS, MINIMUM_QUERYLENGTH, imageUrl } from './constants';

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
  return (data && data.filter((card) => (card.name[lang] || '').toString().toLowerCase().indexOf(searchQuery.trim()) > -1).slice(0, MAX_HITS)) || [];
};

export const refreshPrintableMap = (pictures?: string[]) => {
  const mapScale = dvkMap.olMap?.getViewport().querySelector('.ol-scale-line-inner');
  const rotation = dvkMap.olMap?.getView().getRotation();

  const mapExportScale = document.getElementById('mapScale');
  if (mapScale && mapExportScale) {
    mapExportScale.innerHTML = mapScale.innerHTML;
    mapExportScale.setAttribute('style', mapScale.getAttribute('style') || '');
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

  // Merge canvases to one image
  const mapCanvas = document.createElement('canvas');
  const size = dvkMap.olMap?.getSize() || [0, 0];
  mapCanvas.width = size[0];
  mapCanvas.height = size[1];
  const mapContext = mapCanvas.getContext('2d');
  Array.prototype.forEach.call(dvkMap.olMap?.getViewport().querySelectorAll('.ol-layer canvas'), function (canvas) {
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
  const img = new Image();
  img.src = mapCanvas.toDataURL('image/png');
  const mapExport = document.getElementById('mapExport');
  if (mapExport) {
    mapExport.innerHTML = '';
    mapExport.appendChild(img);
  }
  pictures?.forEach((picture, index) => {
    const mapExport2 = document.getElementById('mapExport' + index);
    if (mapExport2) {
      mapExport2.innerHTML = '';
      const img2 = new Image();
      img2.src = imageUrl + picture;
      mapExport2.appendChild(img2);
    }
  });
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

export const isCoastalWarning = (type: Text | undefined): boolean => {
  const warningType = type?.fi || type?.sv || type?.en;
  return warningType === COASTAL_WARNING;
};

export const hasOfflineSupport = (id: FeatureDataLayerId): boolean => {
  const layer = MAP.FEATURE_DATA_LAYERS.find((l) => l.id === id);
  return layer ? layer.offlineSupport : false;
};

export function getAssetUrl(path: string): string {
  if (import.meta.env.NODE_ENV === 'test') {
    // workaround for "Failed to parse URL" error when running tests
    return 'data:image/svg+xml,';
  } else {
    return path;
  }
}
