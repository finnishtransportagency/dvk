import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from './Breadcrumb';
import { APP_CONFIG_PREVIEW } from '../../utils/constants';

interface SquatCalculatorProps {
  widePane?: boolean;
}

const SquatCalculator: React.FC<SquatCalculatorProps> = ({ widePane }) => {
  const { t } = useTranslation();
  const path = [{ title: t('common.squat') }];

  const Squat = lazy(() => import('./Squat'));

  return (
    <>
      <Breadcrumb path={path} />
      {VITE_APP_CONFIG !== APP_CONFIG_PREVIEW && (
        <Suspense fallback={<></>}>
          <Squat widePane={widePane} />
        </Suspense>
      )}
    </>
  );
};

export default SquatCalculator;
