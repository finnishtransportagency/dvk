import React from 'react';
import { IonGrid, IonText } from '@ionic/react';
import { ActionType, Lang, ValidationType, ValueType } from '../../../utils/constants';
import { FairwayCardInput, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { useTranslation } from 'react-i18next';

interface FairwaySectionProps {
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

const FairwaySection: React.FC<FairwaySectionProps> = ({ state, updateState, validationErrors }) => {
  const { t } = useTranslation();

  return (
    <>
      <IonText data-testid="fairwayInfo">
        <h2>{t('fairwaycard.fairway-info')}</h2>
      </IonText>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="fairwaycard.lining-and-marking"
          value={state.lineText}
          updateState={updateState}
          actionType="line"
          required={!!state.lineText?.fi || !!state.lineText?.sv || !!state.lineText?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'line')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="fairwaycard.design-speed"
          value={state.designSpeed}
          updateState={updateState}
          actionType="designSpeed"
          required={!!state.designSpeed?.fi || !!state.designSpeed?.sv || !!state.designSpeed?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'designSpeed')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="fairwaycard.speed-limit"
          value={state.speedLimit}
          updateState={updateState}
          actionType="speedLimit"
          required={!!state.speedLimit?.fi || !!state.speedLimit?.sv || !!state.speedLimit?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'speedLimit')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="fairwaycard.anchorage"
          value={state.anchorage}
          updateState={updateState}
          actionType="anchorage"
          required={!!state.anchorage?.fi || !!state.anchorage?.sv || !!state.anchorage?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'anchorage')?.msg}
          inputType="textarea"
        />
      </IonGrid>
    </>
  );
};

export default FairwaySection;
