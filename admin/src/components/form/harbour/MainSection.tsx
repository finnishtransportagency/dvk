import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { HarborInput, Operation, Status } from '../../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';
import SelectInput from '../SelectInput';
import TextInput from '../TextInput';

interface MainSectionProps {
  state: HarborInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  readonly: boolean;
}

const MainSection: React.FC<MainSectionProps> = ({ state, updateState, validationErrors, readonly = false }) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="formGrid">
      <IonRow>
        <IonCol sizeMd="3">
          <TextInput
            label={t('harbour.primary-id')}
            val={state.id}
            setValue={updateState}
            actionType="primaryId"
            name="primaryId"
            required
            readonly={readonly}
            disabled={!readonly && state.operation === Operation.Update}
            error={state.operation === Operation.Update ? '' : validationErrors.find((error) => error.id === 'primaryId')?.msg}
            helperText={t('harbour.primary-id-help-text')}
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
            readonly={readonly}
            disabled={!readonly && state.status === Status.Removed}
          />
        </IonCol>
        <IonCol sizeMd="6"></IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default MainSection;
