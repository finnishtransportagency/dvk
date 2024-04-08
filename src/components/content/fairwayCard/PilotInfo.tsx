import React, { useEffect, useState } from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Fairway, Pilot } from '../../../graphql/generated';
import { Lang, PILOTORDER_URL } from '../../../utils/constants';
import PhoneNumber from './PhoneNumber';
import { useDvkContext } from '../../../hooks/dvkContext';
import { PilotPlaceInfo } from './PilotPlaceInfo';
import { getPilotageLimitsByFairways } from '../../../utils/fairwayCardUtils';
import { PilotageLimitInfo } from './PilotageLimitInfo';
import { Geometry } from 'ol/geom';

type PilotInfoProps = {
  fairways: Fairway[];
  data?: Pilot | null;
};

export type PilotageLimit = {
  numero: number;
  fid?: number;
  liittyyVayliin?: string;
  raja_fi?: string;
  raja_sv?: string;
  raja_en?: string;
  koordinaatit?: Geometry;
};

export const PilotInfo: React.FC<PilotInfoProps> = ({ fairways, data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();
  const [pilotageLimits, setPilotageLimits] = useState<PilotageLimit[]>([]);

  useEffect(() => {
    setPilotageLimits(getPilotageLimitsByFairways(fairways));
  }, [fairways]);

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
          <PilotageLimitInfo pilotLimits={pilotageLimits} />
        </IonText>
      )}
    </>
  );
};
