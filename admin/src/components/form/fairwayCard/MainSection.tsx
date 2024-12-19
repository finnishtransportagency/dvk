import React, { useState } from 'react';
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
import NotificationModal from '../../NotificationModal';

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
  readonly?: boolean;
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
  readonly = false,
}) => {
  const { t } = useTranslation();
  const [deleteWarningModalOpen, setDeleteWarningModalOpen] = useState<boolean>(false);

  function updateStateCheckDeletes(
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) {
    const ids = value as number[];
    if (state.fairwayIds && state.fairwayIds.length > ids.length) {
      const removedId = state.fairwayIds.find((id) => !(value as number[]).includes(id));
      const foundRemovedIdLinks: (number | undefined)[] = [];
      state.squatCalculations?.forEach((sc) => foundRemovedIdLinks.push(sc.targetFairways?.find((f) => f === removedId)));
      if (foundRemovedIdLinks.filter((f) => f !== undefined).length > 0) {
        setDeleteWarningModalOpen(true);
        return;
      }
    }
    updateState(value, actionType, actionLang, actionTarget, actionOuterTarget);
  }

  return (
    <>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="fairwaycard.name"
          value={state.name}
          updateState={updateState}
          actionType="name"
          name="fairwayCardName"
          required
          disabled={!readonly && state.status === Status.Removed}
          readonly={readonly}
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
              disabled={!readonly && state.operation === Operation.Update}
              readonly={readonly}
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
              setSelected={updateStateCheckDeletes}
              actionType="fairwayIds"
              required
              showId
              disabled={!readonly && state.status === Status.Removed}
              readonly={readonly}
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
              disabled={!readonly && (state.fairwayIds.length < 2 || state.status === Status.Removed)}
              readonly={readonly}
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
              disabled={!readonly && (state.fairwayIds.length < 2 || state.status === Status.Removed)}
              readonly={readonly}
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
              disabled={!readonly && state.status === Status.Removed}
              readonly={readonly}
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
              disabled={!readonly && (state.status === Status.Removed || (state.squatCalculations ?? []).length > 0)}
              readonly={readonly}
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
              disabled={!readonly && state.status === Status.Removed}
              readonly={readonly}
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
              disabled={!readonly && state.status === Status.Removed}
              isLoading={isLoadingPilotRoutes}
              readonly={readonly}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <NotificationModal
        isOpen={deleteWarningModalOpen}
        closeAction={() => setDeleteWarningModalOpen(false)}
        closeTitle={t('general.close')}
        header={t('fairwaycard.cannot-remove-fairway-header')}
        message={t('fairwaycard.cannot-remove-fairway')}
      />
    </>
  );
};

export default MainSection;
