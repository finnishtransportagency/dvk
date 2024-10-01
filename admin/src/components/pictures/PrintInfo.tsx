import React from 'react';
import { Orientation } from '../../graphql/generated';
import { useTranslation } from 'react-i18next';
import Alert from '../Alert';

interface PrintInfoProps {
  orientation: Orientation;
  isFull?: boolean;
}

export const PrintInfo: React.FC<PrintInfoProps> = ({ orientation, isFull }) => {
  const { t } = useTranslation();

  return (
    <Alert
      alertType="info"
      text={
        (isFull ? t('fairwaycard.print-images-info-ingress-1-' + orientation) + ' ' : '') +
        t('fairwaycard.print-images-info-ingress-2-' + orientation)
      }
      extraClass="printInfo"
    >
      <ol>
        <li>
          {t('fairwaycard.print-images-info-switch')} <span className={'icon orientation-' + orientation} />{' '}
          {t('fairwaycard.print-images-info-select-' + orientation)}
        </li>
        <li>
          {t('fairwaycard.print-images-info-select-layers')} <span className="icon layers" />{' '}
          {t('fairwaycard.print-images-info-select-layers-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-position-map')} {t('fairwaycard.print-images-info-target-by-features')} <span className="icon target" />{' '}
          {t('fairwaycard.print-images-info-target-by-features-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-take-image')} <span className="icon takeScreenshot" />{' '}
          {t('fairwaycard.print-images-info-set-image-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-select-image')} <span className="icon select-image" />{' '}
          {t('fairwaycard.print-images-info-select-image-button')}
        </li>
        <li>
          {t('fairwaycard.print-images-info-upload-image')} <span className="icon uploadPicture" />{' '}
          {orientation === Orientation.Portrait
            ? t('fairwaycard.print-images-info-upload-image-button-portrait')
            : t('fairwaycard.print-images-info-upload-image-button-landscape')}
        </li>
      </ol>
    </Alert>
  );
};
