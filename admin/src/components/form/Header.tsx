import React from 'react';
import { IonButton, IonCol, IonGrid, IonHeader, IonProgressBar, IonRow } from '@ionic/react';
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
  createNewVersion: () => void;
  publishVersion: () => void;
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
  createNewVersion,
  publishVersion,
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
          {/* this 'extra' column keeps everything in it's right place */}
          <IonCol className="align-right" />
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
            {(operation === Operation.Update || operation === Operation.Createversion) && oldStatus !== Status.Removed && (
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
            {status !== Status.Removed && status !== Status.Archived && (
              <IonButton shape="round" disabled={isError || isLoading || operation === Operation.Create} onClick={() => handlePreview()}>
                {t('general.preview')}
                <span className="screen-reader-only">{t('general.opens-in-a-new-tab')}</span>
              </IonButton>
            )}
            {status === Status.Public ? (
              <>
                {/* <IonButton id="publishingDetails" shape="round" disabled={isError || isLoading}>
                  {t('general.publishing-details')}
                </IonButton> */}
                <IonButton id="createNewVersion" shape="round" disabled={isError || isLoading} onClick={() => createNewVersion()}>
                  {t('general.create-new-version')}
                </IonButton>
              </>
            ) : (
              <IonButton id="saveButton" shape="round" disabled={isError || isLoading} onClick={() => handleSubmit(status === Status.Removed)}>
                {operation === Operation.Update || operation === Operation.Createversion ? t('general.save') : t('general.create-new')}
              </IonButton>
            )}
            {status === Status.Draft && (
              <IonButton id="publishVersion" shape="round" disabled={isError || isLoading} onClick={() => publishVersion()}>
                {t('general.publish')}
              </IonButton>
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default Header;
