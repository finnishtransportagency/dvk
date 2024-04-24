import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lang, MASTERSGUIDE_URLS } from '../../../utils/constants';
import { useDvkContext } from '../../../hooks/dvkContext';
import { Fairway } from '../../../graphql/generated';

export type ProhibitionInfoProps = {
  data?: Fairway[] | null;
  inlineLabel?: boolean;
};

export const ProhibitionInfo: React.FC<ProhibitionInfoProps> = ({ data, inlineLabel }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const prohibitionAreas = data?.flatMap((fairway) => fairway.areas?.filter((area) => area.typeCode === 15)) ?? [];

  return (
    <>
      {data && (
        <>
          {!inlineLabel && <h5>{t('prohibitionAreas')}</h5>}
          <p>
            {inlineLabel && <strong>{t('prohibitionAreas')}: </strong>}
            {prohibitionAreas?.length > 0 && (
              <span>
                {t('prohibitionText', { count: prohibitionAreas?.length })}{' '}
                <a href={'//' + MASTERSGUIDE_URLS[lang]} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
                  {MASTERSGUIDE_URLS[lang]}
                  <span className="screen-reader-only">{t('opens-in-a-new-tab')}</span>
                </a>
              </span>
            )}
            {prohibitionAreas?.length < 1 && t('noDataSet')}
          </p>
        </>
      )}
    </>
  );
};
