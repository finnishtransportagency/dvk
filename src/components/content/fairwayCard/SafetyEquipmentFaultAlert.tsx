import React, { useCallback, useEffect, useRef } from 'react';
import { IonAccordion, IonAccordionGroup, IonGrid, IonIcon, IonItem, IonLabel, IonText } from '@ionic/react';
import arrow_down from '../../../theme/img/arrow_down.svg';
import alertIcon from '../../../theme/img/alert_icon.svg';
import { SafetyEquipmentFault } from '../../../graphql/generated';
import { FaultGroup } from '../SafetyEquipmentFaults';
import { getAlertProperties } from '../../../utils/common';
import { useTranslation } from 'react-i18next';
import Alert from '../../Alert';
import './SafetyEquipmentFaultAlert.css';

interface SafetyEquipmentFaultAlertProps {
  data: SafetyEquipmentFault[];
  dataUpdatedAt: number;
  isPending: boolean;
  widePane?: boolean;
}

export const SafetyEquipmentFaultAlert: React.FC<SafetyEquipmentFaultAlertProps> = ({ data, dataUpdatedAt, isPending, widePane }) => {
  // count all unique equipmentIds
  const faultCount = new Set(data.map((o) => o.equipmentId)).size;
  const { t } = useTranslation();
  const alertProps = getAlertProperties(dataUpdatedAt, 'safetyequipmentfault');
  const updatedInfo = t('fairwayCards.faultsDataUpdated') + ' ' + t('fairwayCards.datetimeFormat', { val: dataUpdatedAt });

  const gridRef = useRef<HTMLIonGridElement>(null);
  const headerRef = useRef<HTMLIonItemElement>(null);

  const getLayerItemAlertText = useCallback(() => {
    return alertProps?.duration ? t('warnings.faultsLastUpdated', { val: alertProps.duration }) : t('warnings.faultsLastUpdatedUnknown');
  }, [alertProps, t]);

  useEffect(() => {
    const grid = gridRef.current as HTMLElement;
    const header = headerRef.current as HTMLElement;

    if (grid && header) {
      setTimeout(() => {
        const gridWidth = grid.offsetWidth;
        header.style.width = String(gridWidth) + 'px';
      }, 300);
    }
  }, [widePane]);

  return (
    <>
      {alertProps && <Alert icon={alertIcon} color={alertProps.color} className={'top-margin ' + alertProps.color} title={getLayerItemAlertText()} />}
      <IonAccordionGroup expand="compact">
        <IonGrid ref={gridRef} className="equipmentAlertGrid alert danger">
          <IonAccordion className="equipmentAlert" toggleIcon={arrow_down} value="third">
            <IonItem ref={headerRef} lines="none" slot="header" color="dangerbg">
              <IonIcon className="equipmentAlertIcon" icon={alertIcon} color="danger" aria-hidden="true" />
              <IonLabel className="equipmentAlertLabel">
                {t('warnings.faultsOnFairway')} ({faultCount})
                <br />
                <IonText className="fairwayTitle">
                  <em>{updatedInfo}</em>
                </IonText>
              </IonLabel>
            </IonItem>
            <div className="equipmentAlertContent" slot="content">
              <div id="equipmentFaultList" className={'equipmentTabContent active show-print' + (widePane ? ' wide' : '')}>
                <FaultGroup data={data} loading={isPending} selectedFairwayCard={true} />
              </div>
            </div>
          </IonAccordion>
        </IonGrid>
      </IonAccordionGroup>
    </>
  );
};
