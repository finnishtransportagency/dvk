import React from 'react';
import { marineWarningAreas, marineWarningTypes } from '../../utils/constants';
import { IonButton, IonCol, IonIcon, IonRow, IonSelect, IonSelectOption, IonText } from '@ionic/react';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core/dist/types/components';
import { useTranslation } from 'react-i18next';
import sort_arrow from '../../theme/img/back_arrow-1.svg';

interface WarningFilterProps {
  setAreaFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setTypeFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setSortNewFirst: React.Dispatch<React.SetStateAction<boolean>>;
  sortNewFirst: boolean;
  widePane?: boolean;
}

const WarningsFilter: React.FC<WarningFilterProps> = ({ setAreaFilter, setTypeFilter, setSortNewFirst, sortNewFirst, widePane }) => {
  const { t } = useTranslation();

  const handleAreaChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setAreaFilter(event?.detail.value ?? []);
  };

  const handleTypeChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setTypeFilter(event?.detail.value ?? []);
  };

  const handleSort = () => {
    setSortNewFirst(!sortNewFirst);
  };

  return (
    <IonRow id="customRow">
      <IonCol>
        <IonText className="filterTitle">{t('warnings.area')}</IonText>
        <IonSelect
          className={widePane ? 'marineWarningSelectWide rightMargin' : 'marineWarningSelectNarrow rightMargin'}
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
      </IonCol>
      <IonCol>
        <IonText className="filterTitle">{t('warnings.type')}</IonText>
        <IonSelect
          className={widePane ? 'marineWarningSelectWide' : 'marineWarningSelectNarrow'}
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
      </IonCol>
      <IonCol>
        <IonButton id="sortingButton" fill="clear" onClick={handleSort}>
          <IonIcon id="sortingIcon" className={sortNewFirst ? '' : 'flipped'} src={sort_arrow} />
        </IonButton>
      </IonCol>
    </IonRow>
  );
};

export default WarningsFilter;
