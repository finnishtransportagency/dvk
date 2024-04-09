import React from 'react';
import { Lang } from '../../../utils/constants';
import { useTranslation } from 'react-i18next';
import { IonLabel } from '@ionic/react';
import { PilotageLimit } from './PilotInfo';
import { coordinatesToStringHDM } from '../../../utils/coordinateUtils';
import { LineString } from 'ol/geom';
import { setSelectedPilotageLimit } from '../../layers';
import { Link } from 'react-router-dom';
import { goToFeature } from '../../../utils/common';

interface PilotageLimitInfoProps {
  pilotLimits: PilotageLimit[];
}

export const PilotageLimitInfo: React.FC<PilotageLimitInfoProps> = ({ pilotLimits }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const limitInfoByLang = (idx: number) => {
    switch (lang) {
      case 'fi':
        return pilotLimits[idx].raja_fi;
      case 'sv':
        return pilotLimits[idx].raja_sv;
      default:
        return pilotLimits[idx].raja_en;
    }
  };

  const highlightPilotageLimit = (id?: string | number) => {
    setSelectedPilotageLimit(id);
  };

  return (
    <div>
      {pilotLimits?.map((limit, idx) => {
        const firstCoord = (limit.koordinaatit as LineString).getFirstCoordinate();
        const lastCoord = (limit.koordinaatit as LineString).getLastCoordinate();
        return (
          <p key={limit.fid}>
            <IonLabel
              key={limit.fid}
              className="hoverText"
              onMouseEnter={() => highlightPilotageLimit(limit.fid)}
              onFocus={() => highlightPilotageLimit(limit.fid)}
              onMouseLeave={() => highlightPilotageLimit(0)}
              onBlur={() => highlightPilotageLimit(0)}
              tabIndex={0}
            >
              <strong>
                {t('pilotageLimit')} {limit.numero}
              </strong>
              <br />
              {t('pilotageLimitLocation')}:{' '}
              <u>
                <Link
                  to={window.location.pathname}
                  onClick={(e) => {
                    e.preventDefault();
                    goToFeature(limit.fid, 'selectedfairwaycard');
                  }}
                >
                  {coordinatesToStringHDM(firstCoord).replace('N ', 'N / ')} - {' ' + coordinatesToStringHDM(lastCoord).replace('N ', 'N / ')}
                </Link>
              </u>
              <br />
              {t('pilotageLimitMaxDimensions')}:
              <br />
              {t('length').toLocaleLowerCase()} / {t('width').toLocaleLowerCase()} / {t('draught').toLocaleLowerCase()} (m)
              <br />
              {limitInfoByLang(idx)?.replaceAll('/', ' / ')}
            </IonLabel>
          </p>
        );
      })}
    </div>
  );
};
