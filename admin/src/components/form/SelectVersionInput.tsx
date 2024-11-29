import React, { useRef, useState } from 'react';
import { IonButton, IonLabel, IonSelect, IonSelectOption, IonText } from '@ionic/react';
import HelpIcon from '../../theme/img/help_icon.svg?react';
import { FairwayCardOrHarbor } from '../../graphql/generated';
import { useTranslation } from 'react-i18next';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core';
import { ValueType } from '../../utils/constants';

interface SelectVersionInputProps {
  handleVersionChange: (event: IonSelectCustomEvent<SelectChangeEventDetail<ValueType>>) => void;
  versions?: FairwayCardOrHarbor[];
  isError?: boolean;
  isLoading?: boolean;
  version?: string;
}

const SelectVersionInput: React.FC<SelectVersionInputProps> = ({ handleVersionChange, versions, isError, isLoading, version }) => {
  const { t } = useTranslation();

  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const selectRef = useRef<HTMLIonSelectElement>(null);

  const focusInput = () => {
    selectRef.current?.click();
  };

  const getVersionToString = (version: FairwayCardOrHarbor) => {
    return version.version.slice(1) + ' - ' + t('general.item-status-' + version.status);
  };

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  const sortedVersions = versions?.sort((a, b) => Number(b.version.slice(1)) - Number(a.version.slice(1)));

  console.log(infoModalOpen);

  return (
    <>
      <IonLabel className="formLabel">
        <IonText onClick={() => focusInput()}>{t('general.version-number')}</IonText>
        <IonButton
          fill="clear"
          className="icon-only xx-small labelButton"
          onClick={() => showInfoModal()}
          title={t('info') ?? ''}
          aria-label={t('info') ?? ''}
        >
          <HelpIcon />
        </IonButton>
      </IonLabel>
      <IonSelect
        ref={selectRef}
        disabled={isError || isLoading}
        className="selectInput"
        interface="popover"
        interfaceOptions={{ size: 'cover', className: 'multiSelect' }}
        labelPlacement="stacked"
        value={version}
        onIonChange={(ev) => handleVersionChange(ev)}
        fill="outline"
        style={{ height: '43px' }}
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
    </>
  );
};

export default SelectVersionInput;
