import React from 'react';
import { IonLabel, IonToggle, type ToggleCustomEvent } from '@ionic/react';

interface ToggleControlProps {
  labelTitle: string;
  labelText: string;
  handleToggle: (checked: boolean) => void;
}

const ToggleControl: React.FC<ToggleControlProps> = ({ labelTitle, labelText, handleToggle }) => {
  return (
    <IonToggle aria-label={labelTitle} labelPlacement="end" onIonChange={(e: ToggleCustomEvent) => handleToggle(e.detail.checked)}>
      <IonLabel className="ion-text-wrap">
        <h1>{labelTitle}</h1>
        <p>{labelText}</p>
      </IonLabel>
    </IonToggle>
  );
};

export default ToggleControl;
