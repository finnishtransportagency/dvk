import React from 'react';
import { useTranslation } from 'react-i18next';
import { Quay } from '../../../../graphql/generated';
import { setSelectedQuay } from '../../../layers';
import { Lang } from '../../../../utils/constants';
import uniqueId from 'lodash/uniqueId';
import { IonText } from '@ionic/react';

type QuayInfoProps = {
  data?: (Quay | null)[] | null;
};

export const QuayInfo: React.FC<QuayInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data?.map((quay) => {
        const uuid = uniqueId('quay_');
        return (
          <IonText
            key={uuid}
            onMouseEnter={() => setSelectedQuay(quay)}
            onFocus={() => setSelectedQuay(quay)}
            onMouseLeave={() => setSelectedQuay(null)}
            onBlur={() => setSelectedQuay(null)}
          >
            <p className="inlineHoverText">
              {quay?.name?.[lang]?.charAt(0).toLocaleUpperCase()}
              {quay?.name?.[lang]?.slice(1)}
              {!quay?.name && t('quay')}
              {quay?.length && (
                <>
                  {' - '}
                  <em>
                    {t('length')} {quay?.length?.toLocaleString()}&nbsp;
                    <span aria-label={t('unit.mDesc', { count: Number(quay?.length) })}>m</span>
                  </em>
                </>
              )}
              {quay?.sections?.map((section) => {
                const sectionUuid = uniqueId('section_');
                return (
                  <span key={sectionUuid}>
                    <br />
                    {section?.name && section.name + ': '} {t('sweptDepth', { count: 1 })} {section?.depth?.toLocaleString()}&nbsp;
                    <span aria-label={t('unit.mDesc', { count: Number(section?.depth) })}>m</span>
                  </span>
                );
              })}
              {quay?.extraInfo && (
                <>
                  <br />
                  {quay.extraInfo[lang]?.charAt(0).toLocaleUpperCase()}
                  {quay.extraInfo[lang]?.slice(1)}.
                </>
              )}
            </p>
          </IonText>
        );
      })}
    </>
  );
};
