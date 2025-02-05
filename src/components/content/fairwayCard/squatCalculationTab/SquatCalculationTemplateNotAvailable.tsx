import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import alertIcon from '../../../../theme/img/alert_icon.svg';
import { Link } from 'react-router-dom';
import './SquatCalculationTemplate.css';

const SquatCalculationTemplateNotAvailable: React.FC = () => {
  const { t } = useTranslation();
  const baseClass: string = 'template warning ';
  return (
    <div>
      <IonGrid className={baseClass + 'grid'}>
        <IonRow className={baseClass + 'row'}>
          <IonCol size="1" className={baseClass + 'icon'}>
            <IonIcon aria-hidden src={alertIcon} color="danger" />
          </IonCol>

          <IonCol className={baseClass + 'col'}>
            {t('squattemplates.no-squat-templates')}
            <br />
            <br />
            {t('squattemplates.no-squat-hint')}
            <u>
              <Link to={{ pathname: '/squat/' }}>{t('squattemplates.squat-link')}</Link>
            </u>
            {t('squattemplates.no-squat-hint-post')}.
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default SquatCalculationTemplateNotAvailable;
