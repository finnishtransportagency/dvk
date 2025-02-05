import { IonText } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { FairwayCardPartsFragment } from '../../../../graphql/generated';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { usePilotRouteFeatures } from '../../../PilotRouteFeatureLoader';
import { getFairwayCardPilotRoutes } from '../../../../utils/fairwayCardUtils';
import PilotRouteList from '../../PilotRouteList';
import { InfoParagraph } from '../../Paragraph';

interface FairwayCardPilotRoutesTabProps {
  fairwayCard: FairwayCardPartsFragment;
  fairwayCardId: string;
}
export const FairwayCardPilotRoutesTab: React.FC<FairwayCardPilotRoutesTabProps> = ({ fairwayCard, fairwayCardId }) => {
  const [pilotRoutes, setPilotRoutes] = useState<Feature<Geometry>[]>([]);
  const { pilotRouteFeatures, ready: pilotRoutesReady } = usePilotRouteFeatures();
  useEffect(() => {
    if (fairwayCard && pilotRoutesReady) {
      setPilotRoutes(getFairwayCardPilotRoutes(fairwayCard, pilotRouteFeatures));
    }
  }, [fairwayCard, pilotRouteFeatures, pilotRoutesReady]);

  return (
    <>
      {pilotRoutesReady && (
        <>
          {pilotRoutes.length > 0 ? (
            <PilotRouteList pilotRoutes={pilotRoutes} featureLink={'/kortit/' + fairwayCardId} layerId="selectedfairwaycard" />
          ) : (
            <IonText className="no-print">
              <InfoParagraph />
            </IonText>
          )}
        </>
      )}
    </>
  );
};
