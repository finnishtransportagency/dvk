import React from 'react';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { MareographFeatureProperties } from '../../features';
import { IonLabel } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface MareographInfoProps {
  mareographs: Feature<Geometry>[];
}

const MareographInfo: React.FC<MareographInfoProps> = ({ mareographs }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const highlightMareograph = (id?: string | number) => {
    console.log(id);
  };

  return (
    <p>
      <strong>{t('seaLevel')}:</strong>
      {mareographs?.map((mareograph) => {
        const properties = mareograph.getProperties() as MareographFeatureProperties;
        const id = mareograph.getId();
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
            </IonLabel>
          </p>
        );
      })}
    </p>
  );
};

export default MareographInfo;
