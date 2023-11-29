import React from 'react';
import { IonGrid, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { HarborInput, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';

interface HarbourSectionProps {
  state: HarborInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
}

const HarbourSection: React.FC<HarbourSectionProps> = ({ state, updateState, validationErrors }) => {
  const { t } = useTranslation();

  return (
    <>
      <IonText>
        <h2>{t('harbour.harbour-info')}</h2>
      </IonText>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="harbour.name"
          value={state.name}
          name="harbourName"
          updateState={updateState}
          actionType="name"
          required
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'name')?.msg}
        />
        <TextInputRow
          labelKey="harbour.extra-info"
          value={state.extraInfo}
          updateState={updateState}
          actionType="extraInfo"
          required={!!state.extraInfo?.fi || !!state.extraInfo?.sv || !!state.extraInfo?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'extraInfo')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="harbour.cargo"
          value={state.cargo}
          updateState={updateState}
          actionType="cargo"
          required={!!state.cargo?.fi || !!state.cargo?.sv || !!state.cargo?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'cargo')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="harbour.harbour-basin"
          value={state.harborBasin}
          updateState={updateState}
          actionType="harbourBasin"
          required={!!state.harborBasin?.fi || !!state.harborBasin?.sv || !!state.harborBasin?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'harbourBasin')?.msg}
          inputType="textarea"
        />
      </IonGrid>
    </>
  );
};

export default HarbourSection;
