import { IonGrid, IonRow, IonCol } from '@ionic/react';
import React from 'react';
import LabelField from './LabelField';
import SectionTitle from './SectionTitle';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../main';
import { isExternalForceRequired, isSafetyMarginInsufficient } from '../utils/validations';

interface WindForceResultProps {
  limitedView: boolean;
}

const WindForceResults: React.FC<WindForceResultProps> = ({ limitedView }) => {
  const { state } = useSquatContext();
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.squat.calculations' });

  return (
    <>
      <SectionTitle title={t('wind-force')} hideValidity className={limitedView ? 'print-hide' : ''} disabled={limitedView} />
      {!limitedView && (
        <IonGrid className="no-padding">
          <IonRow className="input-row">
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('relative-wind-direction')}
                value={Math.round(state.calculations.forces.relativeWindDirection ? state.calculations.forces.relativeWindDirection : 0)}
                unit="°"
                unitId="deg"
                dataTestid="relative-wind-direction"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField title={t('relative-wind-speed')} value={Math.round(state.calculations.forces.relativeWindSpeed)} unit="m/s" />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('wind-force')}
                value={(isNaN(state.calculations.forces.windForce) ? '' : state.calculations.forces.windForce).toLocaleString(i18n.language, {
                  maximumFractionDigits: 1,
                })}
                unit="mt"
                infoContentTitle={t('wind-force-info-title')}
                infoContent={<p>{t('wind-force-info')}</p>}
                dataTestid="wind-force"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('wave-force')}
                value={(isNaN(state.calculations.forces.waveForce) ? '' : state.calculations.forces.waveForce).toLocaleString(i18n.language, {
                  maximumFractionDigits: 1,
                })}
                unit="mt"
                infoContentTitle={t('wave-force-info-title')}
                infoContent={<p>{t('wave-force-info')}</p>}
                dataTestid="wave-force"
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('bow-thruster-force')}
                value={state.calculations.forces.bowThrusterForce.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
                unit="mt"
                dataTestid="bow-thruster-force"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('remaining-safety-margin')}
                value={(isNaN(state.calculations.forces.remainingSafetyMargin)
                  ? ''
                  : state.calculations.forces.remainingSafetyMargin * 100
                ).toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
                unit="%"
                error={
                  isSafetyMarginInsufficient(state.environment.attribute.safetyMarginWindForce, state.calculations.forces.remainingSafetyMargin)
                    ? t('insufficient-safety-margin')
                    : ''
                }
                dataTestid="remaining-safety-margin"
              />
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="12">
              <LabelField
                title={t('minimum-external-force-required')}
                value={
                  state.calculations.forces.externalForceRequired > 0
                    ? state.calculations.forces.externalForceRequired.toLocaleString(i18n.language, { maximumFractionDigits: 1 })
                    : '-'
                }
                error={isExternalForceRequired(state.calculations.forces.externalForceRequired) ? t('external-force-required') : ''}
                dataTestid="minimum-external-force-required"
              />
            </IonCol>
            <IonCol size="6" />
            <IonCol size="6" className="hide-portrait" />
            <IonCol size="6" className="hide-portrait" />
            <IonCol size="6" className="hide-portrait" />
            <IonCol size="6" className="hide-portrait" />
          </IonRow>
        </IonGrid>
      )}
    </>
  );
};

export default WindForceResults;
