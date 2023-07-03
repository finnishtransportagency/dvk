import React from 'react';
import { IonCol } from '@ionic/react';
import { MarineWarningModal } from './MarineWarningModal';
import { FeatureLike } from 'ol/Feature';
import { isCoastalWarning } from '../../utils/common';
import { CoastalWarningItem } from './CoastalWarningItem';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  features: FeatureLike[];
}

export const CoastalWarningModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, features = [] }) => {
  const coastalWarningFeatures = features.filter((feature) => isCoastalWarning(feature));

  return (
    <MarineWarningModal isOpen={isOpen} setIsOpen={setIsOpen} className="coastalWarning">
      <IonCol>
        {coastalWarningFeatures.map((feature) => (
          <CoastalWarningItem key={'coastalWarning' + feature.getId()} feature={feature} />
        ))}
      </IonCol>
    </MarineWarningModal>
  );
};
