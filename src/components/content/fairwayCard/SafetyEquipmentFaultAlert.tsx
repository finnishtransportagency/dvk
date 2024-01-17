import React from 'react';
import { IonAccordion, IonAccordionGroup, IonGrid, IonIcon, IonItem, IonLabel } from '@ionic/react';
import arrow_down from '../../../theme/img/arrow_down.svg';
import alertIcon from '../../../theme/img/alert_icon.svg';
import { SafetyEquipmentFault } from '../../../graphql/generated';
import { FaultGroup } from '../SafetyEquipmentFaults';

interface SafetyEquipmentFaultAlertProps {
  data: SafetyEquipmentFault[];
}

export const SafetyEquipmentFaultAlert: React.FC<SafetyEquipmentFaultAlertProps> = ({ data }) => {
  return (
    <IonAccordionGroup expand="compact">
      <IonGrid className="alert danger no-padding">
        <IonAccordion className="equipmentAlert" toggleIcon={arrow_down} value="third">
          <IonItem className="equipmentAlertItem" lines="none" slot="header" color="lightest">
            <IonIcon icon={alertIcon} color="danger" />
            <IonLabel className="equipmentAlertLabel">Väylällä turvalaitevikoja ({data.length})</IonLabel>
          </IonItem>
          <div slot="content">
            <FaultGroup data={data} />
          </div>
        </IonAccordion>
      </IonGrid>
    </IonAccordionGroup>
  );
};
