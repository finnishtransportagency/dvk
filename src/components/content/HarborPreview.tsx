import { IonText, IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHarborPreviewData } from '../../utils/dataLoader';
import Breadcrumb from './Breadcrumb';
import { useDvkContext } from '../../hooks/dvkContext';
import PrintIcon from '../../theme/img/print.svg?react';

type HarborPreviewProps = {
  widePane?: boolean;
};

const HarborPreview: React.FC<HarborPreviewProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { state } = useDvkContext();
  const { data } = useHarborPreviewData(state.harborId);
  const path = [{ title: t('title', { count: 0 }) }, { title: '-' }, { title: t('harboursTitle') }];

  return (
    <>
      <Breadcrumb path={path} />

      <IonGrid className="ion-no-padding ion-margin-top">
        <IonRow>
          <IonCol>
            <IonText className="fairwayTitle" id="mainPageContent">
              <h2 className="ion-no-margin">
                <strong>{'-'}</strong>
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
              disabled={true}
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
            <IonText className="fairwayTitle">
              <em id="emphasizedPreviewText">{t('harborPreview')}</em>
              <br />
              <em>-</em>
            </IonText>
          </IonCol>
          <IonCol size="auto" className="ion-align-self-start">
            <IonText className="fairwayTitle">
              <em>{t('notForNavigation')}</em>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>

      <div className={'tabContent active show-print' + (widePane ? ' wide' : '')}>Hello harbor {data?.harborPreview?.id}</div>
    </>
  );
};

export default HarborPreview;
