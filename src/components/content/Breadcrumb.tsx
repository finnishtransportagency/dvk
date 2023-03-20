import { IonLabel, IonBreadcrumbs, IonBreadcrumb, IonGrid, IonRow, IonCol, IonButton, IonIcon } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

type PathItem = {
  title?: string;
  route?: string;
  onClick?: () => void;
};

type BreadcrumbProps = {
  path: PathItem[];
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ path }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const history = useHistory();

  const backToHome = () => {
    history.push('/');
  };

  return (
    <IonGrid className="ion-no-padding breadcrumbs">
      <IonRow className="ion-align-items-center">
        <IonCol>
          <IonBreadcrumbs>
            <IonBreadcrumb routerLink="/">
              {t('home')}
              <IonLabel slot="separator">&gt;</IonLabel>
            </IonBreadcrumb>
            {path.map((item, idx) => (
              <IonBreadcrumb
                key={item.route || item.title}
                routerLink={idx < path.length - 1 ? item.route : undefined}
                onClick={item.onClick}
                className={item.onClick ? 'ion-activatable ion-focusable' : undefined}
              >
                {idx < path.length - 1 && (
                  <>
                    {item.title}
                    <IonLabel slot="separator">&gt;</IonLabel>
                  </>
                )}
                {idx === path.length - 1 && <strong>{item.title}</strong>}
              </IonBreadcrumb>
            ))}
          </IonBreadcrumbs>
        </IonCol>
        <IonCol size="auto">
          <IonButton fill="clear" className="closeButton" title={t('closePane')} aria-label={t('closePane')} onClick={() => backToHome()}>
            <IonIcon className="otherIconLarge" src="assets/icon/close_black_24dp.svg" />
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default Breadcrumb;
