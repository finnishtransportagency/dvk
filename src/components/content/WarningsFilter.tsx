import React from 'react';
import { marineWarningTypes } from '../../utils/constants';
import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonRow, IonSelect, IonSelectOption, IonText } from '@ionic/react';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core/dist/types/components';
import { useTranslation } from 'react-i18next';
import sortArrow from '../../theme/img/back_arrow-1.svg';
import './WarningsFilter.css';
import CustomSelectDropdown from './CustomSelectDropdown';

interface WarningFilterProps {
  areaFilter: string[];
  setAreaFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setTypeFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setSortNewFirst: React.Dispatch<React.SetStateAction<boolean>>;
  sortNewFirst: boolean;
}

const WarningsFilter: React.FC<WarningFilterProps> = ({ areaFilter, setAreaFilter, setTypeFilter, setSortNewFirst, sortNewFirst }) => {
  const { t } = useTranslation();

  /*const handleAreaChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setAreaFilter(event?.detail.value ?? []);
    event?.preventDefault();
  };*/

  const handleTypeChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setTypeFilter(event?.detail.value ?? []);
    event?.preventDefault();
  };

  return (
    <div className="warningFilterContainer">
      <IonGrid className="ion-margin-top ion-no-padding">
        <IonRow className="ion-align-items-center ion-justify-content-between">
          <IonCol size="5">
            <IonText className="filterTitle">{t('warnings.area')}</IonText>
            <CustomSelectDropdown selected={areaFilter} setSelected={setAreaFilter} />
          </IonCol>
          <IonCol size="5">
            <IonText className="filterTitle">{t('warnings.type')}</IonText>
            <IonItem className="filterSelectInput" lines="none">
              <IonSelect
                placeholder={t('common.filter')}
                multiple={true}
                interface="popover"
                interfaceOptions={{
                  size: 'cover',
                  className: 'customSelect',
                }}
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
          </IonCol>
          <IonCol size="1">
            <IonButton
              className="sortingButton"
              fill="clear"
              size="small"
              onClick={(e) => {
                setSortNewFirst(!sortNewFirst);
                e.preventDefault();
              }}
              title={sortNewFirst ? t('common.sortOldToNew') : t('common.sortNewToOld')}
            >
              <IonIcon slot="icon-only" className={'sortingIcon ' + (sortNewFirst ? 'flipped' : '')} src={sortArrow} />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default WarningsFilter;
