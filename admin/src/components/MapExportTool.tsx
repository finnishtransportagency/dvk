import React, { useEffect, useRef, useState } from 'react';
import { IonCol, IonGrid, IonProgressBar, IonRow, useIonViewWillEnter } from '@ionic/react';
import { InitDvkMap, getMap } from './map/DvkMap';
import {
  DvkLayerState,
  useArea12Layer,
  useArea3456Layer,
  useBackgroundBalticseaLayer,
  useBackgroundFinlandLayer,
  //useBackgroundMmljarviLayer,
  //useBackgroundMmllaituritLayer,
  //useBackgroundMmlmeriLayer,
  useBoardLine12Layer,
  useBuoyLayer,
  useCircleLayer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useMareographLayer,
  useMarineWarningLayer,
  useNameLayer,
  useObservationLayer,
  usePilotLayer,
  useSafetyEquipmentLayer,
  useSpecialArea15Layer,
  useSpecialArea2Layer,
  useSpeedLimitLayer,
  useVtsLineLayer,
  useVtsPointLayer,
} from './map/FeatureLoader';
import { useFairwayCardList } from './map/FairwayDataLoader';
import MapOverlays from './map/mapOverlays/MapOverlays';
import { Fairway, FairwayCardInput, Harbor } from '../graphql/generated';
import { setSelectedFairwayCard } from './map/layers';
import { useIsFetching } from '@tanstack/react-query';
import './MapExportTool.css';

interface MapProps {
  fairwayCardInput: FairwayCardInput;
  fairways?: Fairway[];
  harbours?: Harbor[];
}

const MapExportTool: React.FC<MapProps> = ({ fairwayCardInput, fairways, harbours }) => {
  InitDvkMap();

  /* Start initializing layers that are required at ap start first */
  const fairwayCardList = useFairwayCardList();
  const line12Layer = useLine12Layer();
  const area12Layer = useArea12Layer();
  const specialArea2Layer = useSpecialArea2Layer();
  const specialArea15Layer = useSpecialArea15Layer();
  const pilotLayer = usePilotLayer();
  const harborLayer = useHarborLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const bgFinlandLayer = useBackgroundFinlandLayer();
  //const bgMmlmeriLayer = useBackgroundMmlmeriLayer();
  //const bgMmljarviLayer = useBackgroundMmljarviLayer();
  const circleLayer = useCircleLayer();
  /* Start initializing other layers */
  useDepth12Layer();
  useSpeedLimitLayer();
  useSafetyEquipmentLayer();
  useMarineWarningLayer();
  useNameLayer();
  useMareographLayer();
  useObservationLayer();
  useBuoyLayer();
  useVtsLineLayer();
  useVtsPointLayer();
  useLine3456Layer();
  useArea3456Layer();
  useBackgroundBalticseaLayer();
  //useBackgroundMmllaituritLayer();
  const [initDone, setInitDone] = useState(false);
  const [percentDone, setPercentDone] = useState(0);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const allLayers: DvkLayerState[] = [
      fairwayCardList,
      line12Layer,
      area12Layer,
      specialArea2Layer,
      specialArea15Layer,
      pilotLayer,
      harborLayer,
      boardLine12Layer,
      bgFinlandLayer,
      //bgMmlmeriLayer,
      //bgMmljarviLayer,
      circleLayer,
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
    fairwayCardList,
    line12Layer,
    area12Layer,
    pilotLayer,
    harborLayer,
    boardLine12Layer,
    bgFinlandLayer,
    //bgMmlmeriLayer,
    //bgMmljarviLayer,
    circleLayer,
    specialArea2Layer,
    specialArea15Layer,
  ]);

  const isFetching = useIsFetching();

  const dvkMap = getMap();
  dvkMap.setOfflineMode(false);

  const mapElement = useRef<HTMLDivElement | null>(null);
  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addSelectPortraitControl();
      dvkMap.addSelectLandscapeControl();
      dvkMap.addTakeScreenshotControl();
      dvkMap.addLayerPopupControl();
      dvkMap.addFitFeaturesOnMapControl();
      dvkMap.addZoomControl();
      dvkMap.addRotationControl();
      dvkMap.setTarget(mapElement.current);
    }
  });

  useEffect(() => {
    const fairwayCard = {
      id: fairwayCardInput.id,
      fairwayIds: fairwayCardInput.fairwayIds,
      fairways: fairways ?? [],
      group: fairwayCardInput.group,
      name: {
        fi: fairwayCardInput.name.fi,
        sv: fairwayCardInput.name.sv,
        en: fairwayCardInput.name.en,
      },
      n2000HeightSystem: fairwayCardInput.n2000HeightSystem,
      harbors: harbours ?? [],
    };
    setSelectedFairwayCard(fairwayCard);
  }, [fairwayCardInput, fairways, harbours]);

  return (
    <IonGrid className="mapExportTool">
      <IonRow>
        <IonCol>
          <MapOverlays />
          {(!!isFetching || !initDone) && (
            <IonProgressBar
              value={percentDone}
              buffer={percentDone}
              type={!!isFetching && initDone ? 'indeterminate' : 'determinate'}
              className={fetchError ? 'danger' : ''}
            />
          )}
          <div className="mainMapWrapper" ref={mapElement} data-testid="mapElement"></div>
        </IonCol>
        <IonCol>Tallennetut kuvat tänne</IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default MapExportTool;
