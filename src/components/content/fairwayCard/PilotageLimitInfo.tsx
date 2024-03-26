import React from 'react';
import { Lang, PilotageLimit } from '../../../utils/constants';
import { useTranslation } from 'react-i18next';
import { IonLabel } from '@ionic/react';

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

  return (
    <div>
      {pilotLimits?.map((limit, idx) => {
        return (
          <p key={limit.fid}>
            <IonLabel>
              <strong>
                {t('pilotageLimit')} {limit.numero}
              </strong>
              <br />
              {t('pilotageLimitLocation')}:
              <br />
              {t('pilotageLimitMaxDimensions')}:
              <br />
              {t('length').toLocaleLowerCase()} / {t('width').toLocaleLowerCase()} / {t('draught').toLocaleLowerCase()} (m)
              <br />
              {limitInfoByLang(idx).replaceAll('/', ' / ')}
            </IonLabel>
          </p>
        );
      })}
    </div>
  );
};
