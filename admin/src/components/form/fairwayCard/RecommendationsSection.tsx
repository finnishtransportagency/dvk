import React from 'react';
import { IonGrid, IonText } from '@ionic/react';
import { ActionType, Lang, SelectOption, ValidationType, ValueType } from '../../../utils/constants';
import { FairwayCardInput, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { useTranslation } from 'react-i18next';

interface RecommendationsSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  isLoadingMareographs?: boolean;
  mareographOptions?: SelectOption[];
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  state,
  updateState,
  validationErrors,
  isLoadingMareographs,
  mareographOptions,
}) => {
  const { t } = useTranslation();
  console.log(isLoadingMareographs);
  console.log(mareographOptions);
  return (
    <>
      <IonText>
        <h2>{t('fairwaycard.recommendation')}</h2>
      </IonText>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="fairwaycard.wind-recommendation"
          value={state.windRecommendation}
          updateState={updateState}
          actionType="windRecommendation"
          required={!!state.windRecommendation?.fi || !!state.windRecommendation?.sv || !!state.windRecommendation?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'windRecommendation')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="fairwaycard.vessel-recommendation"
          value={state.vesselRecommendation}
          updateState={updateState}
          actionType="vesselRecommendation"
          required={!!state.vesselRecommendation?.fi || !!state.vesselRecommendation?.sv || !!state.vesselRecommendation?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'vesselRecommendation')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="fairwaycard.visibility-recommendation"
          value={state.visibility}
          updateState={updateState}
          actionType="visibility"
          required={!!state.visibility?.fi || !!state.visibility?.sv || !!state.visibility?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'visibility')?.msg}
          inputType="textarea"
        />
        <TextInputRow
          labelKey="fairwaycard.wind-gauge"
          value={state.windGauge}
          updateState={updateState}
          actionType="windGauge"
          required={!!state.windGauge?.fi || !!state.windGauge?.sv || !!state.windGauge?.en}
          disabled={state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'windGauge')?.msg}
          inputType="textarea"
        />
      </IonGrid>
    </>
  );
};

export default RecommendationsSection;
