import React, { useMemo } from 'react';
import { IonButton, IonCol, IonGrid, IonHeader, IonProgressBar, IonRow, IonSelect, IonSelectOption } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardInput, FairwayCardOrHarbor, HarborInput, Operation, Status } from '../../graphql/generated';
import { hasUnsavedChanges } from '../../utils/formValidations';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core';
import { ValueType } from '../../utils/constants';

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
}) => {
  const { t } = useTranslation();

  const unsavedChanges = useMemo(() => {
    return hasUnsavedChanges(oldState, currentState);
  }, [oldState, currentState]);

  const getVersionToString = (version: FairwayCardOrHarbor) => {
    return version.version.slice(1) + ' - ' + t('general.item-status-' + version.status);
  };

  const sortedVersions = versions?.sort((a, b) => Number(b.version.slice(1)) - Number(a.version.slice(1)));

  return (
    <IonHeader className="ion-no-border" id="mainPageContent">
      {isLoadingMutation && <IonProgressBar type="indeterminate" />}
      <IonGrid className="optionBar">
        <IonRow className="ion-align-items-end">
          {/* this 'extra' column keeps everything in it's right place */}
          <IonCol className="align-right" />
          <IonCol size="auto" className="formHeaderCol">
            <IonSelect
              disabled={isError || isLoading}
              className="selectInput"
              interface="popover"
              interfaceOptions={{ size: 'cover', className: 'multiSelect' }}
              labelPlacement="stacked"
              value={currentState.version}
              onIonChange={(ev) => handleVersionChange(ev)}
              fill="outline"
              style={{ width: '200px', height: '43px' }}
            >
              {sortedVersions?.map((v) => {
                return (
                  <IonSelectOption key={v.version} value={v.version}>
                    {getVersionToString(v)}
                  </IonSelectOption>
                );
              })}
              ;
            </IonSelect>
            <IonButton id="cancelButton" shape="round" className="invert" onClick={() => handleCancel()} disabled={isLoading}>
              {t('general.cancel')}
            </IonButton>
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
            {currentState.status === Status.Draft && (
              <IonButton shape="round" disabled={isError || isLoading || currentState.operation === Operation.Create} onClick={() => handlePreview()}>
                {t('general.preview')}
                <span className="screen-reader-only">{t('general.opens-in-a-new-tab')}</span>
              </IonButton>
            )}
            {currentState.status === Status.Draft && (
              <>
                <IonButton id="saveButton" shape="round" disabled={isError || isLoading} onClick={() => handleSave()}>
                  {currentState.operation === Operation.Update || currentState.operation === Operation.Createversion
                    ? t('general.save')
                    : t('general.create-new')}
                </IonButton>
                <IonButton id="publishVersion" shape="round" disabled={isError || isLoading || unsavedChanges} onClick={() => handlePublish()}>
                  {t('general.publish')}
                </IonButton>
              </>
            )}
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
