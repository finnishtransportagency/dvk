import React, { useEffect } from 'react';
import './Squat.css';
import { useTranslation } from 'react-i18next';
import {
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonPopover,
  IonContent,
  IonImg,
  IonIcon,
} from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import { percentFormatter, degreeFormatter, decimalFormatter } from './Squat';
import { fairwayForms } from '../hooks/squatReducer';
import { warningOutline } from 'ionicons/icons';
import { calculateFroudeNumber, calculateWaveAmplitudeProperties, calculateWaveLengthProperties } from '../utils/calculations';

const zero = 0;

const Environment: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useSquatContext();

  useEffect(() => {
    dispatch({
      type: 'environment-weather',
      payload: {
        key: 'waveLength',
        value: calculateWaveLengthProperties(state.environment.weather.wavePeriod, state.environment.fairway.sweptDepth),
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
      },
    });
  }, [
    state.vessel.general.lengthBPP,
    state.environment.weather.wavePeriod,
    state.environment.weather.waveHeight,
    state.environment.weather.waveLength,
    dispatch,
  ]);

  const updateAction = (
    event: CustomEvent,
    actionType: 'environment-weather' | 'environment-fairway' | 'environment-vessel' | 'environment-attribute'
  ) => {
    dispatch({
      type: actionType,
      payload: { key: (event.target as HTMLInputElement).name, value: Number((event.detail as HTMLInputElement).value) },
    });
  };

  // Validations
  const isReliabilityAnIssue = () => {
    //  If(Value(Froude_Nro_HG_Cal.Text) > 0.7, "Reliability Issue - Froude Number > 0,7", If(Value(Block_Coefficient.Text) < 0.6, "Reliability Issue - Block Coefficient < 0,60", If(Value(Block_Coefficient.Text) > 0.8, "Reliability Issue - Block Coefficient > 0,80", "")))
    const froudeNumber = calculateFroudeNumber(
      state.environment.vessel.vesselSpeed,
      state.environment.fairway.sweptDepth,
      state.environment.fairway.waterLevel
    );

    if (froudeNumber > 0.7) {
      return (
        <>
          {t('homePage.squat.environment.reliability-issue-froude-number')} &gt;{' '}
          {(0.7).toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </>
      );
    } else if (state.vessel.general.blockCoefficient < 0.6) {
      return (
        <>
          {t('homePage.squat.environment.reliability-issue-block-coefficient')} &lt;{' '}
          {(0.6).toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </>
      );
    } else if (state.vessel.general.blockCoefficient > 0.8) {
      return (
        <>
          {t('homePage.squat.environment.reliability-issue-block-coefficient')} &gt;{' '}
          {(0.8).toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </>
      );
    }
    return '';
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardSubtitle>{t('homePage.squat.environment.description')}</IonCardSubtitle>
        <IonCardTitle>{t('homePage.squat.environment.title')}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        {isReliabilityAnIssue() && (
          <IonGrid className="danger">
            <IonRow className="ion-align-items-center">
              <IonCol size="auto">
                <IonIcon size="large" icon={warningOutline} />
              </IonCol>
              <IonCol>
                <IonText>{isReliabilityAnIssue()}</IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        <IonAccordionGroup>
          <IonAccordion value="weather">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.environment.weather')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.set-wind-speed')} (m/s)</IonLabel>
                <IonRange
                  min={0}
                  max={35}
                  pin={true}
                  name="windSpeed"
                  value={state.environment.weather.windSpeed}
                  onIonChange={(e) => updateAction(e, 'environment-weather')}
                />
                <IonText color="secondary">
                  <p>{state.environment.weather.windSpeed} m/s</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.set-true-wind-or-wave-direction')} (deg)</IonLabel>
                <IonRange
                  min={0}
                  max={350}
                  step={10}
                  name="windDirection"
                  pin={true}
                  pinFormatter={degreeFormatter}
                  value={state.environment.weather.windDirection}
                  onIonChange={(e) => updateAction(e, 'environment-weather')}
                />
                <IonText color="secondary">
                  <p>{state.environment.weather.windDirection.toString().padStart(3, '0')}</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.set-wave-height')} (m)</IonLabel>
                <IonRange
                  min={0.0}
                  max={5.0}
                  step={0.1}
                  name="waveHeight"
                  pin={true}
                  pinFormatter={decimalFormatter}
                  value={state.environment.weather.waveHeight}
                  onIonChange={(e) => updateAction(e, 'environment-weather')}
                />
                <IonText color="secondary">
                  <p>
                    {state.environment.weather.waveHeight.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m
                  </p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.set-wave-period')} (s)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="1"
                  name="wavePeriod"
                  value={state.environment.weather.wavePeriod ? state.environment.weather.wavePeriod : null}
                  onIonChange={(e) => updateAction(e, 'environment-weather')}
                />
              </IonItem>
              <IonItem>
                <IonGrid>
                  <IonRow>
                    <IonCol size-sm="6">
                      <IonLabel position="stacked">{t('homePage.squat.environment.wave-length')} (m)</IonLabel>
                      <IonText>
                        <p>
                          {(isNaN(state.environment.weather.waveLength[0]) ? 0 : state.environment.weather.waveLength[0]).toLocaleString(
                            i18n.language,
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                          )}{' '}
                          m
                        </p>
                      </IonText>
                    </IonCol>
                    <IonCol size-sm="6">
                      <IonLabel position="stacked">{t('homePage.squat.environment.wave-amplitude')} (m)</IonLabel>
                      <IonText>
                        <p>
                          {(isNaN(state.environment.weather.waveAmplitude[0]) ? 0 : state.environment.weather.waveAmplitude[0]).toLocaleString(
                            i18n.language,
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                          )}{' '}
                          m
                        </p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="fairway">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.environment.fairway')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.swept-depth')} (m)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.1"
                  name="sweptDepth"
                  value={state.environment.fairway.sweptDepth ? state.environment.fairway.sweptDepth : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  onIonChange={(e) => updateAction(e, 'environment-fairway')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.water-level')} (m)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.1"
                  name="waterLevel"
                  value={state.environment.fairway.waterLevel ? state.environment.fairway.waterLevel : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  onIonChange={(e) => updateAction(e, 'environment-fairway')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.form-of-fairway')}</IonLabel>
                <IonSelect
                  value={state.environment.fairway.fairwayForm}
                  name="fairwayForm"
                  onIonChange={(e) => updateAction(e, 'environment-fairway')}
                >
                  {fairwayForms.map((fairway) => (
                    <IonSelectOption key={fairway.id} value={fairway}>
                      {t(fairway.name)}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              {state.environment.fairway.fairwayForm !== fairwayForms[0] && ( // form != Open Water
                <IonGrid>
                  <IonRow className="ion-justify-content-between ion-align-items-center">
                    <IonCol>
                      <IonItem>
                        <IonLabel position="stacked">{t('homePage.squat.environment.channel-width')} (m)</IonLabel>
                        <IonInput
                          type="number"
                          min="0"
                          name="channelWidth"
                          value={state.environment.fairway.channelWidth}
                          placeholder="0"
                          onIonChange={(e) => updateAction(e, 'environment-fairway')}
                        />
                      </IonItem>
                    </IonCol>
                    <IonCol size-xs="auto">
                      <IonChip color="primary" outline id="trigger-fairwayinfo">
                        <IonLabel>?</IonLabel>
                      </IonChip>
                      <IonPopover trigger="trigger-fairwayinfo">
                        <IonContent>
                          {state.environment.fairway.fairwayForm && (
                            <IonContent className="ion-padding-horizontal ion-text-center">
                              <IonText color="secondary">
                                <h4>{t(state.environment.fairway.fairwayForm.name)}</h4>
                              </IonText>
                              <p>{t(state.environment.fairway.fairwayForm.desc)}</p>
                            </IonContent>
                          )}
                          <IonImg src={state.environment.fairway.fairwayForm?.img} />
                        </IonContent>
                      </IonPopover>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              )}
              {state.environment.fairway.fairwayForm === fairwayForms[2] && ( // form == Sloped Channel
                <IonGrid>
                  <IonRow>
                    <IonCol size-lg="6">
                      <IonItem>
                        <IonLabel position="stacked">{t('homePage.squat.environment.scale-of-slope')}</IonLabel>
                        <IonInput
                          type="number"
                          min="0"
                          name="slopeScale"
                          value={state.environment.fairway.slopeScale}
                          placeholder="0"
                          onIonChange={(e) => updateAction(e, 'environment-fairway')}
                        />
                      </IonItem>
                    </IonCol>
                    <IonCol size-lg="6">
                      <IonItem>
                        <IonLabel position="stacked">{t('homePage.squat.environment.height-of-slope')} (m)</IonLabel>
                        <IonInput
                          type="number"
                          min="0"
                          name="slopeHeight"
                          value={state.environment.fairway.slopeHeight}
                          placeholder="0"
                          onIonChange={(e) => updateAction(e, 'environment-fairway')}
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              )}
            </IonList>
          </IonAccordion>
          <IonAccordion value="vessel">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.environment.vessel')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.set-vessel-course')} (deg)</IonLabel>
                <IonRange
                  min={0}
                  max={350}
                  step={10}
                  name="vesselCourse"
                  pin={true}
                  pinFormatter={degreeFormatter}
                  value={state.environment.vessel.vesselCourse}
                  onIonChange={(e) => updateAction(e, 'environment-vessel')}
                ></IonRange>
                <IonText color="secondary">
                  <p>{state.environment.vessel.vesselCourse.toString().padStart(3, '0')}</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.set-vessel-speed')} (kts)</IonLabel>
                <IonRange
                  min={0}
                  max={35}
                  name="vesselSpeed"
                  pin={true}
                  value={state.environment.vessel.vesselSpeed}
                  onIonChange={(e) => updateAction(e, 'environment-vessel')}
                ></IonRange>
                <IonText color="secondary">
                  <p>{state.environment.vessel.vesselSpeed} kts</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.set-turning-radius')} (nm)</IonLabel>
                <IonRange
                  min={0.1}
                  max={2.0}
                  step={0.05}
                  name="turningRadius"
                  pin={true}
                  pinFormatter={decimalFormatter}
                  value={state.environment.vessel.turningRadius}
                  onIonChange={(e) => updateAction(e, 'environment-vessel')}
                ></IonRange>
                <IonText color="secondary">
                  <p>
                    {state.environment.vessel.turningRadius.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} nm
                  </p>
                </IonText>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="attribute">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.environment.attribute')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">
                  {t('homePage.squat.environment.set-density-of-air')} (kg/m<sup>3</sup>)
                </IonLabel>
                <IonRange
                  min={1}
                  max={1.5}
                  step={0.1}
                  name="airDensity"
                  pin={true}
                  ticks={true}
                  snaps={true}
                  pinFormatter={decimalFormatter}
                  value={state.environment.attribute.airDensity}
                  onIonChange={(e) => updateAction(e, 'environment-attribute')}
                />
                <IonText color="secondary">
                  <p>
                    {state.environment.attribute.airDensity} kg/m<sup>3</sup>
                  </p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">
                  {t('homePage.squat.environment.set-density-of-water')} (kg/m<sup>3</sup>)
                </IonLabel>
                <IonRange
                  min={1000}
                  max={1025}
                  name="waterDensity"
                  pin={true}
                  value={state.environment.attribute.waterDensity}
                  onIonChange={(e) => updateAction(e, 'environment-attribute')}
                />
                <IonText color="secondary">
                  <p>
                    {state.environment.attribute.waterDensity} kg/m<sup>3</sup>
                  </p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.required-UKC')} (m)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="requiredUKC"
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  value={state.environment.attribute.requiredUKC}
                  onIonChange={(e) => updateAction(e, 'environment-attribute')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.environment.safety-margin-wind-force')}</IonLabel>
                <IonRange
                  min={0}
                  max={0.25}
                  step={0.01}
                  name="safetyMarginWindForce"
                  pin={true}
                  pinFormatter={percentFormatter}
                  value={state.environment.attribute.safetyMarginWindForce}
                  onIonChange={(e) => updateAction(e, 'environment-attribute')}
                />
                <IonText color="secondary">
                  <p>{state.environment.attribute.safetyMarginWindForce * 100} %</p>
                </IonText>
              </IonItem>
            </IonList>
          </IonAccordion>
        </IonAccordionGroup>
      </IonCardContent>
    </IonCard>
  );
};

export default Environment;
