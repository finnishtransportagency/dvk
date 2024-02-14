import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { APP_CONFIG_PREVIEW } from '../../utils/constants';
import { IonSkeletonText } from '@ionic/react';
import './SquatCalculator.css';

interface SquatCalculatorProps {
  widePane?: boolean;
}

const SquatSkeleton: React.FC<SquatCalculatorProps> = () => {
  return (
    <>
      <IonSkeletonText animated={true} className="squatHeader ion-margin-top" />
      <IonSkeletonText animated={true} className="squatLink" />
      <IonSkeletonText animated={true} className="squatContent ion-margin-top" />
    </>
  );
};

const SquatCalculator: React.FC<SquatCalculatorProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const path = [{ title: t('common.squat') }];

  const Squat = lazy(() => import('./Squat'));

  return (
    <div data-testid="squatCalculatorContent">
      <Breadcrumb path={path} />
      {VITE_APP_CONFIG !== APP_CONFIG_PREVIEW && (
        <Suspense fallback={<SquatSkeleton />}>
          <Squat widePane={widePane} />
        </Suspense>
      )}
    </div>
  );
};

export default SquatCalculator;
