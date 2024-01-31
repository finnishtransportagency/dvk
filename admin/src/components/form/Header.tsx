import React from 'react';
import { IonButton, IonCol, IonGrid, IonHeader, IonProgressBar, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Operation, Status } from '../../graphql/generated';
import SelectInput from './SelectInput';
import { ValueType, ActionType, Lang } from '../../utils/constants';

interface HeaderProps {
  operation: Operation;
  status: Status;
  oldStatus: Status;
  isLoading: boolean;
  isLoadingMutation: boolean;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  handleSubmit: (isRemove: boolean) => void;
  handleCancel: () => void;
  handlePreview: () => void;
  modifiedInfo: string;
  modifierInfo: string;
  isError?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  operation,
  status,
  oldStatus,
  isLoading,
  isLoadingMutation,
  updateState,
  handleSubmit,
  handleCancel,
  handlePreview,
  modifiedInfo,
  modifierInfo,
  isError,
}) => {
  const { t } = useTranslation();

  const statusOptions = [
    { name: { fi: t('general.item-status-' + Status.Draft) }, id: Status.Draft },
    { name: { fi: t('general.item-status-' + Status.Public) }, id: Status.Public },
  ];
  if (operation === Operation.Update) statusOptions.push({ name: { fi: t('general.item-status-' + Status.Removed) }, id: Status.Removed });

  return (
    <IonHeader className="ion-no-border" id="mainPageContent">
      {isLoadingMutation && <IonProgressBar type="indeterminate" />}
      <IonGrid className="optionBar">
        <IonRow className="ion-align-items-end">
          <IonCol className="align-right">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol>
                  <IonText>
                    <em>
                      {operation === Operation.Update ? t('general.item-modified') : t('general.item-created')}: {modifiedInfo}
                      <br />
                      {operation === Operation.Update ? t('general.item-modifier') : t('general.item-creator')}: {modifierInfo}
                    </em>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCol>
          <IonCol size="auto">
            <SelectInput
              label={t('general.item-status')}
              selected={status}
              options={statusOptions}
              setSelected={updateState}
              actionType="status"
              disabled={isLoading}
            />
          </IonCol>
          <IonCol size="auto">
            <IonButton id="cancelButton" shape="round" className="invert" onClick={() => handleCancel()} disabled={isLoading}>
              {t('general.cancel')}
            </IonButton>
            {operation === Operation.Update && oldStatus !== Status.Removed && (
              <IonButton
                id="deleteButton"
                shape="round"
                color="danger"
                disabled={isError || isLoading}
                onClick={() => {
                  handleSubmit(true);
                }}
              >
                {t('general.delete')}
              </IonButton>
            )}
            {status !== Status.Removed && (
              <IonButton shape="round" disabled={isError || isLoading || operation === Operation.Create} onClick={() => handlePreview()}>
                {t('general.preview')}
                <span className="screen-reader-only">{t('general.opens-in-a-new-tab')}</span>
              </IonButton>
            )}
            <IonButton id="saveButton" shape="round" disabled={isError || isLoading} onClick={() => handleSubmit(status === Status.Removed)}>
              {operation === Operation.Update ? t('general.save') : t('general.create-new')}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default Header;
