import React from 'react';
import { IonGrid, IonRow, IonCol, IonItem, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import DepthMW from '../../theme/img/syvyys_mw.svg?react';
import DepthN2000 from '../../theme/img/syvyys_n2000.svg?react';

export const LegendDepth = () => {
  return (
    <IonGrid className="legend ion-no-padding">
      <IonRow>
        <IonCol size="2">
          <IonItem>
            <DepthN2000 />
          </IonItem>
        </IonCol>
        <IonCol size="3">
          <IonItem>
            <IonText>N2000</IonText>
          </IonItem>
        </IonCol>
        <IonCol size="2">
          <IonItem>
            <DepthMW />
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>MW</IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LegendArea = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend deptharea ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth1')}</IonText>
            <IonText slot="start" className="def area1"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth2')}</IonText>
            <IonText slot="start" className="def area2"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth3')}</IonText>
            <IonText slot="start" className="def area3"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LegendContour = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend depthcontour ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth4')}</IonText>
            <IonText slot="start" className="def line1"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth5')}</IonText>
            <IonText slot="start" className="def line2"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth6')}</IonText>
            <IonText slot="start" className="def line3"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LegendSpeedlimits = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend speedlimit ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              30-26 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit30"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              25-21 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit25"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              20-16 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit20"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              15-11 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit15"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              10-6 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit10"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              5-1 <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
            </IonText>
            <IonText slot="start" className="def limit5"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LegendIce = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend ice ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.icefree')}</IonText>
            <IonText slot="start" className="def icefree"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              {t('homePage.map.controls.layer.legend.newice')} (&lt; 5 <dd aria-label={t('fairwayCards.unit.cmDesc', { count: 5 })}>cm</dd>)
            </IonText>
            <IonText slot="start" className="def newice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              {t('homePage.map.controls.layer.legend.thinice')} (5-15 <dd aria-label={t('fairwayCards.unit.cmDesc', { count: 5 })}>cm</dd>)
            </IonText>
            <IonText slot="start" className="def thinice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.fastice')}</IonText>
            <IonText slot="start" className="def fastice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.rottenice')}</IonText>
            <IonText slot="start" className="def rottenice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.openwater')}</IonText>
            <IonText slot="start" className="def openwater"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.veryopenice')}</IonText>
            <IonText slot="start" className="def veryopenice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.openice')}</IonText>
            <IonText slot="start" className="def openice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.closeice')}</IonText>
            <IonText slot="start" className="def closeice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.verycloseice')}</IonText>
            <IonText slot="start" className="def verycloseice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.consolidatedice')}</IonText>
            <IonText slot="start" className="def consolidatedice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol></IonCol>
      </IonRow>
    </IonGrid>
  );
};
