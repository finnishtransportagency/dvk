import React, { useEffect } from 'react';
import './Squat.css';
import { useTranslation } from 'react-i18next';
import {
  IonText,
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
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/react';

import { useSquatContext } from '../hooks/squatContext';
import { percentFormatter } from './Squat';
import { vessels, vesselProfiles } from '../hooks/squatReducer';
import { calculateDisplacement, calculateKB } from '../utils/calculations';
import { warningOutline } from 'ionicons/icons';

const zero = 0;

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

  const updateAction = (event: CustomEvent, actionType: 'vessel-select' | 'vessel-general' | 'vessel-detailed' | 'vessel-stability') => {
    dispatch({
      type: actionType,
      payload: {
        key: (event.target as HTMLInputElement).name,
        value: (event.target as HTMLInputElement).value,
        elType: (event.target as HTMLInputElement).tagName,
      },
    });
  };

  // Validations
  const isTugUseRecommended = () => {
    // If(Value(Bow_Thruster_Force.Text) > 0, If(Value(Minimum_Force_Required.Text) > 0, true, false))
    if (state.calculations.forces.bowThrusterForce > 0 && state.calculations.forces.externalForceRequired > 0) {
      return true;
    }
    return false;
  };
  const isThrusterUnableToLiftBow = () => {
    // If(Value(Bow_Thruster_Force.Text) > 0, If((Length_BPP*0.25*(Wind_Force+Wave_Force))-(Length_BPP*0.75*Bow_Thruster*1.34/100)>0, true, false))
    if (
      state.calculations.forces.bowThrusterForce > 0 &&
      state.vessel.general.lengthBPP * 0.25 * (state.calculations.forces.windForce + state.calculations.forces.waveForce) -
        (state.vessel.general.lengthBPP * 0.75 * state.vessel.detailed.bowThruster * 1.34) / 100 >
        0
    ) {
      return true;
    }
    return false;
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardSubtitle>{t('homePage.squat.vessel.description')}</IonCardSubtitle>
        <IonCardTitle>{t('homePage.squat.vessel.title')}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        {isTugUseRecommended() && (
          <IonGrid className="danger">
            <IonRow className="ion-align-items-center">
              <IonCol size="auto">
                <IonIcon size="large" icon={warningOutline} />
              </IonCol>
              <IonCol>
                <IonText>{t('homePage.squat.vessel.tug-use-recommended')}</IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
        {isThrusterUnableToLiftBow() && (
          <IonGrid className="danger">
            <IonRow className="ion-align-items-center">
              <IonCol size="auto">
                <IonIcon size="large" icon={warningOutline} />
              </IonCol>
              <IonCol>
                <IonText>{t('homePage.squat.vessel.thruster-unable-to-lift-bow')}</IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        <IonAccordionGroup>
          <IonAccordion value="vessel">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.vessel.select-vessel')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.select-ship-name')}</IonLabel>
                <IonSelect
                  value={state.vessel.vesselSelected}
                  name="vesselSelected"
                  placeholder={t('homePage.squat.vessel.search-ship-name')}
                  onIonChange={(e) => updateAction(e, 'vessel-select')}
                >
                  {vessels.map((vessel) => (
                    <IonSelectOption key={vessel.id} value={vessel}>
                      {vessel.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="general">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.vessel.general')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.length-BPP')} (m)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="lengthBPP"
                  value={state.vessel.general.lengthBPP ? state.vessel.general.lengthBPP : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onIonChange={(e) => updateAction(e, 'vessel-general')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.breadth')} (m)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="breadth"
                  value={state.vessel.general.breadth ? state.vessel.general.breadth : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onIonChange={(e) => updateAction(e, 'vessel-general')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.draught')} (m)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="draught"
                  value={state.vessel.general.draught ? state.vessel.general.draught : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onIonChange={(e) => updateAction(e, 'vessel-general')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.block-coefficient')}</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="blockCoefficient"
                  value={state.vessel.general.blockCoefficient ? state.vessel.general.blockCoefficient : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onIonChange={(e) => updateAction(e, 'vessel-general')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.displacement')} (mt)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="1"
                  name="displacement"
                  value={state.vessel.general.displacement}
                  placeholder="0"
                  onIonChange={(e) => updateAction(e, 'vessel-general')}
                />
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="detailed">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.vessel.detailed')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">
                  {t('homePage.squat.vessel.total-lateral-wind-surface')} (m<sup>2</sup>)
                </IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  name="windSurface"
                  value={state.vessel.detailed.windSurface ? state.vessel.detailed.windSurface : null}
                  placeholder="0"
                  onIonChange={(e) => updateAction(e, 'vessel-detailed')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">
                  {t('homePage.squat.vessel.estimated-deck-cargo')} (m<sup>2</sup>)
                </IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  name="deckCargo"
                  value={state.vessel.detailed.deckCargo ? state.vessel.detailed.deckCargo : null}
                  placeholder="0"
                  onIonChange={(e) => updateAction(e, 'vessel-detailed')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.bow-thruster')} (kW)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  name="bowThruster"
                  value={state.vessel.detailed.bowThruster ? state.vessel.detailed.bowThruster : null}
                  placeholder="0"
                  onIonChange={(e) => updateAction(e, 'vessel-detailed')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.bow-thruster-efficiency')}</IonLabel>
                <IonRange
                  min={0}
                  max={1}
                  step={0.25}
                  name="bowThrusterEfficiency"
                  snaps={true}
                  pinFormatter={percentFormatter}
                  pin={true}
                  value={state.vessel.detailed.bowThrusterEfficiency}
                  onIonChange={(e) => updateAction(e, 'vessel-detailed')}
                />
                <IonText color="secondary">
                  <p>{state.vessel.detailed.bowThrusterEfficiency * 100} %</p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.select-vessel-profile')}</IonLabel>
                <IonSelect
                  value={state.vessel.detailed.profileSelected}
                  name="profileSelected"
                  onIonChange={(e) => updateAction(e, 'vessel-detailed')}
                >
                  {vesselProfiles.map((profile) => (
                    <IonSelectOption key={profile.id} value={profile}>
                      {t(profile.name)}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>
          </IonAccordion>
          <IonAccordion value="stability">
            <IonItem slot="header">
              <IonLabel>{t('homePage.squat.vessel.stability')}</IonLabel>
            </IonItem>

            <IonList slot="content">
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.KG')}</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="KG"
                  value={state.vessel.stability.KG ? state.vessel.stability.KG : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onIonChange={(e) => updateAction(e, 'vessel-stability')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.GM')}</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="GM"
                  value={state.vessel.stability.GM ? state.vessel.stability.GM : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onIonChange={(e) => updateAction(e, 'vessel-stability')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">{t('homePage.squat.vessel.KB')}</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="0.01"
                  name="KB"
                  value={state.vessel.stability.KB ? state.vessel.stability.KB : null}
                  placeholder={zero.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onIonChange={(e) => updateAction(e, 'vessel-stability')}
                />
              </IonItem>
            </IonList>
          </IonAccordion>
        </IonAccordionGroup>
      </IonCardContent>
    </IonCard>
  );
};

export default Vessel;
