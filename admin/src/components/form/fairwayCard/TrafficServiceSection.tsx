import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, MainSectionTitle, MainSectionOpenType, SelectOption, ValidationType, ValueType } from '../../../utils/constants';
import { FairwayCardInput, PilotPlace, PilotPlaceInput, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { useTranslation } from 'react-i18next';
import SelectInput from '../SelectInput';
import TextInput from '../TextInput';
import CollapsibleWrapper from '../CollapsibleWrapper';

interface TrafficServiceSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  isLoadingPilotPlaces: boolean;
  isLoadingVtsAreas: boolean;
  sectionsOpen: MainSectionOpenType[];
  toggleSection: (id: MainSectionTitle, open: boolean) => void;
  pilotPlaceOptions?: SelectOption[];
  vtsAreaOptions?: SelectOption[];
  readonly?: boolean;
}

const TrafficServiceSection: React.FC<TrafficServiceSectionProps> = ({
  state,
  updateState,
  validationErrors,
  isLoadingPilotPlaces,
  isLoadingVtsAreas,
  sectionsOpen,
  toggleSection,
  pilotPlaceOptions,
  vtsAreaOptions,
  readonly = false,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <CollapsibleWrapper
      title={t('fairwaycard.pilot-order')}
      dataTestId="pilotOrder"
      subSection={true}
      sectionsOpen={sectionsOpen}
      toggleSection={toggleSection}
    >
      <IonGrid className="formGrid" style={{ overflow: 'visible' }}>
        <IonRow>
          <IonCol sizeMd="4">
            <TextInput
              label={t('general.email')}
              val={state.trafficService?.pilot?.email ?? ''}
              setValue={updateState}
              actionType="pilotEmail"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
              inputType="email"
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('general.phone-number')}
              val={state.trafficService?.pilot?.phoneNumber ?? ''}
              setValue={updateState}
              actionType="pilotPhone"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
              inputType="tel"
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('general.fax')}
              val={state.trafficService?.pilot?.fax ?? ''}
              setValue={updateState}
              actionType="pilotFax"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
              inputType="tel"
            />
          </IonCol>
        </IonRow>
        <TextInputRow
          labelKey="general.additional-information"
          value={state.trafficService?.pilot?.extraInfo}
          updateState={updateState}
          actionType="pilotExtraInfo"
          required={
            !!state.trafficService?.pilot?.extraInfo?.fi ||
            !!state.trafficService?.pilot?.extraInfo?.sv ||
            !!state.trafficService?.pilot?.extraInfo?.en
          }
          readonly={readonly}
          disabled={!readonly && state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'pilotExtraInfo')?.msg}
          inputType="textarea"
        />
        <IonRow>
          <IonCol sizeMd="6">
            <SelectInput
              label={t('fairwaycard.linked-pilot-places')}
              selected={(state.trafficService?.pilot?.places as PilotPlaceInput[]) || []}
              options={pilotPlaceOptions ?? []}
              setSelected={updateState}
              actionType="pilotPlaces"
              multiple
              compareObjects
              isLoading={isLoadingPilotPlaces}
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
              showCoords
            />
          </IonCol>
          {state.trafficService?.pilot?.places?.map((place) => {
            const pilotPlace = place as PilotPlace;
            const pilotName = (pilotPlace.name && (pilotPlace.name[lang] || pilotPlace.name.fi)) || pilotPlace.id.toString();
            return (
              <IonCol key={place.id}>
                <TextInput
                  label={t('fairwaycard.pilotage-distance-from') + ' ' + pilotName}
                  val={place.pilotJourney}
                  setValue={updateState}
                  actionType="pilotJourney"
                  actionTarget={place.id}
                  unit="nm"
                  inputType="number"
                  max={999.9}
                  decimalCount={1}
                  readonly={readonly}
                  disabled={!readonly && state.status === Status.Removed}
                />
              </IonCol>
            );
          })}
        </IonRow>
        <IonRow>
          <SelectInput
            label="vts-alueet"
            selected={state.trafficService?.vtsIds ?? []}
            options={vtsAreaOptions ?? []}
            setSelected={updateState}
            actionType="vtsIds"
            multiple
            isLoading={isLoadingVtsAreas}
            disabled={!readonly && state.status === Status.Removed}
            readonly={readonly}
          />
        </IonRow>
      </IonGrid>
    </CollapsibleWrapper>
  );
};

export default TrafficServiceSection;
