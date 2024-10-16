import { IonGrid, IonRow, IonCol } from '@ionic/react';
import React from 'react';
import LabelField from './LabelField';
import SectionTitle from './SectionTitle';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../main';
import { toDeg } from '../utils/calculations';

interface DriftResultProps {
  limitedView: boolean;
}

const DriftResults: React.FC<DriftResultProps> = ({ limitedView }) => {
  const { state } = useSquatContext();
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.squat.calculations' });

  return (
    <>
      <SectionTitle
        title={t('drift')}
        hideValidity
        className={limitedView ? 'print-hide' : ''}
        disabled={limitedView}
        infoContentTitle={t('drift-info-title')}
        infoContent={<p>{t('drift-info')}</p>}
      />
      {!limitedView && (
        <IonGrid className="no-padding">
          <IonRow className="input-row">
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('relative-wind-direction')}
                value={Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}
                unit="°"
                unitId="deg"
                dataTestid="drift-relative-wind-direction"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('relative-wind-speed')}
                value={Math.round(state.calculations.forces.relativeWindSpeed)}
                unit="m/s"
                dataTestid="drift-relative-wind-speed"
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('estimated-drift-angle')}
                value={(isFinite(state.calculations.forces.estimatedDriftAngle)
                  ? toDeg(state.calculations.forces.estimatedDriftAngle)
                  : ''
                ).toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="°"
                unitId="deg"
                dataTestid="estimated-drift-angle"
              />
            </IonCol>
            <IonCol size="6" sizeSm="12" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('estimated-vessel-breadth-due-drift')}
                value={state.calculations.forces.estimatedBreadth.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="m"
                dataTestid="estimated-vessel-breadth-due-drift"
              />
            </IonCol>
            <IonCol size="6" className="hide-portrait" />
            <IonCol size="6" className="hide-portrait" />
          </IonRow>
        </IonGrid>
      )}
    </>
  );
};

export default DriftResults;
