import React from 'react';
// import { IonText } from '@ionic/react';
import { uniqueId } from 'lodash';
import { setSelectedFairwayAreas } from '../../layers';
import { ProhibitionArea } from '../../../graphql/generated';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../../utils/constants';
import InfoIcon from '../../../theme/img/info.svg?react';

type ProhibitionAreaInfoListItemProps = {
  area: ProhibitionArea;
};

export const ProhibitionAreaInfoListItem: React.FC<ProhibitionAreaInfoListItemProps> = ({ area }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

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
      <em>{t('areaType' + area.typeCode)}</em>
      <br />
      <p className="use-flex">
        {`${t('extraInfo')}: `}
        {area.extraInfo?.[lang] || area.extraInfo?.fi ? (
          <span>{area.extraInfo[lang] ?? area.extraInfo.fi}</span>
        ) : (
          <span className="info inline use-flex ion-align-items-center">
            <InfoIcon />
            {t('noDataSet')}
          </span>
        )}
      </p>
    </li>
  );
};
