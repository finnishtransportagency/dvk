import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IonText, IonGrid, IonRow, IonCol, IonLabel, IonImg } from '@ionic/react';
import { useSquatContext } from '../hooks/squatContext';
import { fairwayForms, fieldParams } from '../hooks/squatReducer';
import { calculateWaveAmplitudeProperties, calculateWaveLengthProperties } from '../utils/calculations';
import InputField from './InputField';
import SectionTitle from './SectionTitle';
import LabelField from './LabelField';
import RadioSelectField from './RadioSelectField';
import SquatHeader from './SquatHeader';
import { isEmbedded } from '../pages/Home';

const zero = 0;

const Environment: React.FC = () => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'homePage.squat.environment' });
  const tRoot = i18n.getFixedT(i18n.language);
  const { state, dispatch } = useSquatContext();
  const {
    status: { showLimitedView: limitedView },
  } = state;
  const defaultColumnSize = limitedView ? '12' : '6';

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

  // Field validation
  const isFieldValid = (name: string) => {
    for (const [k, v] of Object.entries(state.validations)) {
      if (k === name) return v as boolean;
    }
    return undefined;
  };
  const isAllValid = (fields: string[]) => {
    for (const field of fields) {
      if (!isFieldValid(field)) {
        return false;
      }
    }
    return true;
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

  function getValueOrNull<T>(value: T | undefined | null): T | null {
    return value !== undefined ? value : null;
  }

  function getFairwayFormOrderForId(id: number) {
    switch (id) {
      case 2:
        return '3';
      case 3:
        return '2';
      default:
        return id;
    }
  }

  return (
    <>
      <IonText color="dark" className="equal-margin-top">
        <SquatHeader level={2} text={t('title')} embedded={isEmbedded()}></SquatHeader>
      </IonText>

      {!limitedView && (
        <>
          <SectionTitle
            title={t('weather')}
            valid={isFieldValid('windSpeed') && isFieldValid('windDirection') && isFieldValid('waveHeight') && isFieldValid('wavePeriod')}
          />
          <IonGrid className="no-padding">
            <IonRow className="input-row">
              <IonCol size="6">
                <InputField
                  title={t('set-wind-speed')}
                  name="windSpeed"
                  value={getValueOrNull(state.environment.weather.windSpeed)}
                  placeholder="0"
                  min={fieldParams.windSpeed.min}
                  max={fieldParams.windSpeed.max}
                  unit={fieldParams.windSpeed.unit}
                  fieldClass={setFieldClass('windSpeed')}
                  actionType="environment-weather"
                />
              </IonCol>
              <IonCol size="6">
                <InputField
                  title={t('set-true-wind-or-wave-direction')}
                  name="windDirection"
                  value={getValueOrNull(state.environment.weather.windDirection)}
                  placeholder={zero.toString().padStart(3, '0')}
                  min={fieldParams.windDirection.min}
                  max={fieldParams.windDirection.max}
                  unit={fieldParams.windDirection.unit}
                  fieldClass={setFieldClass('windDirection')}
                  actionType="environment-weather"
                />
              </IonCol>
              <IonCol size="6">
                <InputField
                  title={t('set-wave-height')}
                  name="waveHeight"
                  value={getValueOrNull(state.environment.weather.waveHeight)}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  min={fieldParams.waveHeight.min}
                  max={fieldParams.waveHeight.max}
                  step={fieldParams.waveHeight.step}
                  unit={fieldParams.waveHeight.unit}
                  fieldClass={setFieldClass('waveHeight')}
                  actionType="environment-weather"
                />
              </IonCol>
              <IonCol size="6">
                <InputField
                  title={t('set-wave-period')}
                  name="wavePeriod"
                  value={getValueOrNull(state.environment.weather.wavePeriod)}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  min={fieldParams.wavePeriod.min}
                  max={fieldParams.wavePeriod.max}
                  step={fieldParams.wavePeriod.step}
                  unit={fieldParams.wavePeriod.unit}
                  fieldClass={setFieldClass('wavePeriod')}
                  actionType="environment-weather"
                />
              </IonCol>
              <IonCol size="6">
                <LabelField
                  title={t('wave-length')}
                  value={getWaveLength().toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  unit="m"
                />
              </IonCol>
              <IonCol size-sm="6">
                <LabelField
                  title={t('wave-amplitude')}
                  value={getWaveAmplitude().toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  unit="m"
                  infoContentTitle={t('wave-amplitude-info-title')}
                  infoContent={t('wave-amplitude-info')}
                />
              </IonCol>
              <IonCol size="6" className="hide-landscape" />
              <IonCol size="6" className="hide-landscape" />
            </IonRow>
          </IonGrid>
        </>
      )}

      <SectionTitle
        title={t('fairway')}
        valid={
          (limitedView ? isAllValid(['sweptDepth', 'waterLevel']) : isAllValid(['sweptDepth', 'waterLevel', 'waterDepth'])) &&
          (state.environment.fairway.fairwayForm !== fairwayForms[0] ? isFieldValid('channelWidth') : true) &&
          (state.environment.fairway.fairwayForm === fairwayForms[2] ? isAllValid(['slopeScale', 'slopeHeight']) : true)
        }
      />
      <IonGrid className="no-padding">
        <IonRow className="input-row">
          <IonCol size={defaultColumnSize}>
            <InputField
              title={t('swept-depth')}
              name="sweptDepth"
              value={getValueOrNull(state.environment.fairway.sweptDepth)}
              placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              min={state.vessel.general.draught ? Math.ceil(state.vessel.general.draught * 10) / 10 : fieldParams.sweptDepth.min}
              max={fieldParams.sweptDepth.max}
              step={fieldParams.sweptDepth.step}
              unit={fieldParams.sweptDepth.unit}
              required
              fieldClass={setFieldClass('sweptDepth')}
              actionType="environment-fairway"
              infoContentTitle={t('swept-depth-info-title')}
              infoContent={t('swept-depth-info')}
            />
          </IonCol>
          <IonCol size={defaultColumnSize}>
            <InputField
              title={t('water-level')}
              name="waterLevel"
              value={getValueOrNull(state.environment.fairway.waterLevel)}
              placeholder="0"
              min={fieldParams.waterLevel.min}
              max={fieldParams.waterLevel.max}
              unit={fieldParams.waterLevel.unit}
              fieldClass={setFieldClass('waterLevel')}
              actionType="environment-fairway"
              infoContentTitle={t('swept-depth-info-title')}
              infoContent={t('swept-depth-info')}
              inputType="text"
              inputMode="text"
            />
          </IonCol>
          {!limitedView && (
            <IonCol size="6">
              <InputField
                title={t('estimated-water-depth')}
                name="waterDepth"
                value={getValueOrNull(state.environment.fairway.waterDepth)}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                min={state.environment.fairway.sweptDepth ? state.environment.fairway.sweptDepth : fieldParams.waterDepth.min}
                max={fieldParams.waterDepth.max}
                step={fieldParams.waterDepth.step}
                unit={fieldParams.waterDepth.unit}
                fieldClass={setFieldClass('waterDepth')}
                actionType="environment-fairway"
              />
            </IonCol>
          )}
          <IonCol size="12">
            <RadioSelectField
              title={t('form-of-fairway')}
              name="fairwayForm"
              value={state.environment.fairway.fairwayForm}
              options={[...fairwayForms].sort((a, b) => {
                return a.id === 1 || b.id === 1 ? a.id - b.id : b.id - a.id;
              })}
              actionType="environment-fairway"
              required
              translateOptions
              infoContentTitle={t('form-of-fairway-info-title')}
              infoContentSize="large"
              infoContent={
                <>
                  <p>{t('form-of-fairway-info-content')}</p>
                  <IonGrid>
                    {[...fairwayForms]
                      .sort((a, b) => {
                        return a.id === 1 || b.id === 1 ? a.id - b.id : b.id - a.id;
                      })
                      .map((option) => (
                        <IonRow key={option.id}>
                          <IonCol size="4">
                            <IonLabel>
                              {getFairwayFormOrderForId(option.id)}. &nbsp; {tRoot(option.name).toString()}
                            </IonLabel>
                          </IonCol>
                          <IonCol size="8">
                            <IonLabel className="ion-text-wrap">{tRoot(option.desc).toString()}</IonLabel>
                          </IonCol>
                        </IonRow>
                      ))}
                  </IonGrid>
                  <IonGrid>
                    <IonRow>
                      {[...fairwayForms]
                        .sort((a, b) => {
                          return a.id === 1 || b.id === 1 ? a.id - b.id : b.id - a.id;
                        })
                        .map((option) => {
                          const optionName = tRoot(option.name).toString();
                          return (
                            <IonCol key={option.id} className="align-center">
                              <IonImg src={option.img} aria-hidden={true} />
                              <p aria-hidden={true}>
                                {getFairwayFormOrderForId(option.id)}. {optionName}
                              </p>
                            </IonCol>
                          );
                        })}
                    </IonRow>
                  </IonGrid>
                </>
              }
            />
          </IonCol>
          {/* Open Water empty columns
            Extensive view (portrait 0, landscape 2) Limited view (portrait 2, landscape 4) */}
          {state.environment.fairway.fairwayForm === fairwayForms[0] && ( // form == Open Water
            <>
              {limitedView && <IonCol size="6" />}
              <IonCol size="6" className="hide-portrait" />
              <IonCol size="6" className="hide-portrait" />
            </>
          )}
          {state.environment.fairway.fairwayForm !== fairwayForms[0] && ( // form != Open Water
            <IonCol size="12">
              <InputField
                title={t('channel-width')}
                name="channelWidth"
                value={state.environment.fairway.channelWidth}
                placeholder="0"
                min={fieldParams.channelWidth.min}
                max={fieldParams.channelWidth.max}
                unit={fieldParams.channelWidth.unit}
                fieldClass={setFieldClass('channelWidth')}
                actionType="environment-fairway"
              />
            </IonCol>
          )}
          {/* Channel empty columns
            Extensive view (portrait 3, landscape 1) Limited view (portrait 1, landscape 3) */}
          {state.environment.fairway.fairwayForm === fairwayForms[1] && ( // form == Channel
            <>
              {!limitedView && <IonCol size="6" />}
              <IonCol size="6" className={limitedView ? 'hide-portrait' : 'hide-landscape'} />
              <IonCol size="6" className={limitedView ? 'hide-portrait' : 'hide-landscape'} />
            </>
          )}
          {state.environment.fairway.fairwayForm === fairwayForms[2] && ( // form == Sloped Channel
            <>
              <IonCol size="6" className="inner-column first">
                <InputField
                  title={t('scale-of-slope')}
                  name="slopeScale"
                  value={state.environment.fairway.slopeScale}
                  placeholder="0"
                  min={fieldParams.slopeScale.min}
                  max={fieldParams.slopeScale.max}
                  step={fieldParams.slopeScale.step}
                  fieldClass={setFieldClass('slopeScale')}
                  actionType="environment-fairway"
                />
              </IonCol>
              <IonCol size="6" className="inner-column last">
                <InputField
                  title={t('height-of-slope')}
                  name="slopeHeight"
                  value={state.environment.fairway.slopeHeight}
                  placeholder="0"
                  min={fieldParams.slopeHeight.min}
                  max={state.environment.fairway.sweptDepth ? state.environment.fairway.sweptDepth : fieldParams.slopeHeight.max}
                  step={fieldParams.slopeHeight.step}
                  unit={fieldParams.slopeHeight.unit}
                  fieldClass={setFieldClass('slopeHeight')}
                  actionType="environment-fairway"
                />
              </IonCol>
            </>
          )}
          {/* Sloped Channel empty columns
            Extensive view (portrait 1, landscape 5) Limited view (portrait 3, landscape 1) */}
          {state.environment.fairway.fairwayForm === fairwayForms[2] && ( // form == Sloped Channel
            <>
              {!limitedView && <IonCol size="6" />}
              <IonCol size="6" className={limitedView ? 'hide-landscape' : 'hide-portrait'} />
              <IonCol size="6" className={limitedView ? 'hide-landscape' : 'hide-portrait'} />
              {!limitedView && <IonCol size="6" className="hide-portrait" />}
              {!limitedView && <IonCol size="6" className="hide-portrait" />}
            </>
          )}
        </IonRow>
      </IonGrid>

      <SectionTitle
        title={t('vessel')}
        valid={limitedView ? isFieldValid('vesselSpeed') : isAllValid(['vesselCourse', 'vesselSpeed', 'turningRadius'])}
      />
      <IonGrid className="no-padding">
        <IonRow className="input-row">
          {!limitedView && (
            <IonCol size="6">
              <InputField
                title={t('set-vessel-course')}
                name="vesselCourse"
                value={state.environment.vessel.vesselCourse}
                placeholder={zero.toString().padStart(3, '0')}
                min={fieldParams.vesselCourse.min}
                max={fieldParams.vesselCourse.max}
                unit={fieldParams.vesselCourse.unit}
                fieldClass={setFieldClass('vesselCourse')}
                actionType="environment-vessel"
              />
            </IonCol>
          )}
          <IonCol size={defaultColumnSize}>
            <InputField
              title={t('set-vessel-speed')}
              name="vesselSpeed"
              value={getValueOrNull(state.environment.vessel.vesselSpeed)}
              placeholder="0"
              min={fieldParams.vesselSpeed.min}
              max={fieldParams.vesselSpeed.max}
              unit={fieldParams.vesselSpeed.unit}
              fieldClass={setFieldClass('vesselSpeed')}
              actionType="environment-vessel"
              required
            />
          </IonCol>
          {!limitedView && (
            <IonCol size="6">
              <InputField
                title={t('set-turning-radius')}
                name="turningRadius"
                value={state.environment.vessel.turningRadius}
                placeholder="0"
                min={fieldParams.turningRadius.min}
                max={fieldParams.turningRadius.max}
                step={fieldParams.turningRadius.step}
                unit={fieldParams.turningRadius.unit}
                fieldClass={setFieldClass('turningRadius')}
                actionType="environment-vessel"
              />
            </IonCol>
          )}
          <IonCol size="6" />
          {limitedView && (
            <>
              <IonCol size="6" />
              <IonCol size="6" />
            </>
          )}
          <IonCol size="6" className="hide-portrait" />
          <IonCol size="6" className="hide-portrait" />
        </IonRow>
      </IonGrid>

      <SectionTitle
        title={t('attribute')}
        valid={
          limitedView
            ? isAllValid(['requiredUKC', 'motionClearance'])
            : isAllValid(['airDensity', 'waterDensity', 'requiredUKC', 'motionClearance', 'safetyMarginWindForce'])
        }
      />
      <IonGrid className="no-padding">
        <IonRow className="input-row">
          {!limitedView && (
            <IonCol size="6">
              <InputField
                title={t('set-density-of-air')}
                name="airDensity"
                value={state.environment.attribute.airDensity}
                placeholder="1.3"
                min={fieldParams.airDensity.min}
                max={fieldParams.airDensity.max}
                step={fieldParams.airDensity.step}
                unit={fieldParams.airDensity.unit}
                fieldClass={setFieldClass('airDensity')}
                actionType="environment-attribute"
              />
            </IonCol>
          )}
          {!limitedView && (
            <IonCol size="6">
              <InputField
                title={t('set-density-of-water')}
                name="waterDensity"
                value={state.environment.attribute.waterDensity}
                placeholder="1000"
                min={fieldParams.waterDensity.min}
                max={fieldParams.waterDensity.max}
                unit={fieldParams.waterDensity.unit}
                fieldClass={setFieldClass('waterDensity')}
                actionType="environment-attribute"
              />
            </IonCol>
          )}
          <IonCol size={defaultColumnSize}>
            <InputField
              title={t('required-UKC')}
              name="requiredUKC"
              value={state.environment.attribute.requiredUKC}
              placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              min={fieldParams.requiredUKC.min}
              max={fieldParams.requiredUKC.max}
              step={fieldParams.requiredUKC.step}
              unit={fieldParams.requiredUKC.unit}
              fieldClass={setFieldClass('requiredUKC')}
              actionType="environment-attribute"
            />
          </IonCol>
          <IonCol size={defaultColumnSize}>
            <InputField
              title={t('clearance-for-other-motions')}
              name="motionClearance"
              value={state.environment.attribute.motionClearance}
              placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              min={fieldParams.motionClearance.min}
              max={fieldParams.motionClearance.max}
              step={fieldParams.motionClearance.step}
              unit={fieldParams.motionClearance.unit}
              fieldClass={setFieldClass('motionClearance')}
              actionType="environment-attribute"
            />
          </IonCol>
          {!limitedView && (
            <IonCol size="6">
              <InputField
                title={t('safety-margin-wind-force')}
                name="safetyMarginWindForce"
                value={state.environment.attribute.safetyMarginWindForce}
                placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                min={fieldParams.safetyMarginWindForce.min}
                max={fieldParams.safetyMarginWindForce.max}
                unit={fieldParams.safetyMarginWindForce.unit}
                fieldClass={setFieldClass('safetyMarginWindForce')}
                actionType="environment-attribute"
              />
            </IonCol>
          )}
          {limitedView ? (
            <>
              <IonCol size="6" className="hide-portrait" />
              <IonCol size="6" className="hide-portrait" />
              <IonCol size="6" className="hide-portrait" />
              <IonCol size="6" className="hide-portrait" />
            </>
          ) : (
            <IonCol size="6" />
          )}
          <IonCol size="6" className="hide-landscape" />
          <IonCol size="6" className="hide-landscape" />
        </IonRow>
      </IonGrid>
    </>
  );
};

export default Environment;
