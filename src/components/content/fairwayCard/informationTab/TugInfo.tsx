import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Tug } from '../../../../graphql/generated';
import { Lang } from '../../../../utils/constants';
import PhoneNumber from '../PhoneNumber';
import uniqueId from 'lodash/uniqueId';

type TugInfoProps = {
  data?: (Tug | null)[] | null;
};

export const TugInfo: React.FC<TugInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data && (
        <IonText>
          <p className="no-margin-bottom">
            <strong>{t('tugs')}:</strong>
            {data.map((tug) => {
              const uuid = uniqueId('tug_');
              return (
                <span key={uuid}>
                  {(tug?.email || tug?.phoneNumber || tug?.fax) && <br />}
                  {!tug?.email && !tug?.phoneNumber && !tug?.fax && <>&nbsp;</>}
                  {tug?.name?.[lang]}
                  <br />
                  {(tug?.email || tug?.phoneNumber || tug?.fax) && (
                    <>
                      {t('email')}: {tug?.email && <a href={'mailto:' + tug?.email}>{tug?.email}</a>}
                      {!tug?.email && '-'}
                      <br />
                      {t('phone')}:{' '}
                      {tug?.phoneNumber?.map((phone, jdx) => {
                        const phoneUuid = uniqueId('phone_');
                        return (
                          <span key={phoneUuid}>
                            <PhoneNumber number={phone} primaryColorLink={true} />
                            {Number(tug.phoneNumber?.length) > jdx + 1 ? ', ' : ' '}
                          </span>
                        );
                      })}
                      {(!tug?.phoneNumber || (tug?.phoneNumber && tug?.phoneNumber.length < 1)) && '-'}
                      <br />
                      {t('fax')}: {tug?.fax ?? '-'}
                      <br />
                    </>
                  )}
                </span>
              );
            })}
          </p>
        </IonText>
      )}
    </>
  );
};
