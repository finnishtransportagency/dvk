import React from 'react';
import { useTranslation } from 'react-i18next';
import { HarborPartsFragment } from '../../../../graphql/generated';
import { Lang } from '../../../../utils/constants';
import PhoneNumber from './PhoneNumber';
import { useDvkContext } from '../../../../hooks/dvkContext';
import uniqueId from 'lodash/uniqueId';

type ContactInfoProps = {
  data?: HarborPartsFragment | null;
  noMargin?: boolean;
};

export const ContactInfo: React.FC<ContactInfoProps> = ({ data, noMargin }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  return (
    <>
      {data && (
        <p className={noMargin ? 'no-margin-bottom' : ''}>
          {data.company && (
            <>
              <span>{data.company[lang]}</span>
              <br />
            </>
          )}
          {t('email')}:&nbsp;
          {data.email ? (
            <a href={'mailto:' + data.email} className="primaryColorLink">
              {data.email}
            </a>
          ) : (
            '-'
          )}
          <br />
          {data.internet && (
            <>
              <a href={data.internet} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
                {data.internet}
                <span className="screen-reader-only">{t('opens-in-a-new-tab')}</span>
              </a>
              <br />
            </>
          )}
          {t('phone')}:{' '}
          {data.phoneNumber?.map((phone, idx) => {
            const uuid = uniqueId('phone_');
            return (
              <span key={uuid}>
                <PhoneNumber number={phone} primaryColorLink={true} />
                {Number(data.phoneNumber?.length) > idx + 1 ? ', ' : ''}
              </span>
            );
          })}
          {data.fax && (
            <>
              <br />
              {t('fax')}: {data.fax}
            </>
          )}
          <br />
        </p>
      )}
    </>
  );
};
