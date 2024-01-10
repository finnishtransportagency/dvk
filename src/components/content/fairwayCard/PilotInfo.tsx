import React from 'react';
import { IonLabel, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Pilot } from '../../../graphql/generated';
import { coordinatesToStringHDM } from '../../../utils/coordinateUtils';
import { setSelectedPilotPlace } from '../../layers';
import { Lang, PILOTORDER_URL } from '../../../utils/constants';
import PhoneNumber from './PhoneNumber';
import { useDvkContext } from '../../../hooks/dvkContext';

type PilotInfoProps = {
  data?: Pilot | null;
};

export const PilotInfo: React.FC<PilotInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const highlightPilot = (id: string | number) => {
    setSelectedPilotPlace(id);
  };

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
            {data.places?.map((place, idx) => {
              return (
                <IonLabel
                  key={place.id}
                  className="hoverText"
                  onMouseOver={() => highlightPilot(place.id)}
                  onFocus={() => highlightPilot(place.id)}
                  onMouseOut={() => highlightPilot(0)}
                  onBlur={() => highlightPilot(0)}
                  tabIndex={0}
                  data-testid={idx < 1 ? 'pilotPlaceHover' : ''}
                >
                  {place.geometry?.coordinates && (
                    <>
                      {t('pilotPlace')} {place.name[lang]}:{' '}
                      {place.geometry?.coordinates[0] &&
                        place.geometry?.coordinates[1] &&
                        coordinatesToStringHDM([place.geometry?.coordinates[0], place.geometry.coordinates[1]])}
                      .
                      {place.pilotJourney && (
                        <>
                          {' '}
                          {t('pilotageDistance')}: {place.pilotJourney.toLocaleString()}&nbsp;
                          <dd aria-label={t('unit.nmDesc', { count: place.pilotJourney })}>{t('unit.nm')}</dd>.
                        </>
                      )}
                    </>
                  )}
                </IonLabel>
              );
            })}
            {data.extraInfo && (
              <>
                <br />
                {data.extraInfo[lang]}
              </>
            )}
          </p>
        </IonText>
      )}
    </>
  );
};
