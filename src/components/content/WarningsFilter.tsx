import React from 'react';
import { marineWarningAreas } from '../../utils/constants';
import { IonGrid, IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core/dist/types/components';

interface WarningFilterProps {
  setAreaFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setTypeFilter: React.Dispatch<React.SetStateAction<string[]>>;
}

const WarningsFilter: React.FC<WarningFilterProps> = ({ setAreaFilter, setTypeFilter }) => {
  const warningAreaList = Object.values(marineWarningAreas);
  const warningTypeList = ['COASTAL WARNING', 'LOCAL WARNING', 'Varoituksia veneilijöille'];

  const handleAreaChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setAreaFilter(event?.detail.value ?? []);
  };
  console.log(warningAreaList);
  const handleTypeChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setTypeFilter(event?.detail.value ?? []);
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
          onIonChange={(ev) => handleAreaChange(ev)}
        >
          {warningAreaList.slice(0, 10).map((a) => (
            <IonSelectOption key={a.name} value={a.name}>
              {a.name}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonSelect
          placeholder="Valitse suodatin"
          multiple={true}
          interface="popover"
          fill="outline"
          labelPlacement="stacked"
          onIonChange={(ev) => handleTypeChange(ev)}
        >
          {warningTypeList.map((t) => (
            <IonSelectOption key={t} value={t}>
              {t}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
    </IonGrid>
  );
};

export default WarningsFilter;
