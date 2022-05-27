import React, { useState } from 'react';
import './Squat.css';
import { useTranslation } from "react-i18next";
import { IonText, IonGrid, IonRow, IonCol, IonList, IonItem, IonInput, IonLabel, IonAccordionGroup, IonNote, IonButton, IonIcon,
  IonAccordion, IonRange, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/react';
import { star } from 'ionicons/icons';

interface ContainerProps { }

const vessels = [
  { id: 0, name: "None" },
  { id: 1, name: "Big rig" },
  { id: 2, name: "My Yacht" },
  { id: 3, name: "Neighbour's fishing boat" },
  { id: 4, name: "Row boat" }
];
type Vessel = typeof vessels[number];

const vesselProfiles = [
  { id: 1, name: "Bulker / Tanker" },
  { id: 2, name: "Container" },
  { id: 3, name: "Ferry" },
  { id: 4, name: "LNG Tanker" }
];
type VesselProfile = typeof vesselProfiles[number];

const fairwayForms = [
  { id: 1, name: "Open Water" },
  { id: 2, name: "Channel" },
  { id: 3, name: "Sloped Channel" }
];
type FairwayForm = typeof fairwayForms[number];

const Squat: React.FC<ContainerProps> = () => {
  const { t } = useTranslation();

  const [text, setText] = useState<string>();
  const [number, setNumber] = useState<number>();


  const [vessel, setVessel] = useState<Vessel>(vessels[0]);
  const [vesselProfile, setVesselProfile] = useState<VesselProfile>(vesselProfiles[0]);
  const [fairwayForm, setFairwayForm] = useState<FairwayForm>(fairwayForms[0]);

  const [blockCoefficient, setBlockCoefficient] = useState<number>(0.75);
  const [thrusterEfficiency, setThrusterEfficiency] = useState(100);
  const [KB, setKB] = useState<number>(10);

  const [windSpeed, setWindSpeed] = useState(0);
  const [windDirection, setWindDirection] = useState(90);
  const [waveHeight, setWaveHeight] = useState(0.0);

  const [vesselCourse, setVesselCourse] = useState(0);
  const [vesselSpeed, setVesselSpeed] = useState(0);
  const [turningRadius, setTurningRadius] = useState(0.75);

  const [airDensity, setAirDensity] = useState(1.3);
  const [waterDensity, setWaterDensity] = useState(1005);
  const [requiredUKC, setRequiredUKC] = useState(0.5);
  const [safetyMarginWindForce, setSafetyMarginWindForce] = useState(25);

  const percentFormatter = (value: number) => `${value}%`;
  const degreeFormatter = (value: number) => `${value}°`;
  const decimalFormatter = (value: number) => `${value.toFixed(1)}`;
  const decimal2Formatter = (value: number) => `${value.toFixed(2)}`;

  const zero = 0;

  return (
    <div>
      <IonText color="secondary">
        <h1>{t("homePage.squat.content")}</h1>
      </IonText>
      
    <IonGrid>
      <IonRow>
        <IonCol size-lg="4">
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Vessel selection and information</IonCardSubtitle>
              <IonCardTitle>Vessel</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonAccordionGroup>
                <IonAccordion value="vessel">
                  <IonItem slot="header">
                    <IonLabel>Select vessel</IonLabel>
                  </IonItem>
            
                  <IonList slot="content">
                    <IonItem>
                      <IonLabel position="stacked">Select Ship Name</IonLabel>
                      <IonSelect value={vessel} onIonChange={e => setVessel(e.detail.value)}>
                        {vessels.map((vessel) => (
                          <IonSelectOption key={vessel.id} value={vessel}>{vessel.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonList>
                </IonAccordion>
                <IonAccordion value="general">
                  <IonItem slot="header">
                    <IonLabel>General</IonLabel>
                  </IonItem>

                  <IonList slot="content">
                    <IonItem>
                      <IonLabel position="stacked">Length BPP (m)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Breadth (m)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Draught (m)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Block Coefficient</IonLabel>
                      <IonInput type="number" min="0" step="0.01" value={blockCoefficient} placeholder={zero.toFixed(2).toLocaleString()} onIonChange={e => setBlockCoefficient(parseInt(e.detail.value!, 10) as number)}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Displacement (mt)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                  </IonList>
                </IonAccordion>
                <IonAccordion value="detailed">
                  <IonItem slot="header">
                    <IonLabel>Detailed</IonLabel>
                  </IonItem>
            
                  <IonList slot="content">
                    <IonItem>
                      <IonLabel position="stacked">Total Lateral Wind Surface (m<sup>2</sup>)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Estimated Deck Cargo (m<sup>2</sup>)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Bow Thruster (kW)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Bow Thruster Efficiency</IonLabel>
                      <IonRange min={0} max={100} step={25} snaps={true} pinFormatter={percentFormatter} pin={true} value={thrusterEfficiency} onIonChange={e => setThrusterEfficiency(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{thrusterEfficiency} %</p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Select Vessel Profile</IonLabel>
                      <IonSelect value={vesselProfile} onIonChange={e => setVesselProfile(e.detail.value)}>
                        {vesselProfiles.map((profile) => (
                          <IonSelectOption key={profile.id} value={profile}>{profile.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonList>
                </IonAccordion>
                <IonAccordion value="stability">
                  <IonItem slot="header">
                    <IonLabel>Stability</IonLabel>
                  </IonItem>
            
                  <IonList slot="content">
                    <IonItem>
                      <IonLabel position="stacked">KG</IonLabel>
                      <IonInput value={text} placeholder={zero.toFixed(2).toLocaleString()}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">GM</IonLabel>
                      <IonInput value={text} placeholder={zero.toFixed(2).toLocaleString()}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">KB</IonLabel>
                      <IonInput type="number" value={KB} onIonChange={e => setKB(parseInt(e.detail.value!, 10) as number)}> </IonInput>
                    </IonItem>
                  </IonList>
                </IonAccordion>
              </IonAccordionGroup>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size-lg="4">
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
                      <IonRange min={0} max={35} pin={true} value={windSpeed} onIonChange={e => setWindSpeed(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{windSpeed} m/s</p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Set True Wind / Wave Direction (deg)</IonLabel>
                      <IonRange min={0} max={350} step={10} pin={true} pinFormatter={degreeFormatter} value={windDirection} onIonChange={e => setWindDirection(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{windDirection}&deg;</p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Set Wave Height (m)</IonLabel>
                      <IonRange min={0.0} max={5.0} step={0.1} pin={true} pinFormatter={decimalFormatter} value={waveHeight} onIonChange={e => setWaveHeight(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{waveHeight.toFixed(1)} m</p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Set Wave Period (s)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonGrid>
                        <IonRow>
                          <IonCol size-sm="6">
                            <IonLabel position="stacked">Wave Length (m)</IonLabel>
                            <IonText>
                              <p>{(windSpeed * waveHeight).toFixed(2).toLocaleString()} m</p>
                            </IonText>
                          </IonCol>
                          <IonCol size-sm="6">
                            <IonLabel position="stacked">Wave Amplitude (m)</IonLabel>
                            <IonText>
                              <p>{(waveHeight * blockCoefficient * 0.1).toFixed(2).toLocaleString()} m</p>
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
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Water Level (m)</IonLabel>
                      <IonInput value={text}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Form of Fairway</IonLabel>
                      <IonSelect value={fairwayForm} onIonChange={e => setFairwayForm(e.detail.value)}>
                        {fairwayForms.map((form) => (
                          <IonSelectOption key={form.id} value={form}>{form.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    {fairwayForm != fairwayForms[0] && // form != Open Water
                      <IonItem>
                        <IonLabel position="stacked">Channel Width (m)</IonLabel>
                        <IonInput type="number" value={text}> </IonInput>
                      </IonItem>
                    }
                    {fairwayForm == fairwayForms[2] && // form == Sloped Channel
                      <IonGrid>
                        <IonRow>
                          <IonCol size-lg="6">
                            <IonItem>
                              <IonLabel position="stacked">Scale of Slope</IonLabel>
                              <IonInput type="number" value={text}> </IonInput>
                            </IonItem>
                          </IonCol>
                          <IonCol size-lg="6">
                            <IonItem>
                              <IonLabel position="stacked">Height of Slope (m)</IonLabel>
                              <IonInput type="number" value={text}> </IonInput>
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
                      <IonRange min={0} max={350} step={10} pin={true} pinFormatter={degreeFormatter} value={vesselCourse} onIonChange={e => setVesselCourse(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{vesselCourse}&deg;</p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Set Vessel Speed (kts)</IonLabel>
                      <IonRange min={0} max={35} pin={true} value={vesselSpeed} onIonChange={e => setVesselSpeed(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{vesselSpeed} kts</p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Set Turning Radius (nm)</IonLabel>
                      <IonRange min={0.1} max={2.0} step={0.05} pin={true} pinFormatter={decimal2Formatter} value={turningRadius} onIonChange={e => setTurningRadius(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{turningRadius.toFixed(2)} nm</p>
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
                      <IonRange min={1} max={1.5} step={0.1} pin={true} ticks={true} snaps={true} pinFormatter={decimalFormatter} value={airDensity} onIonChange={e => setAirDensity(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{airDensity} kg/m<sup>3</sup></p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Set Density of Water (kg/m<sup>3</sup>)</IonLabel>
                      <IonRange min={1000} max={1025} pin={true} value={waterDensity} onIonChange={e => setWaterDensity(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{waterDensity} kg/m<sup>3</sup></p>
                      </IonText>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Required UKC (m)</IonLabel>
                      <IonInput type="number" min="0" step="0.01" placeholder={zero.toFixed(2).toLocaleString()} value={requiredUKC} onIonChange={e => setRequiredUKC(parseInt(e.detail.value!,10) as number)}> </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Safety Margin Wind Force</IonLabel>
                      <IonRange min={0} max={25} step={1} pin={true} pinFormatter={percentFormatter} value={safetyMarginWindForce} onIonChange={e => setSafetyMarginWindForce(e.detail.value as number)}></IonRange>
                      <IonText color="secondary">
                        <p>{safetyMarginWindForce} %</p>
                      </IonText>
                    </IonItem>
                  </IonList>
                </IonAccordion>
              </IonAccordionGroup>
            </IonCardContent>
          </IonCard>
        </IonCol>

        <IonCol size-lg="4">
          <IonCard color="secondary">
            <IonCardHeader>
              <IonCardSubtitle>Results of calculations</IonCardSubtitle>
              <IonCardTitle color="primary">Calculations</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonAccordionGroup>
                <IonAccordion value="windforce">
                  <IonItem slot="header">
                    <IonLabel>Wind Force</IonLabel>
                  </IonItem>
            
                  <IonList slot="content">
                    <IonItem>
                      <IonLabel><small>Relative Wind Direction (deg)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{windDirection}&deg;</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Relative Wind Speed (m/s)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{windSpeed} m/s</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Wind Force (tonnes)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{windSpeed * windDirection}</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Wave Force (tonnes)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{waveHeight * windSpeed}</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Bow Thruster Force (tonnes)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{windSpeed * windDirection}</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Remaining Safety Margin</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{(waveHeight * windSpeed * blockCoefficient).toFixed(2).toLocaleString()} %</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Minimum External Force Required</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>X &ndash; Y</h4></IonText></IonNote>
                    </IonItem>
                  </IonList>
                </IonAccordion>
                <IonAccordion value="squat">
                  <IonItem slot="header">
                    <IonLabel>Squat</IonLabel>
                  </IonItem>

                  <IonList slot="content">
                    <IonItem>
                      <IonLabel><small>Heel Due Wind (deg)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{windDirection}&deg;</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Constant Heel During Turn (deg)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{windDirection * blockCoefficient}&deg;</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Corrected Draught (m)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{vesselSpeed} m</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Corrected Draught (m) ???</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{vesselSpeed * blockCoefficient} m</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonButton size="small">Deep Water<br/> Values</IonButton>
                      <IonNote slot="end">
                        <IonButton size="small" shape="round" fill="outline" strong={true}>
                          ?
                        </IonButton>
                      </IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>UKC Vessel Motions (m)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{vesselSpeed * requiredUKC} m</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>UKC Straight Course (m)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{(requiredUKC * blockCoefficient).toFixed(2).toLocaleString()} m</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>UKC During Turn (m)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{requiredUKC} m</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Squat Sloped Channel (m)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{vesselSpeed / blockCoefficient * fairwayForm.id} m</h4></IonText></IonNote>
                    </IonItem>
                  </IonList>
                </IonAccordion>
                <IonAccordion value="drift">
                  <IonItem slot="header">
                    <IonLabel>Drift</IonLabel>
                  </IonItem>
            
                  <IonList slot="content">
                    <IonItem>
                      <IonLabel><small>Relative Wind Direction (deg)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{(windDirection * blockCoefficient).toFixed(0)}&deg;</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Relative Wind Speed (m/s)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{windSpeed * blockCoefficient} m/s</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Estimated Drift Angle (deg)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{vesselSpeed * windDirection}&deg;</h4></IonText></IonNote>
                    </IonItem>
                    <IonItem>
                      <IonLabel><small>Estimated Vessel Breadth Due Drift (m)</small></IonLabel>
                      <IonNote slot="end"><IonText><h4>{vesselSpeed / 2 * blockCoefficient} m</h4></IonText></IonNote>
                    </IonItem>
                  </IonList>
                </IonAccordion>
              </IonAccordionGroup>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>

    </div>
  );
};

export default Squat;
