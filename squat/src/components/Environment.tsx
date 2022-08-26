import React, { useEffect } from 'react';
import './Squat.css';
import { useTranslation } from 'react-i18next';
import { IonText, IonGrid, IonRow, IonCol, IonLabel, IonImg } from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import { fairwayForms } from '../hooks/squatReducer';
import { calculateWaveAmplitudeProperties, calculateWaveLengthProperties } from '../utils/calculations';
import { isReliabilityAnIssue } from '../utils/validations';
import Alert from './Alert';
import InputField from './InputField';
import SectionTitle from './SectionTitle';
import LabelField from './LabelField';
import RadioSelectField from './RadioSelectField';

const zero = 0;
const kgPerCubicM = (
  <>
    kg/m<sup>3</sup>
  </>
);

const Environment: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useSquatContext();

  useEffect(() => {
    dispatch({
      type: 'environment-weather',
      payload: {
        key: 'waveLength',
        value: calculateWaveLengthProperties(state.environment.weather.wavePeriod, state.environment.fairway.sweptDepth),
        elType: 'object',
      },
    });
  }, [state.environment.weather.wavePeriod, state.environment.fairway.sweptDepth, dispatch]);

  useEffect(() => {
    dispatch({
      type: 'environment-weather',
      payload: {
        key: 'waveAmplitude',
        value: calculateWaveAmplitudeProperties(
          state.vessel.general.lengthBPP,
          state.environment.weather.waveHeight,
          state.environment.weather.waveLength
        ),
        elType: 'object',
      },
    });
  }, [
    state.vessel.general.lengthBPP,
    state.environment.weather.wavePeriod,
    state.environment.weather.waveHeight,
    state.environment.weather.waveLength,
    dispatch,
  ]);

  // Validations
  const checkIsReliabilityAnIssue = () => {
    return isReliabilityAnIssue(
      state.vessel.general.blockCoefficient,
      state.environment.vessel.vesselSpeed,
      state.environment.fairway.sweptDepth,
      state.environment.fairway.waterLevel
    );
  };

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

  // Determine values to show
  const getWaveLength = () => {
    const currentValue = state.environment.weather.waveLength[state.status.showDeepWaterValues ? 1 : 0];
    return isNaN(currentValue) ? 0 : currentValue;
  };
  const getWaveAmplitude = () => {
    const currentValue = state.environment.weather.waveAmplitude[state.status.showDeepWaterValues ? 1 : 0];
    return isNaN(currentValue) ? 0 : currentValue;
  };

  return (
    <>
      <IonText color="dark" className="equal-margin-top">
        <h2>
          <strong>{t('homePage.squat.environment.title')}</strong>
        </h2>
      </IonText>

      <>
        {checkIsReliabilityAnIssue() && <Alert title={checkIsReliabilityAnIssue()} />}

        <SectionTitle
          title={t('homePage.squat.environment.weather')}
          valid={isFieldValid('windSpeed') && isFieldValid('windDirection') && isFieldValid('waveHeight') && isFieldValid('wavePeriod')}
        />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-wind-speed')}
                name="windSpeed"
                value={state.environment.weather.windSpeed ? state.environment.weather.windSpeed : null}
                placeholder="0"
                min="0"
                max="35"
                unit="m/s"
                fieldClass={setFieldClass('windSpeed')}
                actionType="environment-weather"
                helper="0 – 25 m/s"
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-true-wind-or-wave-direction')}
                name="windDirection"
                value={state.environment.weather.windDirection ? state.environment.weather.windDirection : null}
                placeholder={zero.toString().padStart(3, '0')}
                min="0"
                max="350"
                unit="deg"
                fieldClass={setFieldClass('windDirection')}
                actionType="environment-weather"
                helper="0 – 350 deg"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-wave-height')}
                name="waveHeight"
                value={state.environment.weather.waveHeight ? state.environment.weather.waveHeight : null}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                min="0"
                max="15"
                step="0.1"
                unit="m"
                fieldClass={setFieldClass('waveHeight')}
                actionType="environment-weather"
                helper={
                  <>
                    {Number('0').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('15').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
                  </>
                }
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-wave-period')}
                name="wavePeriod"
                value={state.environment.weather.wavePeriod ? state.environment.weather.wavePeriod : null}
                placeholder="0"
                min="0"
                max="20"
                unit="s"
                fieldClass={setFieldClass('wavePeriod')}
                actionType="environment-weather"
                helper="0 – 20 s"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <LabelField
                title={t('homePage.squat.environment.wave-length')}
                value={getWaveLength().toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                unit="m"
                helper=" "
              />
            </IonCol>
            <IonCol size-sm="6">
              <LabelField
                title={t('homePage.squat.environment.wave-amplitude')}
                value={getWaveAmplitude().toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                unit="m"
                helper=" "
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle
          title={t('homePage.squat.environment.fairway')}
          valid={
            isFieldValid('sweptDepth') &&
            isFieldValid('waterDepth') &&
            (state.environment.fairway.fairwayForm !== fairwayForms[0] ? isFieldValid('channelWidth') : true) &&
            (state.environment.fairway.fairwayForm === fairwayForms[2] ? isFieldValid('slopeScale') && isFieldValid('slopeHeight') : true)
          }
        />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.swept-depth')}
                name="sweptDepth"
                value={state.environment.fairway.sweptDepth ? state.environment.fairway.sweptDepth : null}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                min="0"
                max="20"
                step="0.1"
                unit="m"
                required
                fieldClass={setFieldClass('sweptDepth')}
                actionType="environment-fairway"
                helper={
                  <>
                    {Number('0').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('20').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
                  </>
                }
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.water-level')}
                name="waterLevel"
                value={state.environment.fairway.waterLevel}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                min="-1.5"
                max="1.5"
                step="0.1"
                unit="m"
                fieldClass={setFieldClass('waterLevel')}
                actionType="environment-fairway"
                helper={
                  <>
                    {Number('-1.5').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('1.5').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
                  </>
                }
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.estimated-water-depth')}
                name="waterDepth"
                value={state.environment.fairway.waterDepth ? state.environment.fairway.waterDepth : null}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                min="0"
                max="30"
                step="0.1"
                unit="m"
                required
                fieldClass={setFieldClass('waterDepth')}
                actionType="environment-fairway"
                helper={
                  <>
                    {Number('0').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('30').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
                  </>
                }
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <RadioSelectField
                title={t('homePage.squat.environment.form-of-fairway')}
                name="fairwayForm"
                value={state.environment.fairway.fairwayForm}
                options={fairwayForms}
                actionType="environment-fairway"
                required
                translateOptions
                infoContentTitle={t('homePage.squat.environment.form-of-fairway-info-title')}
                infoContent={
                  <>
                    <p>{t('homePage.squat.environment.form-of-fairway-info-content')}</p>
                    <IonGrid>
                      {fairwayForms.map((option) => (
                        <IonRow key={option.id}>
                          <IonCol size="4">
                            <IonLabel>
                              {option.id}. &nbsp; {t(option.name)}
                            </IonLabel>
                          </IonCol>
                          <IonCol size="8">
                            <IonLabel className="ion-text-wrap">{t(option.desc)}</IonLabel>
                          </IonCol>
                        </IonRow>
                      ))}
                    </IonGrid>
                    <IonGrid>
                      <IonRow>
                        {fairwayForms.map((option) => (
                          <IonCol key={option.id} className="align-center">
                            <IonImg src={option.img} />
                            <p>
                              {option.id}. {t(option.name)}
                            </p>
                          </IonCol>
                        ))}
                      </IonRow>
                    </IonGrid>
                  </>
                }
              />
            </IonCol>
          </IonRow>
          {state.environment.fairway.fairwayForm !== fairwayForms[0] && ( // form != Open Water
            <IonRow className="ion-justify-content-between ion-align-items-center">
              <IonCol>
                <InputField
                  title={t('homePage.squat.environment.channel-width')}
                  name="channelWidth"
                  value={state.environment.fairway.channelWidth}
                  placeholder="0"
                  min="0"
                  unit="m"
                  fieldClass={setFieldClass('channelWidth')}
                  actionType="environment-fairway"
                />
              </IonCol>
            </IonRow>
          )}
          {state.environment.fairway.fairwayForm === fairwayForms[2] && ( // form == Sloped Channel
            <IonRow>
              <IonCol size="6">
                <InputField
                  title={t('homePage.squat.environment.scale-of-slope')}
                  name="slopeScale"
                  value={state.environment.fairway.slopeScale}
                  placeholder="0"
                  min="0"
                  fieldClass={setFieldClass('slopeScale')}
                  actionType="environment-fairway"
                />
              </IonCol>
              <IonCol size="6">
                <InputField
                  title={t('homePage.squat.environment.height-of-slope')}
                  name="slopeHeight"
                  value={state.environment.fairway.slopeHeight}
                  placeholder="0"
                  min="0"
                  unit="m"
                  fieldClass={setFieldClass('slopeHeight')}
                  actionType="environment-fairway"
                />
              </IonCol>
            </IonRow>
          )}
        </IonGrid>

        <SectionTitle
          title={t('homePage.squat.environment.vessel')}
          valid={isFieldValid('vesselCourse') && isFieldValid('vesselSpeed') && isFieldValid('turningRadius')}
        />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-vessel-course')}
                name="vesselCourse"
                value={state.environment.vessel.vesselCourse}
                placeholder={zero.toString().padStart(3, '0')}
                min="0"
                max="350"
                unit="deg"
                fieldClass={setFieldClass('vesselCourse')}
                actionType="environment-vessel"
                helper="0 – 350 deg"
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-vessel-speed')}
                name="vesselSpeed"
                value={state.environment.vessel.vesselSpeed}
                placeholder="0"
                min="0"
                max="35"
                unit="kts"
                fieldClass={setFieldClass('vesselSpeed')}
                actionType="environment-vessel"
                helper="0 – 35 kts"
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-turning-radius')}
                name="turningRadius"
                value={state.environment.vessel.turningRadius}
                placeholder="0"
                min="0.1"
                max="2"
                step="0.05"
                unit="nm"
                fieldClass={setFieldClass('turningRadius')}
                actionType="environment-vessel"
                helper={
                  <>
                    {Number('0.1').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('2').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} nm
                  </>
                }
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <SectionTitle
          title={t('homePage.squat.environment.attribute')}
          valid={isFieldValid('airDensity') && isFieldValid('waterDensity') && isFieldValid('requiredUKC') && isFieldValid('motionClearance')}
        />
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-density-of-air')}
                name="airDensity"
                value={state.environment.attribute.airDensity}
                placeholder="1.3"
                min="1"
                max="1.5"
                step="0.1"
                unit={kgPerCubicM}
                fieldClass={setFieldClass('airDensity')}
                actionType="environment-attribute"
                helper={
                  <>
                    {Number('1').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('1.5').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {kgPerCubicM}
                  </>
                }
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.set-density-of-water')}
                name="waterDensity"
                value={state.environment.attribute.waterDensity}
                placeholder="1000"
                min="1000"
                max="1025"
                unit={kgPerCubicM}
                fieldClass={setFieldClass('waterDensity')}
                actionType="environment-attribute"
                helper={<>1000 – 1025 {kgPerCubicM}</>}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.required-UKC')}
                name="requiredUKC"
                value={state.environment.attribute.requiredUKC}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0.5"
                max="5"
                step="0.05"
                unit="m"
                fieldClass={setFieldClass('requiredUKC')}
                actionType="environment-attribute"
                helper={
                  <>
                    {Number('0.5').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('5').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
                  </>
                }
              />
            </IonCol>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.clearance-for-other-motions')}
                name="motionClearance"
                value={state.environment.attribute.motionClearance}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                max="3"
                step="0.05"
                unit="m"
                fieldClass={setFieldClass('motionClearance')}
                actionType="environment-attribute"
                helper={
                  <>
                    {Number('0').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} –{' '}
                    {Number('3').toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
                  </>
                }
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <InputField
                title={t('homePage.squat.environment.safety-margin-wind-force')}
                name="safetyMarginWindForce"
                value={state.environment.attribute.safetyMarginWindForce}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min="0"
                max="25"
                unit="%"
                fieldClass={setFieldClass('safetyMarginWindForce')}
                actionType="environment-attribute"
                helper="0 – 25 %"
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </>
    </>
  );
};

export default Environment;
