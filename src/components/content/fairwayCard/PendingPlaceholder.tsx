import { IonText, IonBreadcrumbs, IonSkeletonText } from '@ionic/react';
import React from 'react';

interface PendingPlaceholderProps {
  widePane?: boolean;
}

const PendingPlaceholder: React.FC<PendingPlaceholderProps> = ({ widePane }) => {
  return (
    <>
      <IonBreadcrumbs>
        <IonSkeletonText animated={true} style={{ width: '100%', height: widePane ? '24px' : '48px', margin: '0' }}></IonSkeletonText>
      </IonBreadcrumbs>
      <IonText className="fairwayTitle">
        <h2 className="no-margin-bottom">
          <IonSkeletonText animated={true} style={{ width: '100%', height: '30px' }}></IonSkeletonText>
        </h2>
        <IonSkeletonText animated={true} style={{ width: '150px', height: '14px', margin: '0' }}></IonSkeletonText>
      </IonText>
      <IonSkeletonText animated={true} style={{ width: '100%', height: '50px', marginTop: '20px' }}></IonSkeletonText>
      <IonSkeletonText animated={true} style={{ width: '100%', height: '50vh', marginTop: '20px' }}></IonSkeletonText>
    </>
  );
};

export default PendingPlaceholder;
