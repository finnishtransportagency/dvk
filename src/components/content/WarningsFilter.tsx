import React from 'react';
import { marineWarningAreas, marineWarningTypes } from '../../utils/constants';
import { IonButton, IonCol, IonIcon, IonRow, IonSelect, IonSelectOption, IonText } from '@ionic/react';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core/dist/types/components';
import { useTranslation } from 'react-i18next';
import sortArrow from '../../theme/img/back_arrow-1.svg';
import '../../../admin/src/theme/dvk.css';

interface WarningFilterProps {
  setAreaFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setTypeFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setSortNewFirst: React.Dispatch<React.SetStateAction<boolean>>;
  sortNewFirst: boolean;
  widePane?: boolean;
}

const WarningsFilter: React.FC<WarningFilterProps> = ({ setAreaFilter, setTypeFilter, setSortNewFirst, sortNewFirst, widePane }) => {
  const { t } = useTranslation();
  console.log(widePane);
  const handleAreaChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setAreaFilter(event?.detail.value ?? []);
    event?.preventDefault();
  };

  const handleTypeChange = (event?: IonSelectCustomEvent<SelectChangeEventDetail<string[]>>) => {
    setTypeFilter(event?.detail.value ?? []);
    event?.preventDefault();
  };

  return (
    <IonRow id="customRow">
      <IonCol>
        <IonText className="filterTitle">{t('warnings.area')}</IonText>
        {/*<IonItem className="filterSelectInput rightMargin">*/}
        <IonSelect
          className={widePane ? 'marineWarningSelectWide rightMargin' : 'marineWarningSelectNarrow rightMargin'}
          placeholder={t('common.filter')}
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
        {/*</IonItem>*/}
      </IonCol>
      <IonCol>
        <IonText className="filterTitle">{t('warnings.type')}</IonText>
        {/*<IonItem className="filterSelectInput rightMargin">*/}
        <IonSelect
          className={widePane ? 'marineWarningSelectWide' : 'marineWarningSelectNarrow'}
          placeholder={t('common.filter')}
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
        {/*</IonItem>*/}
      </IonCol>
      <IonCol>
        <IonButton
          id="sortingButton"
          fill="clear"
          onClick={(e) => {
            setSortNewFirst(!sortNewFirst);
            e.preventDefault();
          }}
        >
          <IonIcon id="sortingIcon" className={sortNewFirst ? '' : 'flipped'} src={sortArrow} />
        </IonButton>
      </IonCol>
    </IonRow>
  );
};

export default WarningsFilter;
