import React from 'react';
import { uniqueId } from 'lodash';
import { setSelectedFairwayAreas } from '../../layers';
import { Area } from '../../../graphql/generated';
import { useTranslation } from 'react-i18next';
import { getAreaName } from '../../../utils/common';

type AreaInfoListItemProps = {
  area: Area;
  isN2000HeightSystem: boolean | undefined;
  isDraftAvailable: boolean;
  sizingSpeeds: (string | undefined)[];
};

export const AreaInfoListItem: React.FC<AreaInfoListItemProps> = ({ area, isN2000HeightSystem, isDraftAvailable, sizingSpeeds }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.language;
  const highlightArea = (id: string | number | undefined) => {
    setSelectedFairwayAreas([id ?? 0]);
  };

  return (
    <li
      className="group inlineHoverText"
      key={uniqueId()}
      onMouseEnter={() => highlightArea(area?.id)}
      onFocus={() => highlightArea(area?.id)}
      onMouseLeave={() => highlightArea(0)}
      onBlur={() => highlightArea(0)}
    >
      <em>{getAreaName(area, t)}</em>
      {isDraftAvailable && (
        <>
          <br />
          {t('designDraft', { count: 1 })}: {(isN2000HeightSystem ? area?.n2000draft : area?.draft)?.toLocaleString(lang) ?? '-'}&nbsp;
          <span aria-label={t('unit.mDesc', { count: Number(isN2000HeightSystem ? area?.n2000draft : area?.draft) })}>m</span>
        </>
      )}
      <br />
      {area.typeCode !== 15 && (
        <>
          {t('sweptDepth', { count: 1 })}: {(isN2000HeightSystem ? area?.n2000depth : area?.depth)?.toLocaleString(lang) ?? '-'}&nbsp;
          <span aria-label={t('unit.mDesc', { count: Number(isN2000HeightSystem ? area?.n2000depth : area?.depth) })}>m</span>
        </>
      )}
      {sizingSpeeds.length > 0 && (
        <>
          <br />
          {t('designSpeed')}: {sizingSpeeds.join(' / ').toLocaleString()}&nbsp;
          <span aria-label={t('unit.ktsDesc', { count: 0 })}>kts</span>
        </>
      )}
      {area?.notationCode === 1 ? (
        <>
          <br />
          {t('lateralMarking')}
        </>
      ) : (
        ''
      )}
      {area?.notationCode === 2 ? (
        <>
          <br />
          {t('cardinalMarking')}
        </>
      ) : (
        ''
      )}
    </li>
  );
};
