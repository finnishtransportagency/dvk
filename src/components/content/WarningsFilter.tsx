import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import sortArrow from '../../theme/img/back_arrow-1.svg';
import './WarningsFilter.css';
import CustomSelectDropdown from './CustomSelectDropdown';

interface WarningFilterProps {
  areaFilter: string[];
  typeFilter: string[];
  setAreaFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setTypeFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setSortNewFirst: React.Dispatch<React.SetStateAction<boolean>>;
  sortNewFirst: boolean;
}

const WarningsFilter: React.FC<WarningFilterProps> = ({ areaFilter, typeFilter, setAreaFilter, setTypeFilter, setSortNewFirst, sortNewFirst }) => {
  const { t } = useTranslation();

  return (
    <div className="warningFilterContainer">
      <IonGrid className="ion-margin-top ion-no-padding">
        <IonRow className="ion-align-items-center ion-justify-content-between">
          <IonCol size="5">
            <IonText className="filterTitle">{t('warnings.area')}</IonText>
            <CustomSelectDropdown triggerId="popover-container-area" selected={areaFilter} setSelected={setAreaFilter} />
          </IonCol>
          <IonCol size="5">
            <IonText className="filterTitle">{t('warnings.type')}</IonText>
            <CustomSelectDropdown triggerId="popover-container-type" selected={typeFilter} setSelected={setTypeFilter} />
          </IonCol>
          <IonCol size="1">
            <button
              id="warningFilterSortButton"
              className="sortingButton"
              onClick={(e) => {
                setSortNewFirst(!sortNewFirst);
                e.preventDefault();
              }}
              title={sortNewFirst ? t('common.sortOldToNew') : t('common.sortNewToOld')}
            >
              <IonIcon className={'sortingIcon ' + (sortNewFirst ? 'flipped' : '')} src={sortArrow} aria-hidden="true" />
            </button>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default WarningsFilter;
