import React, { useEffect } from 'react';
import './Squat.css';
import { useTranslation } from 'react-i18next';
import { IonText, IonGrid, IonRow, IonCol } from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import { vessels, vesselProfiles } from '../hooks/squatReducer';
import { calculateDisplacement, calculateKB } from '../utils/calculations';
import SectionTitle from './SectionTitle';
import InputField from './InputField';
import Alert from './Alert';
import SelectField from './SelectField';
import { isThrusterUnableToLiftBow, isTugUseRecommended } from '../utils/validations';

const zero = 0;
const mSquared = (
  <>
    m<sup>2</sup>
  </>
);

const Vessel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useSquatContext();

  useEffect(() => {
    dispatch({
      type: 'vessel-general',
      payload: {
        key: 'displacement',
        value: calculateDisplacement(
          state.vessel.general.lengthBPP,
          state.vessel.general.breadth,
          state.vessel.general.draught,
          state.vessel.general.blockCoefficient,
          state.environment.attribute.waterDensity
        ),
      },
    });
  }, [
    state.vessel.general.lengthBPP,
    state.vessel.general.breadth,
    state.vessel.general.draught,
    state.vessel.general.blockCoefficient,
    state.environment.attribute.waterDensity,
    dispatch,
  ]);

  useEffect(() => {
    dispatch({
      type: 'vessel-stability',
      payload: { key: 'KB', value: calculateKB(state.vessel.general.draught) },
    });
  }, [state.vessel.general.draught, dispatch]);

  // Field validation
  const isFieldValid = (name: string) => {
    for (const [k, v] of Object.entries(state.validations)) {
      if (k === name) return v as boolean;
    }
    return undefined;
  };
  const setFieldClass = (name: string) => {
    if (isFieldValid(name) === undefined) return '';
    return isFieldValid(name) ? 'ion-valid' : 'ion-invalid';
  };

  return (
    <>
      <IonText color="dark" className="equal-margin-top">
        <h2>
          <strong>{t('homePage.squat.vessel.title')}</strong>
        </h2>
      </IonText>

      <>
        {isTugUseRecommended(state.calculations.forces.bowThrusterForce, state.calculations.forces.externalForceRequired) && (
          <Alert title={t('homePage.squat.vessel.tug-use-recommended')} />
        )}
        {isThrusterUnableToLiftBow(
          state.vessel.general.lengthBPP,
          state.vessel.detailed.bowThruster,
          state.calculations.forces.bowThrusterForce,
          state.calculations.forces.windForce,
          state.calculations.forces.waveForce
        ) && <Alert title={t('homePage.squat.vessel.thruster-unable-to-lift-bow')} />}

        <SectionTitle title={t('homePage.squat.vessel.select-vessel')} hideValidity />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="12">
              <SelectField
                title={t('homePage.squat.vessel.select-ship-name')}
                name="vesselSelected"
                value={state.vessel.vesselSelected}
                options={vessels}
                actionType="vessel-select"
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle
          title={t('homePage.squat.vessel.general')}
          valid={
            isFieldValid('lengthBPP') &&
            isFieldValid('breadth') &&
            isFieldValid('draught') &&
            isFieldValid('blockCoefficient') &&
            isFieldValid('displacement')
          }
        />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.length-BPP')}
                name="lengthBPP"
                value={state.vessel.general.lengthBPP ? state.vessel.general.lengthBPP : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                step="0.01"
                unit="m"
                fieldClass={setFieldClass('lengthBPP')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.breadth')}
                name="breadth"
                value={state.vessel.general.breadth ? state.vessel.general.breadth : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                step="0.01"
                unit="m"
                fieldClass={setFieldClass('breadth')}
                actionType="vessel-general"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.draught')}
                name="draught"
                value={state.vessel.general.draught ? state.vessel.general.draught : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                step="0.01"
                unit="m"
                fieldClass={setFieldClass('draught')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.block-coefficient')}
                name="blockCoefficient"
                value={state.vessel.general.blockCoefficient ? state.vessel.general.blockCoefficient : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                max="1"
                step="0.01"
                fieldClass={setFieldClass('blockCoefficient')}
                actionType="vessel-general"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.displacement')}
                name="displacement"
                value={state.vessel.general.displacement}
                required
                placeholder="0"
                min="0"
                unit="mt"
                fieldClass={setFieldClass('displacement')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size="6"></IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle
          title={t('homePage.squat.vessel.detailed')}
          valid={isFieldValid('windSurface') && isFieldValid('deckCargo') && isFieldValid('bowThruster') && isFieldValid('bowThrusterEfficiency')}
        />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.total-lateral-wind-surface')}
                name="windSurface"
                value={state.vessel.detailed.windSurface ? state.vessel.detailed.windSurface : null}
                required
                placeholder="0"
                min="0"
                unit={mSquared}
                fieldClass={setFieldClass('windSurface')}
                actionType="vessel-detailed"
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.estimated-deck-cargo')}
                name="deckCargo"
                value={state.vessel.detailed.deckCargo ? state.vessel.detailed.deckCargo : null}
                placeholder="0"
                min="0"
                unit={mSquared}
                fieldClass={setFieldClass('deckCargo')}
                actionType="vessel-detailed"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.bow-thruster')}
                name="bowThruster"
                value={state.vessel.detailed.bowThruster ? state.vessel.detailed.bowThruster : null}
                required
                placeholder="0"
                min="0"
                unit="kW"
                fieldClass={setFieldClass('bowThruster')}
                actionType="vessel-detailed"
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.bow-thruster-efficiency')}
                name="bowThrusterEfficiency"
                value={state.vessel.detailed.bowThrusterEfficiency ? state.vessel.detailed.bowThrusterEfficiency : null}
                required
                placeholder="0"
                min="0"
                max="100"
                step="25"
                unit="%"
                helper="0 - 100 %"
                fieldClass={setFieldClass('bowThrusterEfficiency')}
                actionType="vessel-detailed"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <SelectField
                title={t('homePage.squat.vessel.select-vessel-profile')}
                name="profileSelected"
                value={state.vessel.detailed.profileSelected}
                options={vesselProfiles}
                actionType="vessel-detailed"
                required
                translateOptions
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle title={t('homePage.squat.vessel.stability')} valid={isFieldValid('KG') && isFieldValid('GM') && isFieldValid('KB')} />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.KG')}
                name="KG"
                value={state.vessel.stability.KG ? state.vessel.stability.KG : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                step="0.01"
                fieldClass={setFieldClass('KG')}
                actionType="vessel-stability"
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.GM')}
                name="GM"
                value={state.vessel.stability.GM ? state.vessel.stability.GM : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                step="0.01"
                fieldClass={setFieldClass('GM')}
                actionType="vessel-stability"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.vessel.KB')}
                name="KB"
                value={state.vessel.stability.KB ? Number(state.vessel.stability.KB.toFixed(2)) : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                step="0.01"
                fieldClass={setFieldClass('KB')}
                actionType="vessel-stability"
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </>
    </>
  );
};

export default Vessel;
