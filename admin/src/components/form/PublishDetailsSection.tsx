import React, { useState } from 'react';
import { FairwayCardInput, HarborInput, Status } from '../../graphql/generated';
import { IonButton, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import ChevronIcon from '../../theme/img/chevron.svg?react';

interface PublishDetailsSectionProps {
  state: FairwayCardInput | HarborInput;
}

const PublishDetailsSection: React.FC<PublishDetailsSectionProps> = ({ state }) => {
  const { t } = useTranslation();
  const [isPublishSectionOpen, setIsPublishSectionOpen] = useState<boolean>(true);

  const toggleSection = () => {
    setIsPublishSectionOpen((state) => !state);
  };

  const sectionClassName = 'sectionContent' + (isPublishSectionOpen ? ' open' : ' closed');

  return (
    <>
      {state.status === Status.Public && !!state.publishDetails && (
        <div className="formSection" key={'publishSectionContainer'}>
          <IonItem className="sectionHeader">
            <IonText>
              <h3>{t('fairwaycard.publish-details')}</h3>
            </IonText>
            <IonButton
              data-testid="toggleOpenPublishSection"
              slot="end"
              fill="clear"
              className={'icon-only small toggle' + (isPublishSectionOpen ? ' close' : ' open')}
              onClick={() => toggleSection()}
              title={(isPublishSectionOpen ? t('general.close') : t('general.open')) ?? ''}
              aria-label={(isPublishSectionOpen ? t('general.close') : t('general.open')) ?? ''}
            >
              <ChevronIcon />
            </IonButton>
          </IonItem>
          <div className={sectionClassName}>
            <IonText className="sectionContent">
              <p>{state.publishDetails}</p>
            </IonText>
          </div>
          <br />
        </div>
      )}
    </>
  );
};
export default PublishDetailsSection;
