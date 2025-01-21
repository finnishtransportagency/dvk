import React from 'react';
import { FairwayCardInput, HarborInput } from '../../graphql/generated';
import { IonText } from '@ionic/react';

interface PublishDetailsSectionProps {
  state: FairwayCardInput | HarborInput;
}

const PublishDetailsSection: React.FC<PublishDetailsSectionProps> = ({ state }) => {
  return (
    <div className="formSection" key={'publishSectionContainer'}>
      <IonText className="sectionContent">
        <p>{state.publishDetails}</p>
      </IonText>
      <br />
    </div>
  );
};
export default PublishDetailsSection;
