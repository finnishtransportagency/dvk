import React, { useCallback } from 'react';
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
  widePane?: boolean;
}

export const SafetyEquipmentFaultAlert: React.FC<SafetyEquipmentFaultAlertProps> = ({ data, dataUpdatedAt, widePane }) => {
  // count all unique equipmentIds
  const faultCount = new Set(data.map((o) => o.equipmentId)).size;
  const { t } = useTranslation();
  const alertProps = getAlertProperties(dataUpdatedAt, 'safetyequipmentfault');
  const updatedInfo = t('fairwayCards.faultsDataUpdated') + ' ' + t('fairwayCards.datetimeFormat', { val: dataUpdatedAt });

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps || !alertProps.duration) return t('warnings.faultsLastUpdatedUnknown');
    return t('warnings.faultsLastUpdated', { val: alertProps.duration });
  }, [alertProps, t]);

  return (
    <>
      {alertProps && <Alert icon={alertIcon} color={alertProps.color} className={'top-margin ' + alertProps.color} title={getLayerItemAlertText()} />}
      <IonAccordionGroup expand="compact">
        <IonGrid className="equipmentAlertGrid alert danger">
          <IonAccordion className="equipmentAlert" toggleIcon={arrow_down} value="third">
            <IonItem className={widePane ? 'equipmentAlertWide' : 'equipmentAlertNarrow'} lines="none" slot="header" color="dangerbg">
              <IonIcon className="equipmentAlertIcon" icon={alertIcon} color="danger" />
              <IonLabel className="equipmentAlertLabel">
                {t('warnings.faultsOnFairway')} ({faultCount})
                <br />
                <IonText className="fairwayTitle">
                  <em>{updatedInfo}</em>
                </IonText>
              </IonLabel>
            </IonItem>
            <div className="equipmentAlertContent" slot="content">
              <FaultGroup data={data} />
            </div>
          </IonAccordion>
        </IonGrid>
      </IonAccordionGroup>
    </>
  );
};