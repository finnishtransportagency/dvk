import React from 'react';
import './Squat.css';
import { useTranslation } from "react-i18next";
import { IonText, IonList, IonItem, IonInput, IonLabel, IonAccordionGroup, IonAccordion, IonRange, IonSelect, IonSelectOption,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import { percentFormatter } from './Squat';
import { vessels, vesselProfiles } from '../hooks/squatReducer';

interface ContainerProps { }

const zero: number = 0;

const Vessel: React.FC<ContainerProps> = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch } = useSquatContext();

  const updateAction = (event: CustomEvent, actionType: 'vessel-select' | 'vessel-general' | 'vessel-detailed' | 'vessel-stability') => {
    dispatch({
      type: actionType,
      payload: { key: (event.target as HTMLInputElement).name, value: (event.detail as HTMLInputElement).value },
    });
  };

  return (
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
                <IonSelect value={state.vessel.vesselSelected} name="vesselSelected" placeholder={t('homePage.squat.vessel.search-ship-name')} onIonChange={e => updateAction(e, 'vessel-select')}>
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
                <IonInput type="number" min="0" step="0.01" name="lengthBPP" value={state.vessel.general.lengthBPP? state.vessel.general.lengthBPP : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} onIonChange={e => updateAction(e, 'vessel-general')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Breadth (m)</IonLabel>
                <IonInput type="number" min="0" step="0.01" name="breadth" value={state.vessel.general.breadth? state.vessel.general.breadth : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} onIonChange={e => updateAction(e, 'vessel-general')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Draught (m)</IonLabel>
                <IonInput type="number" min="0" step="0.01" name="draught" value={state.vessel.general.draught? state.vessel.general.draught : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} onIonChange={e => updateAction(e, 'vessel-general')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Block Coefficient</IonLabel>
                <IonInput type="number" min="0" step="0.01" name="blockCoefficient" value={state.vessel.general.blockCoefficient? state.vessel.general.blockCoefficient : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} onIonChange={e => updateAction(e, 'vessel-general')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Displacement (mt)</IonLabel>
                <IonInput type="number" min="0" step="1" name="displacement" value={state.vessel.general.displacement} placeholder="0" onIonChange={e => updateAction(e, 'vessel-general')} />
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
                <IonInput type="number" min="0" name="windSurface" value={state.vessel.detailed.windSurface? state.vessel.detailed.windSurface : null} placeholder="0" onIonChange={e => updateAction(e, 'vessel-detailed')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Estimated Deck Cargo (m<sup>2</sup>)</IonLabel>
                <IonInput type="number" min="0" name="deckCargo" value={state.vessel.detailed.deckCargo? state.vessel.detailed.deckCargo : null} placeholder="0" onIonChange={e => updateAction(e, 'vessel-detailed')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Bow Thruster (kW)</IonLabel>
                <IonInput type="number" min="0" name="bowThruster" value={state.vessel.detailed.bowThruster? state.vessel.detailed.bowThruster : null} placeholder="0" onIonChange={e => updateAction(e, 'vessel-detailed')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Bow Thruster Efficiency</IonLabel>
                <IonRange min={0} max={100} step={25} name="bowThrusterEfficiency" snaps={true} pinFormatter={percentFormatter} pin={true} value={state.vessel.detailed.bowThrusterEfficiency} onIonChange={e => updateAction(e, 'vessel-detailed')} />
                <IonText color="secondary">
                  <p>{state.vessel.detailed.bowThrusterEfficiency} %</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Select Vessel Profile</IonLabel>
                <IonSelect value={state.vessel.detailed.profileSelected} name="profileSelected" onIonChange={e => updateAction(e, 'vessel-detailed')}>
                  {vesselProfiles.map((profile) => (
                    <IonSelectOption key={profile.id} value={profile}>{t(profile.name)}</IonSelectOption>
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
                <IonInput type="number" min="0" step="0.01" name="KG" value={state.vessel.stability.KG? state.vessel.stability.KG : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} onIonChange={e => updateAction(e, 'vessel-stability')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">GM</IonLabel>
                <IonInput type="number" min="0" step="0.01" name="GM" value={state.vessel.stability.GM? state.vessel.stability.GM : null} placeholder={zero.toLocaleString(i18n.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})} onIonChange={e => updateAction(e, 'vessel-stability')} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">KB</IonLabel>
                <IonInput type="number" min="0" name="KB" value={state.vessel.stability.KB} placeholder="0" onIonChange={e => updateAction(e, 'vessel-stability')} />
              </IonItem>
            </IonList>
          </IonAccordion>
        </IonAccordionGroup>
      </IonCardContent>
    </IonCard>
  );
};

export default Vessel;