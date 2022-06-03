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
        <IonCardSubtitle>{t("homePage.squat.calculations.description")}</IonCardSubtitle>
        <IonCardTitle>{t("homePage.squat.calculations.title")}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <IonAccordionGroup>
          <IonAccordion value="windforce">
            <IonItem slot="header">
              <IonLabel>{t("homePage.squat.calculations.wind-force")}</IonLabel>
            </IonItem>
    
            <IonList slot="content">
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.relative-wind-direction")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.lengthBPP}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.relative-wind-speed")} (m/s)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.breadth} m/s</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.wind-force")} ({t("common.tonnes")})</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.wave-force")} ({t("common.tonnes")})</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.draught}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.bow-thruster-force")} ({t("common.tonnes")})</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.lengthBPP * state.vessel.general.blockCoefficient}</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.remaining-safety-margin")}</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{(state.vessel.general.breadth * state.vessel.general.draught * state.vessel.general.blockCoefficient).toLocaleString(i18n.language, {maximumFractionDigits: 2})} %</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.minimum-external-force-required")}</small></IonLabel>
                <IonNote slot="end"><IonText><h4>X &ndash; Y</h4></IonText></IonNote>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="squat">
            <IonItem slot="header">
              <IonLabel>{t("homePage.squat.calculations.squat")}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.heel-due-wind")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.constant-heel-during-turn")} (deg)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.blockCoefficient}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.corrected-draught")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel color="danger"><small>Corrected Draught (m) ???</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.blockCoefficient} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonButton size="small">{t("homePage.squat.calculations.deep-water-values")}</IonButton>
                <IonNote slot="end">
                <IonButton size="small" shape="round" fill="outline" strong={true}>
                    ?
                </IonButton>
                </IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.UKC-vessel-motions")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.draught} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.UKC-straight-course")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{(state.vessel.general.displacement * state.vessel.general.blockCoefficient).toLocaleString(i18n.language, {maximumFractionDigits: 2})} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.UKC-during-turn")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement} m</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                <IonLabel><small>{t("homePage.squat.calculations.squat-sloped-channel")} (m)</small></IonLabel>
                <IonNote slot="end"><IonText><h4>{(state.vessel.general.displacement / state.vessel.general.blockCoefficient).toLocaleString(i18n.language, {maximumFractionDigits: 2})} m</h4></IonText></IonNote>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="drift">
            <IonItem slot="header">
              <IonLabel>{t("homePage.squat.calculations.drift")}</IonLabel>
            </IonItem>
      
            <IonList slot="content">
              <IonItem>
                  <IonLabel><small>{t("homePage.squat.calculations.relative-wind-direction")} (deg)</small></IonLabel>
                  <IonNote slot="end"><IonText><h4>{(state.vessel.general.displacement * state.vessel.general.blockCoefficient).toFixed(0)}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                  <IonLabel><small>{t("homePage.squat.calculations.relative-wind-speed")} (m/s)</small></IonLabel>
                  <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.displacement} m/s</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                  <IonLabel><small>{t("homePage.squat.calculations.estimated-drift-angle")} (deg)</small></IonLabel>
                  <IonNote slot="end"><IonText><h4>{state.vessel.general.displacement * state.vessel.general.displacement}&deg;</h4></IonText></IonNote>
              </IonItem>
              <IonItem>
                  <IonLabel><small>{t("homePage.squat.calculations.estimated-vessel-breadth-due-drift")} (m)</small></IonLabel>
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