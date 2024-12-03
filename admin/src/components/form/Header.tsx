import React, { useMemo } from 'react';
import { IonButton, IonCol, IonGrid, IonHeader, IonProgressBar, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardInput, FairwayCardOrHarbor, HarborInput, Operation, Status } from '../../graphql/generated';
import { hasUnsavedChanges } from '../../utils/formValidations';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core';
import { ValueType } from '../../utils/constants';
import SelectVersionInput from './SelectVersionInput';
import { SaveType } from '../ConfirmationModal';

interface HeaderProps {
  currentState: FairwayCardInput | HarborInput;
  oldState: FairwayCardInput | HarborInput;
  isLoading: boolean;
  isLoadingMutation: boolean;
  handleCancel: () => void;
  handleSave: () => void;
  handleRemove: () => void;
  handlePreview: () => void;
  handleNewVersion: () => void;
  handlePublish: () => void;
  handleVersionChange: (event: IonSelectCustomEvent<SelectChangeEventDetail<ValueType>>) => void;
  type: SaveType;
  isError?: boolean;
  versions?: FairwayCardOrHarbor[];
}

const Header: React.FC<HeaderProps> = ({
  currentState,
  oldState,
  isLoading,
  isLoadingMutation,
  handleCancel,
  handleSave,
  handleRemove,
  handlePreview,
  handleNewVersion,
  handlePublish,
  handleVersionChange,
  isError,
  versions,
  type,
}) => {
  const { t } = useTranslation();

  const unsavedChanges = useMemo(() => {
    return hasUnsavedChanges(oldState, currentState);
  }, [oldState, currentState]);

  return (
    <IonHeader className="ion-no-border" id="mainPageContent">
      {isLoadingMutation && <IonProgressBar type="indeterminate" />}
      <IonGrid className="optionBar">
        <IonRow className="ion-align-items-end">
          {/* this 'extra' column keeps everything in it's right place */}
          <IonCol />
          <IonCol size="auto" className="ion-no-padding">
            <SelectVersionInput
              handleVersionChange={handleVersionChange}
              versions={versions}
              isError={isError}
              isLoading={isLoading}
              version={currentState.version}
              type={type}
            />
          </IonCol>
          <IonCol size="auto" className="ion-no-padding">
            <IonButton id="cancelButton" shape="round" className="invert" onClick={() => handleCancel()} disabled={isLoading}>
              {t('general.cancel')}
            </IonButton>
          </IonCol>
          <IonCol size="auto" className="ion-no-padding">
            {(currentState.status === Status.Public || currentState.status === Status.Draft) && (
              <IonButton
                id="deleteButton"
                shape="round"
                color="danger"
                disabled={isError || isLoading}
                onClick={() => {
                  handleRemove();
                }}
              >
                {currentState.status === Status.Draft ? t('general.delete') : t('general.archive')}
              </IonButton>
            )}
          </IonCol>
          {currentState.status === Status.Draft && (
            <IonCol size="auto" className="ion-no-padding">
              <IonButton shape="round" disabled={isError || isLoading || currentState.operation === Operation.Create} onClick={() => handlePreview()}>
                {t('general.preview')}
                <span className="screen-reader-only">{t('general.opens-in-a-new-tab')}</span>
              </IonButton>
            </IonCol>
          )}
          {currentState.status === Status.Draft && (
            <>
              <IonCol size="auto" className="ion-no-padding">
                <IonButton id="saveButton" shape="round" disabled={isError || isLoading} onClick={() => handleSave()}>
                  {currentState.operation === Operation.Update || currentState.operation === Operation.Createversion
                    ? t('general.save')
                    : t('general.create-new')}
                </IonButton>
              </IonCol>
              <IonCol size="auto" className="ion-no-padding">
                <IonButton id="publishVersion" shape="round" disabled={isError || isLoading || unsavedChanges} onClick={() => handlePublish()}>
                  {t('general.publish')}
                </IonButton>
              </IonCol>
            </>
          )}
          <IonCol size="auto" className="ion-no-padding">
            <IonButton id="createNewVersion" shape="round" disabled={isError || isLoading} onClick={() => handleNewVersion()}>
              {t('general.create-new-version')}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default Header;
