import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, SelectOption, ValidationType, ValueType } from '../../../utils/constants';
import { FairwayCardInput, Operation, Status } from '../../../graphql/generated';
import TextInput from '../TextInput';
import SelectInput from '../SelectInput';
import TextInputRow from '../TextInputRow';
import { FeatureCollection } from 'geojson';
import { featureCollectionToSelectOptions } from '../../../utils/common';
import SelectWithCustomDropdown from '../SelectWithCustomDropdown';

interface MainSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  setValidity: (actionType: ActionType, val: boolean) => void;
  isLoadingFairways: boolean;
  isLoadingHarbours: boolean;
  isLoadingPilotRoutes?: boolean;
  fairwayOptions?: SelectOption[];
  harbourOptions?: SelectOption[];
  fairwaySelection?: SelectOption[];
  pilotRouteOptions?: FeatureCollection;
  sourceCard?: string;
}

const MainSection: React.FC<MainSectionProps> = ({
  state,
  updateState,
  validationErrors,
  setValidity,
  isLoadingFairways,
  isLoadingHarbours,
  isLoadingPilotRoutes,
  fairwayOptions,
  harbourOptions,
  fairwaySelection,
  pilotRouteOptions,
  sourceCard,
}) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="formGrid">
      <TextInputRow
        labelKey="fairwaycard.name"
        value={state.name}
        updateState={updateState}
        actionType="name"
        name="fairwayCardName"
        required
        disabled={state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'name')?.msg}
      />
      <IonRow>
        <IonCol sizeMd="3">
          <TextInput
            label={t('fairwaycard.primary-id')}
            val={state.id}
            setValue={updateState}
            actionType="primaryId"
            name="primaryId"
            required
            disabled={state.operation === Operation.Update || (!sourceCard?.length && !!state.pictures?.length)}
            error={state.operation === Operation.Update ? '' : validationErrors.find((error) => error.id === 'primaryId')?.msg}
            helperText={t('fairwaycard.primary-id-help-text')}
            setValidity={setValidity}
          />
        </IonCol>
        <IonCol sizeMd="3">
          <SelectWithCustomDropdown
            dropdownType="filter"
            label={t('fairwaycard.linked-fairways')}
            options={fairwayOptions ?? []}
            selected={state.fairwayIds || []}
            setSelected={updateState}
            actionType="fairwayIds"
            required
            showId
            disabled={state.status === Status.Removed}
            error={validationErrors.find((error) => error.id === 'fairwayIds')?.msg}
            isLoading={isLoadingFairways}
          />
        </IonCol>
        <IonCol sizeMd="3">
          <SelectWithCustomDropdown
            dropdownType="sequence"
            options={fairwaySelection ?? []}
            label={t('fairwaycard.starting-fairways')}
            selected={state.primaryFairwayId ?? []}
            setSelected={updateState}
            actionType="fairwayPrimary"
            helperText={t('fairwaycard.fairway-order-help-text') + ' ' + t('general.multiple-values-supported')}
            isLoading={isLoadingFairways}
            disabled={state.fairwayIds.length < 2 || state.status === Status.Removed}
            error={validationErrors.find((error) => error.id === 'fairwayPrimary')?.msg}
            infoTitle={t('modal.starting-fairway-title')}
            infoDescription={t('modal.starting-fairway-description')}
            required
            showId
          />
        </IonCol>
        <IonCol sizeMd="3">
          <SelectWithCustomDropdown
            dropdownType="sequence"
            options={fairwaySelection ?? []}
            label={t('fairwaycard.ending-fairways')}
            selected={state.secondaryFairwayId ?? []}
            setSelected={updateState}
            actionType="fairwaySecondary"
            helperText={t('fairwaycard.fairway-order-help-text') + ' ' + t('general.multiple-values-supported')}
            isLoading={isLoadingFairways}
            disabled={state.fairwayIds.length < 2 || state.status === Status.Removed}
            error={validationErrors.find((error) => error.id === 'fairwaySecondary')?.msg}
            infoTitle={t('modal.ending-fairway-title')}
            infoDescription={t('modal.ending-fairway-description')}
            required
            showId
          />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol sizeMd="3">
          <SelectInput
            label={t('general.item-area')}
            selected={state.group}
            options={[
              { name: { fi: t('general.archipelagoSea') }, id: '1' },
              { name: { fi: t('general.gulfOfFinland') }, id: '2' },
              { name: { fi: t('general.gulfOfBothnia') }, id: '3' },
            ]}
            setSelected={updateState}
            actionType="group"
            required
            disabled={state.status === Status.Removed}
            error={validationErrors.find((error) => error.id === 'group')?.msg}
          />
        </IonCol>
        <IonCol sizeMd="3">
          <SelectInput
            label={t('general.item-referencelevel')}
            selected={state.n2000HeightSystem}
            options={[
              { name: { fi: 'MW' }, id: false },
              { name: { fi: 'N2000' }, id: true },
            ]}
            setSelected={updateState}
            actionType="referenceLevel"
            disabled={state.status === Status.Removed}
          />
        </IonCol>
        <IonCol sizeMd="3">
          <SelectInput
            label={t('fairwaycard.linked-harbours')}
            selected={state.harbors ?? []}
            options={harbourOptions ?? []}
            setSelected={updateState}
            actionType="harbours"
            multiple
            isLoading={isLoadingHarbours}
            disabled={state.status === Status.Removed}
          />
        </IonCol>
        <IonCol sizeMd="3">
          <SelectWithCustomDropdown
            dropdownType="filter"
            label={t('fairwaycard.linked-pilot-routes')}
            options={featureCollectionToSelectOptions(pilotRouteOptions) ?? []}
            selected={state.pilotRoutes ?? []}
            setSelected={updateState}
            actionType="pilotRoutes"
            disabled={state.status === Status.Removed || import.meta.env.VITE_APP_ENV === 'prod'}
            isLoading={isLoadingPilotRoutes}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default MainSection;
