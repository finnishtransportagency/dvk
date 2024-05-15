import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Pilot } from '../../../graphql/generated';
import { Lang, PILOTORDER_URL } from '../../../utils/constants';
import PhoneNumber from './PhoneNumber';
import { useDvkContext } from '../../../hooks/dvkContext';
import { PilotPlaceInfo } from './PilotPlaceInfo';
import { PilotageLimitInfo } from './PilotageLimitInfo';
import { Geometry } from 'ol/geom';
import { Feature } from 'ol';

type PilotInfoProps = {
  pilotageLimits?: Feature<Geometry>[];
  pilot?: Pilot | null;
};

export const PilotInfo: React.FC<PilotInfoProps> = ({ pilotageLimits, pilot }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  return (
    <>
      {pilot && (
        <IonText>
          <p>
            <strong>{t('pilotOrder')}:</strong>
            <br />
            {t('email')}:&nbsp;
            {pilot.email && (
              <a href={'mailto:' + pilot.email} className="primaryColorLink">
                {pilot.email}
              </a>
            )}
            {!pilot.email && '-'}
            <br />
            {t('orderFrom')}:{' '}
            <a href={'//' + PILOTORDER_URL} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
              {PILOTORDER_URL}
              <span className="screen-reader-only">{t('opens-in-a-new-tab')}</span>
            </a>
            <br />
            <PhoneNumber title={t('phone')} showEmpty number={pilot.phoneNumber} primaryColorLink={true} />
            <br />
            {t('fax')}: {pilot.fax || '-'}
            {pilot.extraInfo && (
              <>
                <br />
                {pilot.extraInfo[lang]}
              </>
            )}
          </p>
          <PilotPlaceInfo pilotPlaces={pilot.places} />
          <PilotageLimitInfo pilotLimits={pilotageLimits ?? []} />
        </IonText>
      )}
    </>
  );
};
