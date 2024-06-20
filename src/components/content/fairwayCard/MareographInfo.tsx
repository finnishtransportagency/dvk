import React from 'react';
import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import { MareographFeatureProperties } from '../../features';
import { IonLabel } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { goToFeature } from '../../../utils/common';
import { coordinatesToStringHDM } from '../../../utils/coordinateUtils';

interface MareographInfoProps {
  mareographs: Feature<Geometry>[];
}

const MareographInfo: React.FC<MareographInfoProps> = ({ mareographs }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const highlightMareograph = (id?: string | number) => {
    console.log(id);
  };

  return (
    <>
      <div className="mareographsTitle">
        <strong>{t('seaLevel')}:</strong>
      </div>
      {mareographs?.map((mareograph) => {
        const properties = mareograph.getProperties() as MareographFeatureProperties;
        const id = mareograph.getId();
        const geometry = mareograph.getGeometry() as Point;

        const coordinates = geometry.getCoordinates();
        return (
          <p key={id}>
            <IonLabel
              className="hoverText"
              onMouseEnter={() => highlightMareograph(id)}
              onFocus={() => highlightMareograph(id)}
              onMouseLeave={() => highlightMareograph(0)}
              onBlurCapture={() => highlightMareograph(0)}
              tabIndex={0}
            >
              <strong>
                {properties.name} - {t('mareograph')}
              </strong>
              <br />
              {t('mareographLocation')}:&nbsp;
              {!!coordinates[0] && !!coordinates[1] && (
                <u>
                  <Link
                    to={window.location.pathname}
                    onClick={(e) => {
                      e.preventDefault();
                      goToFeature(id, 'selectedfairwaycard');
                    }}
                  >
                    {coordinatesToStringHDM(coordinates)}
                  </Link>
                </u>
              )}
            </IonLabel>
          </p>
        );
      })}
    </>
  );
};

export default MareographInfo;
