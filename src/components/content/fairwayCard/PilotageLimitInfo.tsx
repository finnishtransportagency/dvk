import React from 'react';
import { PilotageLimit } from '../../../utils/constants';
import { useTranslation } from 'react-i18next';
import { IonLabel } from '@ionic/react';

interface PilotageLimitInfoProps {
  pilotLimits: PilotageLimit[] | undefined | null;
}

export const PilotageLimitInfo: React.FC<PilotageLimitInfoProps> = ({ pilotLimits }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  console.log(pilotLimits);
  return (
    <p>
      {pilotLimits?.map((limit, idx) => {
        return (
          <>
            <IonLabel key={limit.fid}>
              <strong>
                {t('pilotageLimit')} {limit.numero}
              </strong>
              <br />
              {t('pilotageLimitLocation')}:
              <br />
              {t('pilotageLimitMaxDimensions')}:
              <br />
              {t('length').toLocaleLowerCase()} {t('width').toLocaleLowerCase()} {t('draught').toLocaleLowerCase()} (m)
              <br />
              {limit.raja_fi}
            </IonLabel>
            {idx !== pilotLimits.length - 1 && <p />}
          </>
        );
      })}
    </p>
  );
};
