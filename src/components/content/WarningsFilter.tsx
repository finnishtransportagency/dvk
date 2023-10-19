import React from 'react';
import { marineWarningAreas } from '../../utils/constants';
import { IonGrid, IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core/dist/types/components';

interface WarningFilterProps {
  setFilter: React.Dispatch<React.SetStateAction<string[]>>;
}

const WarningsFilter: React.FC<WarningFilterProps> = ({ setFilter }) => {
  const marineWarningAreasList = Object.values(marineWarningAreas);

  const handleChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setFilter(event?.detail.value ?? []);
  };

  return (
    <IonGrid>
      <IonItem>
        <IonSelect
          placeholder="Valitse suodatin"
          multiple={true}
          interface="popover"
          fill="outline"
          labelPlacement="stacked"
          onIonChange={(ev) => handleChange(ev)}
        >
          {marineWarningAreasList.slice(0, 10).map((a) => (
            <IonSelectOption key={a.name} value={a.name}>
              {a.name}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      <IonItem>
        <p>haloo</p>
      </IonItem>
    </IonGrid>
  );
};

export default WarningsFilter;
