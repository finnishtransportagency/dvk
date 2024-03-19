import React from 'react';
import { FairwayCardInput, Status } from '../../../graphql/generated';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';
import { IonGrid, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import TextInputRow from '../TextInputRow';

interface AdditionalInfoSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ state, updateState, validationErrors }) => {
  const { t } = useTranslation();

  return (
    <>
      <IonText>
        <h2>{t('fairwaycard.fairway-additional-info')}</h2>
      </IonText>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="fairwaycard.fairway-notice"
          value={state.notice}
          updateState={updateState}
          actionType="notice"
          required={!!state.notice?.fi || !!state.notice?.sv || !!state.notice?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'notice')?.msg}
          inputType="textarea"
        />
      </IonGrid>
    </>
  );
};

export default AdditionalInfoSection;
