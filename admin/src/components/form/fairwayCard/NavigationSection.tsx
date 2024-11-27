import React from 'react';
import { IonGrid, IonText } from '@ionic/react';
import { ActionType, Lang, ValidationType, ValueType } from '../../../utils/constants';
import { FairwayCardInput, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { useTranslation } from 'react-i18next';

interface NavigationSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  readonly?: boolean;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({ state, updateState, validationErrors, readonly = false }) => {
  const { t } = useTranslation();

  return (
    <>
      <IonText>
        <h2>{t('fairwaycard.navigation')}</h2>
      </IonText>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="fairwaycard.navigation-condition"
          value={state.navigationCondition}
          updateState={updateState}
          actionType="navigationCondition"
          required={!!state.navigationCondition?.fi || !!state.navigationCondition?.sv || !!state.navigationCondition?.en}
          readonly={readonly}
          disabled={!readonly && state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'navigationCondition')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="fairwaycard.ice-condition"
          value={state.iceCondition}
          updateState={updateState}
          actionType="iceCondition"
          required={!!state.iceCondition?.fi || !!state.iceCondition?.sv || !!state.iceCondition?.en}
          readonly={readonly}
          disabled={!readonly && state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'iceCondition')?.msg}
          inputType="textarea"
        />
      </IonGrid>
    </>
  );
};

export default NavigationSection;
