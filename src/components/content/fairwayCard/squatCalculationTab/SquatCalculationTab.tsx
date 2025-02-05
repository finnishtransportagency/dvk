import React from 'react';
import { FairwayCardPartsFragment, SquatCalculation } from '../../../../graphql/generated';
import SquatCalculationTemplate from './SquatCalculationTemplate';
import { uniqueId } from 'lodash';
import SquatCalculationTemplateNotAvailable from './SquatCalculationTemplateNotAvailable';
import { Lang } from '../../../../utils/constants';
import { useTranslation } from 'react-i18next';

interface SquatCalculationTabProps {
  fairwayCard: FairwayCardPartsFragment;
  validSquats: SquatCalculation[];
}
export const SquatCalculationTab: React.FC<SquatCalculationTabProps> = ({ fairwayCard, validSquats }) => {
  //Check validity of squat calculation templates
  //all Areas
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {validSquats && validSquats.length > 0 ? (
        validSquats
          .toSorted((a, b) => {
            if (!a.place || !b.place || !a.place[lang] || !b.place[lang]) return 0;
            return a.place[lang].localeCompare(b.place[lang]);
          })
          .map((calc) => {
            return <SquatCalculationTemplate squatCalculation={calc} key={uniqueId()} fairways={fairwayCard.fairways} />;
          })
      ) : (
        <SquatCalculationTemplateNotAvailable />
      )}
    </>
  );
};
