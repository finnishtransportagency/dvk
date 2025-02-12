import React from 'react';
import { FairwayCardInput, HarborInput } from '../../graphql/generated';
import { IonText } from '@ionic/react';

interface PublishDetailsSectionProps {
  state: FairwayCardInput | HarborInput;
}

const PublishDetailsSection: React.FC<PublishDetailsSectionProps> = ({ state }) => {
  const sectionClassName = 'sectionContent' + (state.publishDetails ? ' open' : ' closed');
  return (
    <div className="formSection" key={'publishSectionContainer'}>
      <div className={sectionClassName}>
        <IonText className="sectionContent">
          <p>{state.publishDetails}</p>
        </IonText>
      </div>
      <br />
    </div>
  );
};
export default PublishDetailsSection;
