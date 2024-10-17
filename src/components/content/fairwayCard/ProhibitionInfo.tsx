import React from 'react';
import { useTranslation } from 'react-i18next';
import { Fairway } from '../../../graphql/generated';

export type ProhibitionInfoProps = {
  data?: Fairway[] | null;
  inlineLabel?: boolean;
};

export const ProhibitionInfo: React.FC<ProhibitionInfoProps> = ({ data, inlineLabel }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const prohibitionAreas = data?.flatMap((fairway) => fairway.prohibitionAreas) ?? [];

  return (
    <>
      {data && (
        <>
          {!inlineLabel && <h5>{t('prohibitionAreas')}</h5>}
          <p>
            {inlineLabel && <strong>{t('prohibitionAreas')}: </strong>}
            {prohibitionAreas?.length > 0 && <span>{t('prohibitionText', { count: prohibitionAreas?.length })} </span>}
            {prohibitionAreas?.length < 1 && t('noDataSet')}
          </p>
        </>
      )}
    </>
  );
};
