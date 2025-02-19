import React from 'react';
import { Lang } from '../../../../utils/constants';
import { useTranslation } from 'react-i18next';
import { IonLabel } from '@ionic/react';
import { coordinatesToStringHDM } from '../../../../utils/coordinateUtils';
import { Geometry, LineString } from 'ol/geom';
import { setSelectedPilotageLimit } from '../../../layers';
import { Link } from 'react-router-dom';
import { goToFeature } from '../../../../utils/common';
import { Feature } from 'ol';
import { PilotageLimitFeatureProperties } from '../../../features';

interface PilotageLimitInfoProps {
  pilotLimits: Feature<Geometry>[];
}

export const PilotageLimitInfo: React.FC<PilotageLimitInfoProps> = ({ pilotLimits }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const limitInfoByLang = (idx: number) => {
    switch (lang) {
      case 'fi':
        return pilotLimits[idx].getProperties().raja_fi;
      case 'sv':
        return pilotLimits[idx].getProperties().raja_sv;
      default:
        return pilotLimits[idx].getProperties().raja_en;
    }
  };

  const highlightPilotageLimit = (id?: string | number) => {
    setSelectedPilotageLimit(id);
  };

  return (
    <div>
      {pilotLimits?.map((limit, idx) => {
        const properties = limit.getProperties() as PilotageLimitFeatureProperties;
        const geometry = limit.getGeometry() as LineString;

        const firstCoord = geometry.getFirstCoordinate();
        const lastCoord = geometry.getLastCoordinate();
        return (
          <p key={properties.fid}>
            <IonLabel
              className="hoverText"
              onMouseEnter={() => highlightPilotageLimit(properties.fid)}
              onFocus={() => highlightPilotageLimit(properties.fid)}
              onMouseLeave={() => highlightPilotageLimit(0)}
              onBlur={() => highlightPilotageLimit(0)}
              tabIndex={0}
            >
              <strong>
                {t('pilotageLimit')} {properties.numero}
              </strong>
              <br />
              {t('pilotageLimitLocation')}:{' '}
              <u>
                <Link
                  to={window.location.pathname}
                  onClick={(e) => {
                    e.preventDefault();
                    goToFeature(properties.fid, 'selectedfairwaycard');
                  }}
                >
                  {coordinatesToStringHDM(firstCoord)} - {coordinatesToStringHDM(lastCoord)}
                </Link>
              </u>
              <br />
              {t('pilotageLimitLimit')}:
              <br />
              {t('pilotageLimitDimensions')}
              <br />
              {limitInfoByLang(idx)?.replaceAll('/', ' / ')}
            </IonLabel>
          </p>
        );
      })}
    </div>
  );
};
