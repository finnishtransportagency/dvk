import { IonText } from '@ionic/react';
import React from 'react';
import { InfoParagraph } from '../../Paragraph';
import { FairwayCardPartsFragment, HarborPartsFragment } from '../../../../graphql/generated';
import { HarbourInfo } from './HarbourInfo';

interface HarbourTabProps {
  fairwayCard: FairwayCardPartsFragment;
}
export const HarbourTab: React.FC<HarbourTabProps> = ({ fairwayCard }) => {
  return (
    <>
      {fairwayCard?.harbors?.map((harbour: HarborPartsFragment | null | undefined, idx: React.Key) => {
        return <HarbourInfo data={harbour} key={harbour?.id} isLast={fairwayCard.harbors?.length === Number(idx) + 1} />;
      })}
      {(!fairwayCard?.harbors || fairwayCard?.harbors?.length === 0) && (
        <IonText className="no-print">
          <InfoParagraph />
        </IonText>
      )}
    </>
  );
};
