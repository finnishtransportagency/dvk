import React from 'react';
import './Squat.css';
import { useTranslation } from "react-i18next";
import { IonText, IonList, IonItem, IonLabel, IonAccordionGroup, IonNote, IonButton, IonAccordion, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';

interface ContainerProps { }

const Calculations: React.FC<ContainerProps> = () => {
  const { t, i18n } = useTranslation();
  const { state } = useSquatContext();

  return (
    <IonCard color="secondary">
      <IonCardHeader>
        <IonCardSubtitle>Results of calculations</IonCardSubtitle>
        <IonCardTitle color="primary">{t("homePage.squat.calculations.title")}</IonCardTitle>
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
                <IonNote slot="end"><IonText><h4>{state.vessel.general.lengthBPP}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Relative Wind Speed (m/s)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.breadth} m/s</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Wind Force (tonnes)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Wave Force (tonnes)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.draught}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Bow Thruster Force (tonnes)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.lengthBPP * state.vessel.general.blockCoefficient}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Remaining Safety Margin</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{(state.vessel.general.breadth * state.vessel.general.draught * state.vessel.general.blockCoefficient).toLocaleString(i18n.language, {maximumFractionDigits: 2})} %</h4></IonText></IonNote>
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
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Constant Heel During Turn (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.blockCoefficient}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Corrected Draught (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel color="danger"><small>Corrected Draught (m) ???</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.blockCoefficient} m</h4></IonText></IonNote>
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
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.draught} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>UKC Straight Course (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{(state.vessel.general.displacement * state.vessel.general.blockCoefficient).toLocaleString(i18n.language, {maximumFractionDigits: 2})} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>UKC During Turn (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>Squat Sloped Channel (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{(state.vessel.general.displacement / state.vessel.general.blockCoefficient).toLocaleString(i18n.language, {maximumFractionDigits: 2})} m</h4></IonText></IonNote>
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
                  <IonNote slot="end"><IonText><h4>{(state.vessel.general.displacement * state.vessel.general.blockCoefficient).toFixed(0)}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                  <IonLabel><small>Relative Wind Speed (m/s)</small></IonLabel>
                  <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.displacement} m/s</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                  <IonLabel><small>Estimated Drift Angle (deg)</small></IonLabel>
                  <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.displacement}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                  <IonLabel><small>Estimated Vessel Breadth Due Drift (m)</small></IonLabel>
                  <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement / 2 * state.vessel.general.blockCoefficient} m</h4></IonText></IonNote>
              </IonItem>
            </IonList>
          </IonAccordion>
        </IonAccordionGroup>
      </IonCardContent>
    </IonCard>
  );
};

export default Calculations;