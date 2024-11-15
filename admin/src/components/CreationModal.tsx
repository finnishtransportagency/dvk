import React, { useMemo, useRef, useState } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonFooter,
  IonGrid,
  IonHeader,
  IonInput,
  IonLabel,
  IonModal,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { FairwayCardInput, FairwayCardOrHarbor, Operation, Status } from '../graphql/generated';
import { INPUT_MAXLENGTH, ItemType, Lang, VERSION } from '../utils/constants';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import SearchInput from './SearchInput';
import { useHistory } from 'react-router';
import { FairwayCardOrHarborGroup, getCombinedErrorAndHelperText, getEmptyFairwayCardInput, sortItemGroups } from '../utils/common';
import { useSaveFairwayCardMutationQuery } from '../graphql/api';
import { mapTrafficService } from '../utils/dataMapper';

interface ModalProps {
  itemList: FairwayCardOrHarbor[];
  itemType: ItemType;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsCreating: (isCreating: boolean) => void;
}

const CreationModal: React.FC<ModalProps> = ({ itemList, itemType, isOpen, setIsOpen, setIsCreating }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();

  const modal = useRef<HTMLIonModalElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [source, setSource] = useState<FairwayCardOrHarborGroup | undefined>();
  const [version, setVersion] = useState<FairwayCardOrHarbor | undefined>();
  const [identifier, setIdentifier] = useState<string>('');
  const [identifierValid, setIdentifierValid] = useState(true);
  const [copyPics, setCopyPics] = useState(false);

  const selectVersionRef = useRef<HTMLIonSelectElement>(null);
  const identifierInputRef = useRef<HTMLIonInputElement>(null);

  const { mutate: saveFairwayCard, isPending } = useSaveFairwayCardMutationQuery({
    onSuccess(data) {
      setIsCreating(false);
      modal.current?.dismiss().catch((err) => console.error(err));
      history.push({
        pathname: '/vaylakortti/' + data.saveFairwayCard?.id + '/v1',
      });
    },
    onError: (error: Error) => {
      setIsCreating(false);
      console.log(error);
    },
  });

  const focusVersionSelect = () => {
    selectVersionRef.current?.click();
  };

  const focusIdentifierInput = () => {
    identifierInputRef.current?.setFocus().catch((err) => {
      console.error(err.message);
    });
  };

  const createNewItem = () => {
    setIsCreating(true);
    if (itemType === 'CARD') {
      let card;
      if (version) {
        card = mapTrafficService({
          fairwayIds: version?.fairwayIds,
          group: version?.group,
          id: identifier,
          n2000HeightSystem: version?.n2000HeightSystem,
          name: version?.name,
          status: Status.Draft,
          temporaryNotifications: version?.temporaryNotifications,
          version: 'v1',
          operation: Operation.Create,
        } as FairwayCardInput);
      } else {
        card = getEmptyFairwayCardInput(identifier);
        console.log(card);
      }
      saveFairwayCard({ card: card });
    }
    if (itemType === 'HARBOR') history.push({ pathname: '/satama/', state: { origin: version, newVersion: false } });
  };

  const groupedItemList = useMemo(() => {
    const lang = i18n.language as Lang;
    const filtered = itemList.filter((item) => item.type === itemType) || [];
    const groupedItems: FairwayCardOrHarborGroup[] = [];
    for (const item of filtered) {
      const group = groupedItems.find((g) => g.id === item.id);
      if (group) {
        group.items.push(item);
      } else {
        groupedItems.push({ id: item.id, items: [item] });
      }
    }
    return sortItemGroups(groupedItems, lang);
  }, [i18n.language, itemList, itemType]);

  const closeModal = () => {
    setIsOpen(false);
    setIdentifier('');
    setIdentifierValid(true);
    modal.current?.dismiss().catch((err) => console.error(err));
    setTimeout(() => {
      if (!isDropdownOpen) {
        setSource(undefined);
        setVersion(undefined);
      }
    }, 150);
  };

  const compareOptions = (o1: FairwayCardOrHarbor, o2: FairwayCardOrHarbor) => {
    return o1 && o2 ? o1.id === o2.id && o1.version === o2.version : o1 === o2;
  };

  const checkIdentifierValidity = () => {
    identifierInputRef.current
      ?.getInputElement()
      .then((textinput) => {
        if (textinput) {
          setIdentifierValid(textinput.checkValidity());
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const getErrorText = (val?: string) => {
    if (!identifierValid) {
      return !val?.trim()?.length ? t('general.required-field') : t('general.check-input');
    }
    return '';
  };

  return (
    <IonModal ref={modal} isOpen={isOpen} className="prompt" canDismiss={!isDropdownOpen} onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{t('modal.title-new-' + itemType)}</div>
          </IonTitle>
          <IonButton
            slot="end"
            onClick={() => closeModal()}
            fill="clear"
            className="closeButton"
            title={t('general.close') ?? ''}
            aria-label={t('general.close') ?? ''}
            disabled={isPending}
          >
            <CloseIcon />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow className="content">
          <IonCol>
            <IonText>
              <p>{t('modal.description-new-' + itemType)}</p>
            </IonText>
            <SearchInput
              itemList={groupedItemList}
              selectedItem={source}
              setSelectedItem={setSource}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              setVersion={setVersion}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonLabel className={`formLabel ion-margin-top${!source ? ' disabled' : ''}`} onClick={() => focusVersionSelect()}>
              {t('general.version-number')} {'*'}
            </IonLabel>
            <IonSelect
              ref={selectVersionRef}
              className="selectInput"
              disabled={!source}
              placeholder={t('general.choose')}
              interface="popover"
              interfaceOptions={{
                className: 'version-select',
                size: 'cover',
              }}
              labelPlacement="stacked"
              fill="outline"
              value={version}
              onIonChange={(ev) => setVersion(ev.detail.value)}
              compareWith={compareOptions}
            >
              {source?.items
                .filter((item) => item.version !== VERSION.PUBLIC && item.version !== VERSION.LATEST)
                .sort((a, b) => Number(b.version.slice(1)) - Number(a.version.slice(1)))
                .map((item) => {
                  return (
                    <IonSelectOption key={`${item.id}-${item.version}`} value={item}>
                      {`${item.version.slice(1)} (${t('general.item-status-' + item.status).toLocaleLowerCase()})`}
                    </IonSelectOption>
                  );
                })}
            </IonSelect>
          </IonCol>
        </IonRow>
        <IonRow className="ion-margin-top formGrid">
          <IonCol>
            <IonLabel className="formLabel">
              <IonText onClick={() => focusIdentifierInput()}>
                {itemType === 'CARD' ? t('modal.card-identifier') : t('modal.harbor-identifier')} {'*'}
              </IonText>
            </IonLabel>
            <IonInput
              ref={identifierInputRef}
              className={'formInput' + (identifierValid ? '' : ' invalid')}
              errorText={getCombinedErrorAndHelperText(t('fairwaycard.primary-id-help-text'), getErrorText())}
              fill="outline"
              helperText={identifierValid ? t('fairwaycard.primary-id-help-text') : ''}
              inputMode="text"
              maxlength={INPUT_MAXLENGTH}
              name="primaryId"
              onIonBlur={() => {
                checkIdentifierValidity();
              }}
              onIonChange={(ev) => setIdentifier(ev.target.value as string)}
              pattern="[a-z]+[a-z\\d]*"
              required
              type="text"
              value={identifier}
            ></IonInput>
          </IonCol>
        </IonRow>
        {itemType === 'CARD' && (
          <IonRow>
            <IonCol>
              <IonCheckbox labelPlacement="end" disabled={!source || !version} checked={copyPics} onIonChange={(e) => setCopyPics(e.detail.checked)}>
                {t('modal.copy-pictures')}
              </IonCheckbox>
            </IonCol>
          </IonRow>
        )}
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round" className="invert" disabled={isPending}>
            {t('general.cancel')}
          </IonButton>
          <IonButton
            slot="end"
            onClick={() => createNewItem()}
            shape="round"
            disabled={!identifier || !identifierValid || (source && !version) || isPending}
          >
            {t('modal.create-' + itemType)}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default CreationModal;
