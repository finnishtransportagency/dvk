import React from 'react';
import { IonButton, IonCol, IonGrid, IonRow, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import PrintIcon from '../../../theme/img/print.svg?react';
import { useDvkContext } from '../../../hooks/dvkContext';

interface FairwayCardHeaderProps {
  fairwayTitle: string;
  infoText1: string;
  infoText2: string;
  isPending: boolean;
  isFetching: boolean;
  printDisabled: boolean;
}
export const FairwayCardHeader: React.FC<FairwayCardHeaderProps> = ({ fairwayTitle, infoText1, infoText2, isPending, isFetching, printDisabled }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { state } = useDvkContext();

  return (
    <IonGrid className="ion-no-padding ion-margin-top">
      <IonRow>
        <IonCol>
          <IonText className="fairwayTitle" id="mainPageContent">
            <h2 className="ion-no-margin">
              <strong>{fairwayTitle}</strong>
            </h2>
          </IonText>
        </IonCol>
        <IonCol size="auto" className="ion-align-self-end">
          <IonButton
            fill="clear"
            className="icon-only small no-mobile no-print"
            onClick={() => window.print()}
            title={t('print')}
            aria-label={t('print')}
            data-testid="printButton"
            disabled={printDisabled}
          >
            <PrintIcon />
          </IonButton>
          <IonText className="fairwayTitle printable">
            <h3 className="no-margin-bottom">{t('title', { count: 1 })}</h3>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonText className={'fairwayTitle' + (state.preview ? ' previewText' : '')}>
            <em>{infoText1}</em>
            <br />
          </IonText>
          <IonText>
            <em className="no-print">
              {infoText2}
              {!state.preview && (isPending || isFetching) && (
                <IonSkeletonText
                  animated={true}
                  style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
                />
              )}
            </em>
          </IonText>
        </IonCol>
        <IonCol size="auto" className="ion-align-self-start">
          <IonText className="fairwayTitle">
            <em>{t('notForNavigation')}</em>
          </IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
