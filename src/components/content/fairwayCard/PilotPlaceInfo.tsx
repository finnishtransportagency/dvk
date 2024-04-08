import React from 'react';
import { IonLabel } from '@ionic/react';
import { coordinatesToStringHDM } from '../../../utils/coordinateUtils';
import { useTranslation } from 'react-i18next';
import { setSelectedPilotPlace } from '../../layers';
import { PilotPlace } from '../../../graphql/generated';
import { Lang } from '../../../utils/constants';

interface PilotPlaceInfoProps {
  pilotPlaces: PilotPlace[] | undefined | null;
}

export const PilotPlaceInfo: React.FC<PilotPlaceInfoProps> = ({ pilotPlaces }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const highlightPilot = (id: string | number) => {
    setSelectedPilotPlace(id);
  };

  return (
    <div>
      {pilotPlaces?.map((place, idx) => {
        return (
          <p key={place.id}>
            <IonLabel
              key={place.id}
              className="hoverText"
              onMouseEnter={() => highlightPilot(place.id)}
              onFocus={() => highlightPilot(place.id)}
              onMouseLeave={() => highlightPilot(0)}
              onBlur={() => highlightPilot(0)}
              tabIndex={0}
              data-testid={idx < 1 ? 'pilotPlaceHover' : ''}
            >
              {place.geometry?.coordinates && (
                <>
                  <strong key={place.id + idx}>
                    {t('pilotPlace')} {place.name[lang]}
                  </strong>
                  <br />
                  {t('pilotPlaceLocation')}:{' '}
                  {place.geometry?.coordinates[0] && place.geometry?.coordinates[1] && (
                    <u>{coordinatesToStringHDM([place.geometry?.coordinates[0], place.geometry.coordinates[1]]).replaceAll('N ', 'N / ')}</u>
                  )}
                  <br />
                  {place.pilotJourney && (
                    <>
                      {' '}
                      {t('pilotageDistance')}: {place.pilotJourney.toLocaleString()}&nbsp;
                      <dd aria-label={t('unit.nmDesc', { count: place.pilotJourney })}>{t('unit.nm')}</dd>
                    </>
                  )}
                </>
              )}
            </IonLabel>
          </p>
        );
      })}
    </div>
  );
};
