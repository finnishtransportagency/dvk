import React from 'react';
import { useTranslation } from 'react-i18next';
import { setSelectedFairwayArea } from '../../layers';
import { Fairway } from '../../../graphql/generated';
import { IonText } from '@ionic/react';

type AreaInfoProps = {
  data?: Fairway[] | null;
  isN2000HeightSystem?: boolean;
};

export const AreaInfo: React.FC<AreaInfoProps> = ({ data, isN2000HeightSystem }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const highlightArea = (id: string | number | undefined) => {
    setSelectedFairwayArea(id ?? 0);
  };

  const fairwayAreas =
    data
      ?.flatMap((fairway) =>
        fairway.areas?.sort((a, b) => {
          const areaFairwayA = a.fairways?.find((f) => f.fairwayId === fairway.id);
          const areaFairwayB = b.fairways?.find((f) => f.fairwayId === fairway.id);
          const sequenceNumberA = areaFairwayA?.sequenceNumber ?? 0;
          const sequenceNumberB = areaFairwayB?.sequenceNumber ?? 0;
          return sequenceNumberA - sequenceNumberB;
        })
      )
      .filter((value, index, self) => self.findIndex((inner) => inner?.id === value?.id) === index) ?? [];

  return (
    <ol>
      {fairwayAreas.map((area, idx) => {
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
            key={area?.id ?? idx}
            onMouseEnter={() => highlightArea(area?.id)}
            onFocus={() => highlightArea(area?.id)}
            onMouseLeave={() => highlightArea(0)}
            onBlur={() => highlightArea(0)}
          >
            <p className="inlineHoverText">
              <li className={fairwayAreas.length === idx + 1 ? 'no-margin-bottom' : ''}>
                <em>{area?.name ?? <>{t('areaType' + area?.typeCode)}</>}</em>
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
            </p>
          </IonText>
        );
      })}
    </ol>
  );
};
