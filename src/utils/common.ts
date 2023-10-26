import { isPlatform } from '@ionic/react';
import dvkMap from '../components/DvkMap';
import { FairwayCardPartsFragment, Text } from '../graphql/generated';
import { FeatureDataLayerId, MAP, MAX_HITS, MINIMUM_QUERYLENGTH } from './constants';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { MarineWarningFeatureProperties } from '../components/features';

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
  return ['KAIKKI MERIALUEET', 'SUOMEN_MERIALUEET', 'SUOMEN MERIALUEET JA SISÄVESISTÖT'].includes(area?.fi || '');
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

export const getAisVesselShipType = (typeNumber: number | undefined): string => {
  if (!typeNumber) {
    return 'aisUnspecified';
  }
  if (typeNumber == 36 || typeNumber == 37) {
    return 'aisVesselPleasureCraft';
  } else if ((typeNumber >= 31 && typeNumber <= 35) || (typeNumber >= 50 && typeNumber <= 59)) {
    return 'aisVesselTugAndSpecialCraft';
  } else if (typeNumber >= 40 && typeNumber <= 49) {
    return 'aisVesselHighSpeed';
  } else if (typeNumber >= 60 && typeNumber <= 69) {
    return 'aisVesselPassenger';
  } else if (typeNumber >= 70 && typeNumber <= 79) {
    return 'aisVesselCargo';
  } else if (typeNumber >= 80 && typeNumber <= 89) {
    return 'aisVesselTanker';
  } else {
    return 'aisUnspecified';
  }
};

export const reformatAisvesselDataUpdatedTime = (dateTimeString: Date): string => {
  const dateTime = new Date(dateTimeString);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formattedDatetime = new Intl.DateTimeFormat('fi', options).format(dateTime);

  return formattedDatetime.replace(' ', ', ');
};

export const checkIfMoored = (navState: number): boolean => {
  return !(navState === 0 || navState === 3 || navState === 4 || navState === 7 || navState === 8);
};

export const calculateVesselDimensions = (a: number | undefined, b: number | undefined, c: number | undefined, d: number | undefined): number[] => {
  if (a !== undefined && b !== undefined && c !== undefined && d !== undefined && b > 0 && d > 0) {
    const vesselLength = a + b;
    const vesselWidth = c + d;

    return [vesselLength, vesselWidth];
  }

  return [];
};
