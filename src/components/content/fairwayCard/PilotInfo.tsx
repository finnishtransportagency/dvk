import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Pilot } from '../../../graphql/generated';
import { Lang, PILOTORDER_URL } from '../../../utils/constants';
import PhoneNumber from './PhoneNumber';
import { useDvkContext } from '../../../hooks/dvkContext';
import { PilotPlaceInfo } from './PilotPlaceInfo';

type PilotInfoProps = {
  data?: Pilot | null;
};

export const PilotInfo: React.FC<PilotInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('pilotOrder')}:</strong>
            <br />
            {t('email')}: {data.email && <a href={'mailto:' + data.email}>{data.email}</a>}
            {!data.email && '-'}
            <br />
            {t('orderFrom')}:{' '}
            <a href={'//' + PILOTORDER_URL} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
              {PILOTORDER_URL}
              <span className="screen-reader-only">{t('opens-in-a-new-tab')}</span>
            </a>
            <br />
            <PhoneNumber title={t('phone')} showEmpty number={data.phoneNumber} />
            <br />
            <PhoneNumber title={t('fax')} showEmpty number={data.fax} />
            {data.extraInfo && (
              <>
                <br />
                {data.extraInfo[lang]}
              </>
            )}
          </p>
          <PilotPlaceInfo pilotPlaces={data.places} />
        </IonText>
      )}
    </>
  );
};
