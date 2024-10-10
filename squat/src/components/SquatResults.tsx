import React from 'react';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { getNumberValueOrEmptyString } from '../utils/calculations';
import { isUKCShipMotionsUnderRequired, isUKCStraightUnderRequired, isUKCDuringTurnUnderRequired } from '../utils/validations';
import LabelField from './LabelField';
import SectionTitle from './SectionTitle';
import { useSquatContext } from '../hooks/squatContext';
import { useTranslation } from 'react-i18next';

interface SquatResultsProps {
  limitedView: boolean;
}

const SquatCalculationResults: React.FC<SquatResultsProps> = ({ limitedView }) => {
  const { state } = useSquatContext();
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.squat.calculations' });
  const tRoot = i18n.getFixedT(i18n.language);

  const getUKCVesselMotionValue = () => {
    const currentValue = state.calculations.squat.UKCVesselMotions[state.status.showBarrass ? 0 : 1][state.status.showDeepWaterValues ? 1 : 0];
    return getNumberValueOrEmptyString(currentValue);
  };
  const getUKCStraightCourseValue = () => {
    const currentValue = state.calculations.squat.UKCStraightCourse[state.status.showBarrass ? 0 : 1];
    return getNumberValueOrEmptyString(currentValue);
  };
  const getUKCDuringTurnValue = () => {
    const currentValue = state.calculations.squat.UKCDuringTurn[state.status.showBarrass ? 0 : 1];
    return getNumberValueOrEmptyString(currentValue);
  };
  const getSquatValue = () => {
    const currentValue = state.status.showBarrass ? state.calculations.squat.squatBarrass : state.calculations.squat.squatHG;
    return getNumberValueOrEmptyString(currentValue);
  };
  const printSquatHelper = () => {
    if (getSquatValue() !== '') return '(' + (state.status.showBarrass ? t('squat-barrass') : t('squat-HG')) + ')';
    return '';
  };
  return (
    <>
      <SectionTitle title={t('squat')} hideValidity className={limitedView ? 'print-hide' : ''} disabled={limitedView} />
      {!limitedView && (
        <IonGrid className="no-padding">
          <IonRow className="input-row">
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('heel-due-wind')}
                value={(isNaN(state.calculations.squat.heelDueWind) ? '' : state.calculations.squat.heelDueWind).toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="°"
                unitId="deg"
                dataTestid="heel-due-wind"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('constant-heel-during-turn')}
                value={
                  isNaN(state.calculations.squat.constantHeelDuringTurn)
                    ? ''
                    : state.calculations.squat.constantHeelDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="°"
                unitId="deg"
                infoContentTitle={t('constant-heel-during-turn-info-title')}
                infoContent={<p>{t('constant-heel-during-turn-info')}</p>}
                dataTestid="constant-heel-during-turn"
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('corrected-draught')}
                value={
                  isNaN(state.calculations.squat.correctedDraught)
                    ? ''
                    : state.calculations.squat.correctedDraught.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="m"
                dataTestid="corrected-draught"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('corrected-draught-during-turn')}
                value={
                  isNaN(state.calculations.squat.correctedDraughtDuringTurn)
                    ? ''
                    : state.calculations.squat.correctedDraughtDuringTurn.toLocaleString(i18n.language, { maximumFractionDigits: 2 })
                }
                unit="m"
                dataTestid="corrected-draught-during-turn"
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('UKC-vessel-motions')}
                value={getUKCVesselMotionValue().toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                unit="m"
                error={
                  isUKCShipMotionsUnderRequired(
                    state.environment.attribute.requiredUKC,
                    state.calculations.squat.UKCVesselMotions,
                    state.status.showBarrass,
                    state.status.showDeepWaterValues
                  )
                    ? t('UKC-under-required-minimum')
                    : ''
                }
                infoContentTitle={t('vessel-motions-assumptions')}
                infoContent={
                  <>
                    <p>{t('vessel-motions-assumptions')}:</p>
                    <ul>
                      <li>{t('vessel-motions-assumption-1')}</li>
                      <li>{t('vessel-motions-assumption-2')}</li>
                      <li>{t('vessel-motions-assumption-3')}</li>
                    </ul>
                  </>
                }
                dataTestid="UKC-vessel-motions"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('UKC-straight-course')}
                value={getUKCStraightCourseValue().toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="m"
                error={
                  isUKCStraightUnderRequired(
                    state.environment.attribute.requiredUKC,
                    state.calculations.squat.UKCStraightCourse,
                    state.status.showBarrass
                  )
                    ? t('UKC-under-required-minimum')
                    : ''
                }
                dataTestid="UKC-straight-course"
              />
            </IonCol>

            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('UKC-during-turn')}
                value={getUKCDuringTurnValue().toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="m"
                error={
                  isUKCDuringTurnUnderRequired(
                    state.environment.attribute.requiredUKC,
                    state.calculations.squat.UKCDuringTurn,
                    state.status.showBarrass
                  )
                    ? t('UKC-under-required-minimum')
                    : ''
                }
                dataTestid="UKC-during-turn"
              />
            </IonCol>
            <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="6">
              <LabelField
                title={t('squat') + ', ' + tRoot(state.environment.fairway.fairwayForm?.name).toLocaleLowerCase()}
                value={getSquatValue().toLocaleString(i18n.language, {
                  maximumFractionDigits: 2,
                })}
                unit="m"
                helper={printSquatHelper()}
                dataTestid="squat-result"
              />
            </IonCol>
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

export default SquatCalculationResults;
