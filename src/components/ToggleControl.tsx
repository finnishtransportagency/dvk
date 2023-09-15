import React from 'react';
import { IonLabel, IonToggle, type ToggleCustomEvent } from '@ionic/react';
import './ToggleControl.css';

interface ToggleControlProps {
  checked: boolean;
  labelTitle: string;
  labelText: string;
  handleToggle: (checked: boolean) => void;
}

const ToggleControl: React.FC<ToggleControlProps> = ({ checked, labelTitle, labelText, handleToggle }) => {
  return (
    <IonToggle aria-label={labelTitle} checked={checked} labelPlacement="end" onIonChange={(e: ToggleCustomEvent) => handleToggle(e.detail.checked)}>
      <IonLabel className="ion-text-wrap toggle-label">
        <h2>{labelTitle}</h2>
        <p>{labelText}</p>
      </IonLabel>
    </IonToggle>
  );
};

export default ToggleControl;
