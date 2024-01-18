import React from 'react';
import { IonAccordion, IonAccordionGroup, IonGrid, IonIcon, IonItem, IonLabel } from '@ionic/react';
import arrow_down from '../../../theme/img/arrow_down.svg';
import alertIcon from '../../../theme/img/alert_icon.svg';
import { SafetyEquipmentFault } from '../../../graphql/generated';
import { FaultGroup } from '../SafetyEquipmentFaults';

interface SafetyEquipmentFaultAlertProps {
  data: SafetyEquipmentFault[];
  widePane?: boolean;
}

export const SafetyEquipmentFaultAlert: React.FC<SafetyEquipmentFaultAlertProps> = ({ data, widePane }) => {
  return (
    <IonAccordionGroup expand="compact">
      <IonGrid className="alert danger no-padding equipmentAlertGrid">
        <IonAccordion className="equipmentAlert" toggleIcon={arrow_down} value="third">
          <IonItem className={widePane ? 'equipmentAlertWide' : 'equipmentAlertNarrow'} lines="none" slot="header" color="lightest">
            <IonIcon className="equipmentAlertIcon" icon={alertIcon} color="danger" />
            <IonLabel className="equipmentAlertLabel">Väylällä turvalaitevikoja ({data.length})</IonLabel>
          </IonItem>
          <div className="equipmentAlertContent" slot="content">
            <FaultGroup data={data} />
          </div>
        </IonAccordion>
      </IonGrid>
    </IonAccordionGroup>
  );
};
