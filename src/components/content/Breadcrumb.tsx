import { IonLabel, IonBreadcrumbs, IonBreadcrumb, IonGrid, IonRow, IonCol, IonButton, IonIcon } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { useDvkContext } from '../../hooks/dvkContext';

type PathItem = {
  title?: string;
  route?: string;
  onClick?: () => void;
};

type BreadcrumbProps = {
  path: PathItem[];
};

function getFullItemPath(item: PathItem, preview: boolean) {
  const root = preview ? '/esikatselu' : '/vaylakortti';
  return `${root}${item.route}`;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ path }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const history = useHistory();
  const { state } = useDvkContext();

  const backToHome = () => {
    history.push('/');
  };

  return (
    <IonGrid className="ion-no-padding breadcrumbs">
      <IonRow className="ion-align-items-center">
        <IonCol>
          <IonBreadcrumbs>
            <IonBreadcrumb routerLink="/" disabled={state.preview} aria-disabled={state.preview}>
              {t('home')}
              <IonLabel slot="separator">&gt;</IonLabel>
            </IonBreadcrumb>
            {path.map((item, idx) => (
              <IonBreadcrumb
                disabled={state.preview}
                aria-disabled={state.preview}
                key={item.route || item.title}
                routerLink={idx < path.length - 1 ? item.route : undefined}
                onClick={item.onClick}
                className={item.onClick ? 'ion-activatable ion-focusable' : undefined}
                href={idx < path.length - 1 ? getFullItemPath(item, state.preview) : undefined}
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
          <IonButton
            disabled={state.preview}
            fill="clear"
            className="closeButton"
            title={t('closePane')}
            aria-label={t('closePane')}
            onClick={() => backToHome()}
          >
            <IonIcon className="otherIconLarge" src={closeIcon} />
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default Breadcrumb;
