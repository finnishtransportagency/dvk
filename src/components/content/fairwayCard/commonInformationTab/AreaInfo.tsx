import React from 'react';
import { useTranslation } from 'react-i18next';
import { Area, Fairway } from '../../../../graphql/generated';
import { IonText } from '@ionic/react';
import { Lang } from '../../../../utils/constants';
import uniqueId from 'lodash/uniqueId';
import { AreaInfoListItem } from './AreaInfoListItem';
import { fairwayAreaExcludeType2Filter } from '../../../../utils/fairwayCardUtils';
import { getFairwayName } from '../../../../utils/common';

type AreaInfoProps = {
  data?: Fairway[] | null;
  isN2000HeightSystem?: boolean;
};

export const AreaInfo: React.FC<AreaInfoProps> = ({ data, isN2000HeightSystem }) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const fairways = data || [];

  const numberOfFairways = data ? data.length : 0;

  function getFairwayAreas(fairway: Fairway): Area[] {
    return fairway.areas ?? [];
  }

  let startIndex = 1;

  return (
    <>
      {fairways.map((fairway) => {
        const fairwayAreas = getFairwayAreas(fairway).filter(fairwayAreaExcludeType2Filter); // special areas moved to separate lists
        startIndex += fairwayAreas.length;
        return (
          <div key={uniqueId()}>
            {numberOfFairways > 1 && (
              <IonText>
                <h5 className="fairwayAreasFairwayName">
                  {getFairwayName(fairway, lang)}&nbsp;{fairway.id}:
                </h5>
              </IonText>
            )}
            <ol start={startIndex - fairwayAreas.length}>
              {fairwayAreas.map((area) => {
                const sizingSpeeds = [
                  ...Array.from(
                    new Set(
                      area?.fairways
                        ?.flatMap((fairway) => [fairway.sizingSpeed?.toLocaleString(), fairway.sizingSpeed2?.toLocaleString()])
                        .filter((val) => val)
                    )
                  ),
                ];
                const isDraftAvailable = ((isN2000HeightSystem ? area?.n2000draft : area?.draft) ?? 0) > 0;
                return (
                  <AreaInfoListItem
                    key={area.id}
                    area={area}
                    isDraftAvailable={isDraftAvailable}
                    isN2000HeightSystem={isN2000HeightSystem}
                    sizingSpeeds={sizingSpeeds}
                  />
                );
              })}
            </ol>
          </div>
        );
      })}
    </>
  );
};
