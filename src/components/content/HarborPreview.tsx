import { IonText, IonButton, IonCol, IonGrid, IonRow, IonSegment, IonSegmentButton, IonLabel, IonBreadcrumbs, IonSkeletonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHarborPreviewData } from '../../utils/dataLoader';
import Breadcrumb from './Breadcrumb';
import { useDvkContext } from '../../hooks/dvkContext';
import PrintIcon from '../../theme/img/print.svg?react';
import { HarbourInfo } from './fairwayCard/HarbourInfo';
import { InfoParagraph } from './Paragraph';

type HarborPreviewProps = {
  widePane?: boolean;
};

const HarborPreview: React.FC<HarborPreviewProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { state } = useDvkContext();
  const { data, isPending } = useHarborPreviewData(state.harborId);
  const path = [{ title: t('title', { count: 0 }) }, { title: '-' }, { title: t('harboursTitle') }];

  const getTabLabel = (tabId: number): string => {
    switch (tabId) {
      case 1:
        return t('title', { count: 1 });
      case 2:
        return t('harboursTitle');
      case 3:
        return t('areasTitle');
      default:
        return '-';
    }
  };

  return (
    <>
      {isPending ? (
        <>
          <IonBreadcrumbs>
            <IonSkeletonText animated={true} style={{ width: '100%', height: widePane ? '24px' : '48px', margin: '0' }}></IonSkeletonText>
          </IonBreadcrumbs>
          <IonText className="fairwayTitle">
            <h2 className="no-margin-bottom">
              <IonSkeletonText animated={true} style={{ width: '100%', height: '30px' }}></IonSkeletonText>
            </h2>
            <IonSkeletonText animated={true} style={{ width: '150px', height: '14px', margin: '0' }}></IonSkeletonText>
          </IonText>
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50px', marginTop: '20px' }}></IonSkeletonText>
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50vh', marginTop: '20px' }}></IonSkeletonText>
        </>
      ) : (
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

          <IonSegment className="tabs" value={2}>
            {[1, 2, 3].map((tabId) => (
              <IonSegmentButton key={tabId} value={tabId} disabled={tabId !== 2}>
                <IonLabel>
                  <h3>{getTabLabel(tabId)}</h3>
                </IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

          <div className={'tabContent tab2 active' + (widePane ? ' wide' : '')}>
            {data?.harborPreview ? (
              <HarbourInfo data={data.harborPreview} isLast />
            ) : (
              <IonText>
                <InfoParagraph />
              </IonText>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default HarborPreview;
