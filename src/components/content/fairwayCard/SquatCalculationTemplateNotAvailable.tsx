import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import alertIcon from '../../../theme/img/alert_icon.svg';
import { Link } from 'react-router-dom';
import './SquatCalculationTemplate.css';

export type WidePaneOptions = {
  widePane: boolean | undefined;
};

const SquatCalculationTemplateNotAvailable: React.FC<WidePaneOptions> = ({ widePane = false }) => {
  const { t } = useTranslation();
  const baseClass: string = 'template warning ';

  return (
    <div>
      <IonGrid className={baseClass + 'grid' + (widePane ? ' wide' : '')}>
        <IonRow className={baseClass + 'row'}>
          <IonCol size="1" className={baseClass + 'icon'}>
            <IonIcon aria-hidden src={alertIcon} color="danger" />
          </IonCol>

          <IonCol className={baseClass + 'col'}>
            {t('squattemplates.no-squat-templates')}
            <br />
            <br />
            {t('squattemplates.no-squat-hint')} &nbsp;
            <u>
              <Link to={'/squat'}>{t('squattemplates.squat-link')}</Link>.
            </u>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default SquatCalculationTemplateNotAvailable;
