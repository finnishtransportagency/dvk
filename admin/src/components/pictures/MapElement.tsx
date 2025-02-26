import React, { useEffect, useRef } from 'react';
import { getMap, InitDvkMap } from '../map/DvkMap';
import {
  DvkLayerState,
  useArea12Layer,
  useArea3456Layer,
  useBackgroundBalticseaLayer,
  useBackgroundFinlandLayer,
  useBackgroundMmlSatamatLayer,
  useBoardLine12Layer,
  useCircleLayer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useNameLayer,
  usePilotageAreaBorderLayer,
  usePilotageLimitLayer,
  usePilotLayer,
  useQuayLayer,
  useSafetyEquipmentLayer,
  useSpecialArea15Layer,
  useSpecialArea2Layer,
  useSpecialArea9Layer,
  useSpeedLimitLayer,
  useVtsLineLayer,
  useVtsPointLayer,
} from '../map/FeatureLoader';
import { usePilotRouteLayer } from '../map/PilotRouteFeatureLoader';
import { useIonViewWillEnter } from '@ionic/react';

interface MapElementProps {
  setInitDone: (initDone: boolean) => void;
  setPercentDone: (percentDone: number) => void;
  setFetchError: (fetchError: boolean) => void;
}

const MapElement: React.FC<MapElementProps> = ({ setInitDone, setPercentDone, setFetchError }) => {
  InitDvkMap();

  /* Start initializing layers that are required at ap start first */
  const line12Layer = useLine12Layer();
  const area12Layer = useArea12Layer();
  const specialArea2Layer = useSpecialArea2Layer();
  const specialArea9Layer = useSpecialArea9Layer();
  const specialArea15Layer = useSpecialArea15Layer();
  const pilotLayer = usePilotLayer();
  const harborLayer = useHarborLayer();
  const quayLayer = useQuayLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const bgFinlandLayer = useBackgroundFinlandLayer();
  const bgMmlSatamatLayer = useBackgroundMmlSatamatLayer();
  const circleLayer = useCircleLayer();
  const pilotRouteLayer = usePilotRouteLayer();
  const pilotageLimitLayer = usePilotageLimitLayer();
  const pilotageAreaBorderLayer = usePilotageAreaBorderLayer();
  /* Start initializing other layers */
  useDepth12Layer();
  useSpeedLimitLayer();
  useSafetyEquipmentLayer();
  useNameLayer();
  useVtsLineLayer();
  useVtsPointLayer();
  useLine3456Layer();
  useArea3456Layer();
  useBackgroundBalticseaLayer();

  useEffect(() => {
    const allLayers: DvkLayerState[] = [
      line12Layer,
      area12Layer,
      specialArea2Layer,
      specialArea9Layer,
      specialArea15Layer,
      pilotLayer,
      harborLayer,
      quayLayer,
      boardLine12Layer,
      bgFinlandLayer,
      bgMmlSatamatLayer,
      circleLayer,
      pilotRouteLayer,
      pilotageLimitLayer,
      pilotageAreaBorderLayer,
    ];

    let percent = 0;
    const resourcePercentage = 1 / allLayers.length;

    allLayers.forEach(function (layer) {
      if (layer.ready) percent += resourcePercentage;
    });

    setPercentDone(Math.round(percent * 100) / 100);

    setFetchError(allLayers.some((layer) => layer.isError));

    setInitDone(allLayers.every((layer) => layer.ready));
  }, [
    line12Layer,
    area12Layer,
    pilotLayer,
    harborLayer,
    quayLayer,
    boardLine12Layer,
    bgFinlandLayer,
    bgMmlSatamatLayer,
    circleLayer,
    specialArea2Layer,
    specialArea9Layer,
    specialArea15Layer,
    pilotRouteLayer,
    pilotageLimitLayer,
    pilotageAreaBorderLayer,
    setPercentDone,
    setFetchError,
    setInitDone,
  ]);

  const dvkMap = getMap();

  const mapElement = useRef<HTMLDivElement | null>(null);
  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addRotationControl();
      dvkMap.setTarget(mapElement.current);
    }
  });

  return <div className="mainMapWrapper" ref={mapElement} data-testid="mapElement"></div>;
};

export default MapElement;
