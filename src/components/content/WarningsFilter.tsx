import React from 'react';
import { marineWarningAreas, marineWarningTypes } from '../../utils/constants';
import { IonGrid, IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core/dist/types/components';
import { useTranslation } from 'react-i18next';

interface WarningFilterProps {
  setAreaFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setTypeFilter: React.Dispatch<React.SetStateAction<string[]>>;
}

const WarningsFilter: React.FC<WarningFilterProps> = ({ setAreaFilter, setTypeFilter }) => {
  const { t } = useTranslation();

  const handleAreaChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setAreaFilter(event?.detail.value ?? []);
  };

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
          {marineWarningAreas.map((area) => (
            <IonSelectOption key={area} value={t(`areas.${area}`)}>
              {t(`areas.${area}`)}
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
          {marineWarningTypes.map((type) => (
            <IonSelectOption key={type} value={t(`homePage.map.controls.layer.${type}`)}>
              {t(`homePage.map.controls.layer.${type}`)}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
    </IonGrid>
  );
};

export default WarningsFilter;
