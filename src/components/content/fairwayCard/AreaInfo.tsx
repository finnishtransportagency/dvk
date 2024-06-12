import React from 'react';
import { useTranslation } from 'react-i18next';
import { Area, Fairway } from '../../../graphql/generated';
import { IonText } from '@ionic/react';
import { Lang } from '../../../utils/constants';
import uniqueId from 'lodash/uniqueId';
import { TFunction } from 'i18next';
import { AreaInfoListItem } from './AreaInfoListItem';

type AreaInfoProps = {
  data?: Fairway[] | null;
  isN2000HeightSystem?: boolean;
};

export function getAreaName(area: Area, t: TFunction) {
  const name = area.name;
  const type = t('areaType' + area.typeCode);
  // ankkurointialueet pitkässä muodossa esim. osa 'c' -> 'ankkurointialue c'
  if (area.typeCode == 2) {
    return name ? type + ' ' + name : type;
  }
  return name ?? type;
}

export const AreaInfo: React.FC<AreaInfoProps> = ({ data, isN2000HeightSystem }) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const fairways = data || [];

  const numberOfFairways = data ? data.length : 0;

  function getFairwayName(fairway: Fairway, lang: Lang): string {
    if (fairway.name) {
      return fairway.name[lang] ?? fairway.name.fi ?? '';
    }
    return '';
  }

  function getFairwayAreas(fairway: Fairway): Area[] {
    return fairway.areas ?? [];
  }

  let startIndex = 1;

  return (
    <>
      {fairways.map((fairway) => {
        const fairwayAreas = getFairwayAreas(fairway).filter((area) => {
          return area.typeCode && area.typeCode !== 2 && area.typeCode !== 15;
        }); // special areas moved to spearate list
        startIndex += fairwayAreas.length;
        return (
          <div key={uniqueId()}>
            {numberOfFairways > 1 && (
              <IonText>
                <h5 className="fairwayAreasFairwayName">{getFairwayName(fairway, lang)}:</h5>
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
