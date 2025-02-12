import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IonText, IonGrid, IonRow, IonCol } from '@ionic/react';
import { useSquatContext } from '../hooks/squatContext';
import { fieldParams, vesselProfiles } from '../hooks/squatReducer';
import { calculateDisplacement, calculateKB } from '../utils/calculations';
import SectionTitle from './SectionTitle';
import InputField from './InputField';
import Alert from './Alert';
import { isThrusterUnableToLiftBow, isTugUseRecommended } from '../utils/validations';
import RadioSelectField from './RadioSelectField';
import SquatHeader from './SquatHeader';
import { isEmbedded } from '../pages/Home';

const zero = 0;

const Vessel: React.FC = () => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.squat.vessel' });
  const { state, dispatch } = useSquatContext();
  const {
    status: { showLimitedView: limitedView },
  } = state;
  const defaultColumnSize = limitedView ? '12' : '6';

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
        <SquatHeader level={2} text={t('title')} embedded={isEmbedded()}></SquatHeader>
      </IonText>

      <>
        {!limitedView && isTugUseRecommended(state.calculations.forces.bowThrusterForce, state.calculations.forces.externalForceRequired) && (
          <Alert alertType="error" title={t('tug-use-recommended')} />
        )}
        {!limitedView &&
          isThrusterUnableToLiftBow(
            state.vessel.general.lengthBPP,
            state.vessel.detailed.bowThruster,
            state.calculations.forces.bowThrusterForce,
            state.calculations.forces.windForce,
            state.calculations.forces.waveForce
          ) && <Alert alertType="error" title={t('thruster-unable-to-lift-bow')} />}

        <SectionTitle
          title={t('general')}
          valid={
            isFieldValid('lengthBPP') &&
            isFieldValid('breadth') &&
            isFieldValid('draught') &&
            isFieldValid('blockCoefficient') &&
            isFieldValid('displacement')
          }
        />
        <IonGrid className="no-padding">
          <IonRow className="input-row">
            <IonCol size={defaultColumnSize}>
              <InputField
                title={t('length-BPP')}
                name="lengthBPP"
                value={state.vessel.general.lengthBPP ? state.vessel.general.lengthBPP : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min={fieldParams.lengthBPP.min}
                max={fieldParams.lengthBPP.max}
                step={fieldParams.lengthBPP.step}
                unit={fieldParams.lengthBPP.unit}
                fieldClass={setFieldClass('lengthBPP')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size={defaultColumnSize}>
              <InputField
                title={t('breadth')}
                name="breadth"
                value={state.vessel.general.breadth ? state.vessel.general.breadth : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min={fieldParams.breadth.min}
                max={fieldParams.breadth.max}
                step={fieldParams.breadth.step}
                unit={fieldParams.breadth.unit}
                fieldClass={setFieldClass('breadth')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size={defaultColumnSize}>
              <InputField
                title={t('draught')}
                name="draught"
                value={state.vessel.general.draught ? state.vessel.general.draught : null}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min={fieldParams.draught.min}
                max={fieldParams.draught.max}
                step={fieldParams.draught.step}
                unit={fieldParams.draught.unit}
                fieldClass={setFieldClass('draught')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size={defaultColumnSize}>
              <InputField
                title={t('block-coefficient')}
                name="blockCoefficient"
                value={state.vessel.general.blockCoefficient}
                required
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min={state.status.showBarrass ? fieldParams.blockCoefficient.min : 0.6}
                max={state.status.showBarrass ? fieldParams.blockCoefficient.max : 0.8}
                step={fieldParams.blockCoefficient.step}
                fieldClass={setFieldClass('blockCoefficient')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size={defaultColumnSize}>
              <InputField
                title={t('displacement')}
                name="displacement"
                value={state.vessel.general.displacement}
                required
                placeholder="0"
                min={fieldParams.displacement.min}
                max={fieldParams.displacement.max}
                unit={fieldParams.displacement.unit}
                fieldClass={setFieldClass('displacement')}
                actionType="vessel-general"
              />
            </IonCol>
            <IonCol size="6" />
            <IonCol size="6" className="hide-landscape" />
            <IonCol size="6" className="hide-landscape" />
          </IonRow>
        </IonGrid>

        {!limitedView && (
          <>
            <SectionTitle
              title={t('detailed')}
              valid={isFieldValid('windSurface') && isFieldValid('deckCargo') && isFieldValid('bowThruster') && isFieldValid('bowThrusterEfficiency')}
            />
            <IonGrid className="no-padding">
              <IonRow className="input-row">
                <IonCol size="6">
                  <InputField
                    title={t('total-lateral-wind-surface')}
                    name="windSurface"
                    value={state.vessel.detailed.windSurface ? state.vessel.detailed.windSurface : null}
                    placeholder="0"
                    min={fieldParams.windSurface.min}
                    max={fieldParams.windSurface.max}
                    unit={fieldParams.windSurface.unit}
                    fieldClass={setFieldClass('windSurface')}
                    actionType="vessel-detailed"
                  />
                </IonCol>
                <IonCol size="6">
                  <InputField
                    title={t('estimated-deck-cargo')}
                    name="deckCargo"
                    value={state.vessel.detailed.deckCargo ? state.vessel.detailed.deckCargo : null}
                    placeholder="0"
                    min={fieldParams.deckCargo.min}
                    max={fieldParams.deckCargo.max}
                    unit={fieldParams.deckCargo.unit}
                    fieldClass={setFieldClass('deckCargo')}
                    actionType="vessel-detailed"
                  />
                </IonCol>
                <IonCol size="6">
                  <InputField
                    title={t('bow-thruster')}
                    name="bowThruster"
                    value={state.vessel.detailed.bowThruster ? state.vessel.detailed.bowThruster : null}
                    placeholder="0"
                    min={fieldParams.bowThruster.min}
                    max={fieldParams.bowThruster.max}
                    unit={fieldParams.bowThruster.unit}
                    fieldClass={setFieldClass('bowThruster')}
                    actionType="vessel-detailed"
                  />
                </IonCol>
                <IonCol size="6">
                  <InputField
                    title={t('bow-thruster-efficiency')}
                    name="bowThrusterEfficiency"
                    value={state.vessel.detailed.bowThrusterEfficiency ? state.vessel.detailed.bowThrusterEfficiency : null}
                    placeholder="0"
                    min={fieldParams.bowThrusterEfficiency.min}
                    max={fieldParams.bowThrusterEfficiency.max}
                    unit={fieldParams.bowThrusterEfficiency.unit}
                    fieldClass={setFieldClass('bowThrusterEfficiency')}
                    actionType="vessel-detailed"
                  />
                </IonCol>
                <IonCol size="12">
                  <RadioSelectField
                    title={t('select-vessel-profile')}
                    name="profileSelected"
                    value={state.vessel.detailed.profileSelected}
                    options={vesselProfiles}
                    actionType="vessel-detailed"
                    required
                    translateOptions
                  />
                </IonCol>
                <IonCol size="6" />
                <IonCol size="6" className="hide-landscape" />
                <IonCol size="6" className="hide-landscape" />
              </IonRow>
            </IonGrid>
          </>
        )}
        <>
          <SectionTitle title={t('stability')} valid={isFieldValid('KG') && isFieldValid('GM') && isFieldValid('KB')} />
          <IonGrid className="no-padding">
            <IonRow className="input-row">
              <IonCol size={defaultColumnSize}>
                <InputField
                  title={t('KG')}
                  description={t('KG-description')}
                  name="KG"
                  value={state.vessel.stability.KG ? state.vessel.stability.KG : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  min={fieldParams.KG.min}
                  max={fieldParams.KG.max}
                  step={fieldParams.KG.step}
                  fieldClass={setFieldClass('KG')}
                  actionType="vessel-stability"
                />
              </IonCol>
              <IonCol size={defaultColumnSize}>
                <InputField
                  title={t('GM')}
                  description={t('GM-description')}
                  name="GM"
                  value={state.vessel.stability.GM ? state.vessel.stability.GM : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  min={fieldParams.GM.min}
                  max={fieldParams.GM.max}
                  step={fieldParams.GM.step}
                  fieldClass={setFieldClass('GM')}
                  actionType="vessel-stability"
                />
              </IonCol>
              <IonCol size={defaultColumnSize}>
                <InputField
                  title={t('KB')}
                  description={t('KB-description')}
                  name="KB"
                  value={state.vessel.stability.KB ? Number(state.vessel.stability.KB.toFixed(2)) : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  min={fieldParams.KB.min}
                  max={fieldParams.KB.max}
                  step={fieldParams.KB.step}
                  fieldClass={setFieldClass('KB')}
                  actionType="vessel-stability"
                />
              </IonCol>
              <IonCol size="6" />
              <IonCol size="6" className="hide-portrait" />
              <IonCol size="6" className="hide-portrait" />
            </IonRow>
          </IonGrid>
        </>
      </>
    </>
  );
};

export default Vessel;
