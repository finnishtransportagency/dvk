import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Vts } from '../../../../graphql/generated';
import { Lang } from '../../../../utils/constants';
import PhoneNumber from '../PhoneNumber';
import uniqueId from 'lodash/uniqueId';

type VTSInfoProps = {
  data?: (Vts | null)[] | null;
};

export const VTSInfo: React.FC<VTSInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong data-testid="vts">{t('vts')}:</strong>
            {data.map((vts) => {
              const uuid = uniqueId();
              return (
                <span key={(vts?.name?.fi ?? '') + uuid}>
                  <br />
                  {vts?.name?.[lang]}
                  {vts?.vhf && vts.vhf.length > 0 && (
                    <>
                      , {t('vhf')} {vts?.vhf?.map((v) => (v?.name ? v.channel + ' (' + v?.name[lang] + ')' : v?.channel)).join(', ')}
                    </>
                  )}
                  <br />
                  {vts?.email && (
                    <>
                      {t('email')}:{' '}
                      {vts.email?.map((email, idx2) => {
                        return (
                          <span key={email}>
                            <a href={'mailto:' + email} className="primaryColorLink">
                              {email}
                            </a>
                            {Number(vts?.email?.length) > idx2 + 1 ? ', ' : ''}
                          </span>
                        );
                      })}
                      {vts.email.length < 1 && '-'}
                      <br />
                    </>
                  )}
                  <PhoneNumber title={t('phone')} showEmpty number={vts?.phoneNumber} primaryColorLink={true} />
                  <br />
                </span>
              );
            })}
          </p>
        </IonText>
      )}
    </>
  );
};
