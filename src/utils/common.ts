import { isPlatform } from '@ionic/react';
import dvkMap, { getMap } from '../components/DvkMap';
import { Area, Fairway, FairwayCardPartsFragment, Text } from '../graphql/generated';
import {
  FeatureDataId,
  FeatureDataLayerId,
  FeatureDataSources,
  FeatureLayerId,
  Lang,
  LAYER_IDB_KEY,
  MAP,
  MAX_HITS,
  MINIMUM_QUERYLENGTH,
} from './constants';
import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import { MarineWarningFeatureProperties } from '../components/features';
import coastal from '../theme/img/coastal_warning_icon.svg';
import local from '../theme/img/local_warning_icon.svg';
import boaters from '../theme/img/warning_to_boaters_icon.svg';
import * as olExtent from 'ol/extent';
import { set as setIdbVal, get as getIdbVal } from 'idb-keyval';
import { Action } from '../hooks/dvkReducer';
import { Dispatch } from 'react';
import { TFunction } from 'i18next';
import { Coordinate } from 'ol/coordinate';

export const isMobile = () => {
  return isPlatform('iphone') || (isPlatform('android') && !isPlatform('tablet'));
};

export const getCurrentDecimalSeparator = () => {
  const n = 1.1;
  const sep = n.toLocaleString().substring(1, 2);
  return sep;
};

export const isDigitsOnly = (s: string) => {
  return /^\d+$/.test(s);
};

export const filterFairways = (data: FairwayCardPartsFragment[] | undefined, lang: 'fi' | 'sv' | 'en', searchQuery: string) => {
  if (searchQuery.length < MINIMUM_QUERYLENGTH && !isDigitsOnly(searchQuery)) return [];
  const filtered =
    data
      ?.filter((card) => {
        const nameMatches = (card.name[lang] ?? '').toString().toLowerCase().indexOf(searchQuery.trim()) > -1;
        const fairwayMatches = card.fairways?.find((ff) => ff.id.toString().includes(searchQuery));

        return nameMatches || fairwayMatches;
      })
      .slice(0, MAX_HITS) ?? [];
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
  if (layer === 'mareograph' || layer === 'observation') {
    warningDurationHours = 1;
  } else if (layer === 'buoy') {
    warningDurationHours = 3;
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

export function goToFeature(id: number | string | undefined, layerId: FeatureLayerId, layers?: string[]) {
  const dvkMap = getMap();
  const feature = dvkMap.getVectorSource(layerId).getFeatureById(id ?? '') as Feature<Geometry>;
  const selectedFairwayCardSource = getMap().getVectorSource('selectedfairwaycard');

  if (feature) {
    // If layer is not visible, use selectedfairwaycard to show feature on map
    if (layers && !layers.includes(layerId)) {
      // Clear possible previous feature(s) from temporary layer
      selectedFairwayCardSource.clear();
      selectedFairwayCardSource.addFeature(feature);
    }

    const geometry = feature.getGeometry();
    if (geometry) {
      const extent = olExtent.createEmpty();
      olExtent.extend(extent, geometry.getExtent());
      dvkMap.olMap?.getView().fit(extent, { minResolution: 10, padding: [50, 50, 50, 50], duration: 1000 });
    }
  }
}

export function getTimeDifference(dataUpdatedAt: number) {
  const current = Date.now();
  return current - dataUpdatedAt;
}

export const formatDate = (dateTimeString: Date | string, formatTime: boolean = false): string => {
  const dateTime = new Date(dateTimeString);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: formatTime ? '2-digit' : undefined,
    minute: formatTime ? '2-digit' : undefined,
  };

  const formattedDatetime = new Intl.DateTimeFormat('fi', options).format(dateTime);

  return formattedDatetime.replace(' ', ', ');
};

export function getFeatureDataSourceProjection(featureDataId: FeatureDataId) {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  return fds?.projection;
}

export function updateLayerSelection(initialLayers: string[], requiredLayers: FeatureDataLayerId[], dispatch: (value: Action) => void) {
  const updateLayers = (layers: string[]) => {
    const hiddenLayers = requiredLayers.filter((l) => !layers.includes(l));
    if (hiddenLayers.length > 0) {
      const updatedLayers = [...layers, ...hiddenLayers];
      dispatch({ type: 'setLayers', payload: { value: updatedLayers } });
      return updatedLayers;
    }
    return null;
  };

  getIdbVal(LAYER_IDB_KEY).then((savedLayers) => {
    if (savedLayers?.length) {
      const layers = savedLayers as string[];
      const updated = updateLayers(layers);
      if (updated) {
        setIdbVal(LAYER_IDB_KEY, updated);
      }
      dispatch({ type: 'setSaveLayerSelection', payload: { value: true } });
    } else {
      updateLayers(initialLayers);
    }
  });
}

export function setResponseState(dispatch: Dispatch<Action>, statusCode: number, statusText: string, errorText: string) {
  dispatch({
    type: 'setResponse',
    payload: {
      value: [String(statusCode), statusText, errorText],
    },
  });
}

export enum FairwayForm {
  OpenWater = 1,
  Channel = 2,
  SlopedChannel = 3,
}

export function getFairwayFormText(id: number, t: TFunction) {
  switch (id) {
    case FairwayForm.OpenWater:
      return t('squat-calculation-open-water');
    case FairwayForm.Channel:
      return t('squat-calculation-channel');
    case FairwayForm.SlopedChannel:
      return t('squat-calculation-sloped-channel');
    default:
      return '';
  }
}

export function getFairwayName(fairway: Fairway, lang: Lang) {
  if (fairway.name) {
    return (fairway.name[lang] ?? '').length === 0 ? fairway.name.fi : fairway.name[lang];
  }
  return '';
}

export function getAreaName(area: Area, t: TFunction) {
  const name = area.name;
  const type = t('areaType' + area.typeCode);
  // ankkurointialueet pitkässä muodossa esim. osa 'c' -> 'ankkurointialue c'
  if (area.typeCode == 2) {
    return name ? type + ' ' + name : type;
  }
  return name ?? type;
}

export function setCoordinatesIconAndPopUp(dispatch: Dispatch<Action>, coordinates: Coordinate) {
  const source = dvkMap.getVectorSource('coordinateslocation');
  source.clear();
  source.addFeature(
    new Feature({
      geometry: new Point([coordinates[0], coordinates[1]]),
    })
  );
  const coordinateString = dvkMap.getMapDetailsControl().getMousePositionElement().firstChild?.firstChild?.textContent;
  dispatch({
    type: 'setCoordinates',
    payload: {
      value: coordinateString ?? '',
    },
  });
}

export function clearCoordinatesLayerAndPopUp(dispatch: Dispatch<Action>) {
  const coordinatesSource = dvkMap.getVectorSource('coordinateslocation');
  coordinatesSource.clear();
  dispatch({
    type: 'setCoordinates',
    payload: {
      value: '',
    },
  });
}
