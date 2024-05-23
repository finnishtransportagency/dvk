import React from 'react';
import { useTranslation } from 'react-i18next';
import { setSelectedFairwayArea } from '../../layers';
import { Area, Fairway } from '../../../graphql/generated';
import { IonText } from '@ionic/react';
import { Lang } from '../../../utils/constants';
import uniqueId from 'lodash/uniqueId';
import { TFunction } from 'i18next';

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
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const highlightArea = (id: string | number | undefined) => {
    setSelectedFairwayArea(id ?? 0);
  };

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
        const fairwayAreas = getFairwayAreas(fairway);
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
                  <IonText
                    key={uniqueId()}
                    onMouseEnter={() => highlightArea(area?.id)}
                    onFocus={() => highlightArea(area?.id)}
                    onMouseLeave={() => highlightArea(0)}
                    onBlur={() => highlightArea(0)}
                  >
                    <li className="group inlineHoverText">
                      <em>{getAreaName(area, t)}</em>
                      {isDraftAvailable && (
                        <>
                          <br />
                          {t('designDraft', { count: 1 })}: {(isN2000HeightSystem ? area?.n2000draft : area?.draft)?.toLocaleString() ?? '-'}&nbsp;
                          <dd aria-label={t('unit.mDesc', { count: Number(isN2000HeightSystem ? area?.n2000draft : area?.draft) })}>m</dd>
                        </>
                      )}
                      <br />
                      {t('sweptDepth', { count: 1 })}: {(isN2000HeightSystem ? area?.n2000depth : area?.depth)?.toLocaleString() ?? '-'}&nbsp;
                      <dd aria-label={t('unit.mDesc', { count: Number(isN2000HeightSystem ? area?.n2000depth : area?.depth) })}>m</dd>
                      {sizingSpeeds.length > 0 && (
                        <>
                          <br />
                          {t('designSpeed')}: {sizingSpeeds.join(' / ').toLocaleString()}&nbsp;
                          <dd aria-label={t('unit.ktsDesc', { count: 0 })}>kts</dd>
                        </>
                      )}
                      <br />
                      {area?.notationCode === 1 ? t('lateralMarking') : ''}
                      {area?.notationCode === 2 ? t('cardinalMarking') : ''}
                    </li>
                  </IonText>
                );
              })}
            </ol>
          </div>
        );
      })}
    </>
  );
};
