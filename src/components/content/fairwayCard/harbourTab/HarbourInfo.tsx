import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { HarborPartsFragment } from '../../../../graphql/generated';
import { setSelectedHarbor } from '../../../layers';
import { Lang } from '../../../../utils/constants';
import { InfoParagraph } from '../../Paragraph';
import { QuayInfo } from './QuayInfo';
import { ContactInfo } from './ContactInfo';

type HarbourInfoProps = {
  data?: HarborPartsFragment | null;
  isLast?: boolean;
};

export const HarbourInfo: React.FC<HarbourInfoProps> = ({ data, isLast }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const highlightHarbor = (id: string, selected: boolean) => {
    setSelectedHarbor(id, selected);
  };

  return (
    <>
      {data && (
        <>
          <IonText
            className="no-margin-top"
            onMouseEnter={() => highlightHarbor(data.id, true)}
            onFocus={() => highlightHarbor(data.id, true)}
            onMouseLeave={() => highlightHarbor(data.id, false)}
            onBlur={() => highlightHarbor(data.id, false)}
            data-testid="restrictions"
          >
            <h4>
              <strong>{data.name?.[lang]}</strong>
            </h4>
            <h5>{t('restrictions')}</h5>
            {(data.extraInfo && <p>{data.extraInfo[lang]}</p>) || <InfoParagraph title={t('noRestrictions')} />}
          </IonText>
          <IonText>
            <h5>{t('quays')}</h5>
            <div className="printGrid">{(data.quays && <QuayInfo data={data?.quays} />) || <InfoParagraph />}</div>
          </IonText>
          <IonText data-testid="cargo">
            <h5>{t('cargo')}</h5>
            {(data.cargo && <p>{data.cargo[lang]}</p>) || <InfoParagraph />}
          </IonText>
          <IonText data-testid="harbourBasin">
            <h5>{t('harbourBasin')}</h5>
            {(data.harborBasin && <p>{data.harborBasin[lang]}</p>) || <InfoParagraph />}
          </IonText>
          <IonText data-testid="contactDetails">
            <h5>{t('contactDetails')}</h5>
            <ContactInfo data={data} noMargin={isLast} />
          </IonText>
        </>
      )}
    </>
  );
};
