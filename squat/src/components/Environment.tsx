import React from 'react';
import './Squat.css';
import { useTranslation } from "react-i18next";
import { IonText, IonGrid, IonRow, IonCol, IonList, IonItem, IonInput, IonLabel, IonAccordionGroup, IonAccordion, IonRange, IonSelect,
  IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonPopover, IonContent, IonImg } from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import { percentFormatter, degreeFormatter, decimalFormatter } from './Squat';
import { fairwayForms } from '../hooks/squatReducer';

interface ContainerProps { }

const zero: number = 0;

const Environment: React.FC<ContainerProps> = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useSquatContext();

  const updateAction = (event: CustomEvent, actionType: 'environment-weather' | 'environment-fairway' | 'environment-vessel' | 'environment-attribute') => {
    dispatch({
      type: actionType,
      payload: { key: (event.target as HTMLInputElement).name, value: (event.detail as HTMLInputElement).value },
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardSubtitle>Information about weather conditions etc.</IonCardSubtitle>
        <IonCardTitle>Environment</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <IonAccordionGroup>
          <IonAccordion value="weather">
            <IonItem slot="header">
              <IonLabel>Weather</IonLabel>
            </IonItem>
      
            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">Set Wind Speed (m/s)</IonLabel>
                <IonRange min={0} max={35} pin={true} name="windSpeed" value={state.environment.weather.windSpeed} onIonChange={e => updateAction(e, 'environment-weather')} />
                <IonText color="secondary">
                  <p>{state.environment.weather.windSpeed} m/s</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Set True Wind / Wave Direction (deg)</IonLabel>
                <IonRange min={0} max={350} step={10} name="windDirection" pin={true} pinFormatter={degreeFormatter} value={state.environment.weather.windDirection} onIonChange={e => updateAction(e, 'environment-weather')} />
                <IonText color="secondary">
                  <p>{state.environment.weather.windDirection}&deg;</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Set Wave Height (m)</IonLabel>
                <IonRange min={0.0} max={5.0} step={0.1} name="waveHeight" pin={true} pinFormatter={decimalFormatter} value={state.environment.weather.waveHeight} onIonChange={e => updateAction(e, 'environment-weather')} />
                <IonText color="secondary">
                  <p>{state.environment.weather.waveHeight.toFixed(1)} m</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Set Wave Period (s)</IonLabel>
                <IonInput type="number" min="0" step="1" name="wavePeriod" value={state.environment.weather.wavePeriod? state.environment.weather.wavePeriod : null} onIonChange={e => updateAction(e, 'environment-weather')} />
              </IonItem>
              <IonItem>
                <IonGrid>
                  <IonRow>
                    <IonCol size-sm="6">
                      <IonLabel position="stacked">Wave Length (m)</IonLabel>
                      <IonText>
                        <p>{(state.environment.weather.windSpeed * state.environment.weather.waveHeight).toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} m</p>
                      </IonText>
                    </IonCol>
                    <IonCol size-sm="6">
                      <IonLabel position="stacked">Wave Amplitude (m)</IonLabel>
                      <IonText>
                        <p>{(state.environment.weather.waveHeight * state.vessel.general.blockCoefficient * 0.1).toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} m</p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="fairway">
            <IonItem slot="header">
              <IonLabel>Fairway</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">Swept Depth (m)</IonLabel>
                <IonInput type="number" min="0" step="0.1" name="sweptDepth" value={state.environment.fairway.sweptDepth? state.environment.fairway.sweptDepth : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 1, maximumFractionDigits: 1})} onIonChange={e => updateAction(e, 'environment-fairway')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Water Level (m)</IonLabel>
                <IonInput type="number" min="0" step="0.01" name="waterLevel" value={state.environment.fairway.waterLevel? state.environment.fairway.waterLevel : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} onIonChange={e => updateAction(e, 'environment-fairway')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Form of Fairway</IonLabel>
                <IonSelect value={state.environment.fairway.fairwayForm} name="fairwayForm" onIonChange={e => updateAction(e, 'environment-fairway')}>
                  {fairwayForms.map((fairway) => (
                    <IonSelectOption key={fairway.id} value={fairway}>{t(fairway.name)}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              {state.environment.fairway.fairwayForm !== fairwayForms[0] && // form != Open Water
                <IonGrid>
                  <IonRow className="ion-justify-content-between ion-align-items-center">
                    <IonCol>
                      <IonItem>
                        <IonLabel position="stacked">Channel Width (m)</IonLabel>
                        <IonInput type="number" min="0" name="channelWidth" value={state.environment.fairway.channelWidth} placeholder="0" onIonChange={e => updateAction(e, 'environment-fairway')} />
                      </IonItem>
                    </IonCol>
                    <IonCol size-xs="auto">
                      <IonChip color="primary" outline id="trigger-fairwayinfo">
                        <IonLabel>?</IonLabel>
                      </IonChip>
                      <IonPopover trigger="trigger-fairwayinfo">
                        <IonContent>
                          {state.environment.fairway.fairwayForm && 
                            <IonContent className="ion-padding-horizontal ion-text-center">
                              <IonText color="secondary">
                                <h4>{t(state.environment.fairway.fairwayForm.name)}</h4>
                              </IonText>
                              <p>{t(state.environment.fairway.fairwayForm.desc)}</p>
                            </IonContent>
                          }
                          <IonImg src={state.environment.fairway.fairwayForm?.img} />
                        </IonContent>
                      </IonPopover>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              }
              {state.environment.fairway.fairwayForm === fairwayForms[2] && // form == Sloped Channel
                <IonGrid>
                  <IonRow>
                    <IonCol size-lg="6">
                      <IonItem>
                        <IonLabel position="stacked">Scale of Slope</IonLabel>
                        <IonInput type="number" min="0" name="slopeScale" value={state.environment.fairway.slopeScale} placeholder="0" onIonChange={e => updateAction(e, 'environment-fairway')} />
                      </IonItem>
                    </IonCol>
                    <IonCol size-lg="6">
                      <IonItem>
                        <IonLabel position="stacked">Height of Slope (m)</IonLabel>
                        <IonInput type="number" min="0" name="slopeHeight" value={state.environment.fairway.slopeHeight} placeholder="0" onIonChange={e => updateAction(e, 'environment-fairway')} />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              }
            </IonList>
          </IonAccordion>
          <IonAccordion value="vessel">
            <IonItem slot="header">
              <IonLabel>Vessel</IonLabel>
            </IonItem>
      
            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">Set Vessel Course (deg)</IonLabel>
                <IonRange min={0} max={350} step={10} name="vesselCourse" pin={true} pinFormatter={degreeFormatter} value={state.environment.vessel.vesselCourse} onIonChange={e => updateAction(e, 'environment-vessel')}></IonRange>
                <IonText color="secondary">
                  <p>{state.environment.vessel.vesselCourse}&deg;</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Set Vessel Speed (kts)</IonLabel>
                <IonRange min={0} max={35} name="vesselSpeed" pin={true} value={state.environment.vessel.vesselSpeed} onIonChange={e => updateAction(e, 'environment-vessel')}></IonRange>
                <IonText color="secondary">
                  <p>{state.environment.vessel.vesselSpeed} kts</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Set Turning Radius (nm)</IonLabel>
                <IonRange min={0.1} max={2.0} step={0.05} name="turningRadius" pin={true} pinFormatter={decimalFormatter} value={state.environment.vessel.turningRadius} onIonChange={e => updateAction(e, 'environment-vessel')}></IonRange>
                <IonText color="secondary">
                  <p>{state.environment.vessel.turningRadius.toFixed(2)} nm</p>
                </IonText>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="attribute">
            <IonItem slot="header">
              <IonLabel>Attribute</IonLabel>
            </IonItem>
      
            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">Set Density of Air (kg/m<sup>3</sup>)</IonLabel>
                <IonRange min={1} max={1.5} step={0.1} name="airDensity" pin={true} ticks={true} snaps={true} pinFormatter={decimalFormatter} value={state.environment.attribute.airDensity} onIonChange={e => updateAction(e, 'environment-attribute')} />
                <IonText color="secondary">
                  <p>{state.environment.attribute.airDensity} kg/m<sup>3</sup></p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Set Density of Water (kg/m<sup>3</sup>)</IonLabel>
                <IonRange min={1000} max={1025} name="waterDensity" pin={true} value={state.environment.attribute.waterDensity} onIonChange={e => updateAction(e, 'environment-attribute')} />
                <IonText color="secondary">
                  <p>{state.environment.attribute.waterDensity} kg/m<sup>3</sup></p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Required UKC (m)</IonLabel>
                <IonInput type="number" min="0" step="0.01" name="requiredUKC" placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} value={state.environment.attribute.requiredUKC} onIonChange={e => updateAction(e, 'environment-attribute')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Safety Margin Wind Force</IonLabel>
                <IonRange min={0} max={25} step={1} name="safetyMarginWindForce" pin={true} pinFormatter={percentFormatter} value={state.environment.attribute.safetyMarginWindForce} onIonChange={e => updateAction(e, 'environment-attribute')} />
                <IonText color="secondary">
                  <p>{state.environment.attribute.safetyMarginWindForce} %</p>
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