import { IonLabel, IonBreadcrumbs, IonBreadcrumb } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

type PathItem = {
  title?: string;
  route?: string;
};

type BreadcrumbProps = {
  path: PathItem[];
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ path }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });

  return (
    <IonBreadcrumbs>
      <IonBreadcrumb routerLink="/">
        {t('home')}
        <IonLabel slot="separator">&gt;</IonLabel>
      </IonBreadcrumb>
      {path.map((item, idx) => (
        <IonBreadcrumb key={item.title || 'key' + idx} routerLink={idx < path.length - 1 ? item.route : undefined}>
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
  );
};

export default Breadcrumb;
