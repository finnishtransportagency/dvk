import React from 'react';
import { IonText } from '@ionic/react';
import { uniqueId } from 'lodash';
import { setSelectedFairwayArea } from '../../layers';
import { Area } from '../../../graphql/generated';
import { useTranslation } from 'react-i18next';

type AreaInfoListItemProps = {
  area: Area;
  isN2000HeightSystem: boolean | undefined;
  isDraftAvailable: boolean;
  sizingSpeeds: (string | undefined)[];
};

export const AreaInfoListItem: React.FC<AreaInfoListItemProps> = ({ area, isN2000HeightSystem, isDraftAvailable, sizingSpeeds }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const highlightArea = (id: string | number | undefined) => {
    setSelectedFairwayArea(id ?? 0);
  };
  return (
    <IonText
      key={uniqueId()}
      onMouseEnter={() => highlightArea(area?.id)}
      onFocus={() => highlightArea(area?.id)}
      onMouseLeave={() => highlightArea(0)}
      onBlur={() => highlightArea(0)}
    >
      <li className="group inlineHoverText">
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
    </IonText>
  );
};