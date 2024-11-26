import React from 'react';
import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { HarborInput, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { ValueType, ActionType, Lang, ValidationType } from '../../../utils/constants';
import TextInput from '../TextInput';

interface ContactInfoSectionProps {
  state: HarborInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  readonly?: boolean;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ state, updateState, validationErrors, readonly }) => {
  const { t } = useTranslation();

  return (
    <>
      <IonText>
        <h3>{t('harbour.contact-info')}</h3>
      </IonText>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="harbour.company-name"
          value={state.company}
          updateState={updateState}
          actionType="companyName"
          required={!!state.company?.fi || !!state.company?.sv || !!state.company?.en}
          readonly={readonly}
          disabled={!readonly && state.status === Status.Removed}
          error={validationErrors.find((error) => error.id === 'companyName')?.msg}
        />
        <IonRow>
          <IonCol sizeMd="4">
            <TextInput
              label={t('general.email')}
              val={state.email ?? ''}
              setValue={updateState}
              actionType="email"
              inputType="email"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('general.phone-number')}
              val={state.phoneNumber?.join(',')}
              setValue={updateState}
              actionType="phoneNumber"
              helperText={t('general.use-comma-separated-values')}
              inputType="tel"
              multiple
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('general.fax')}
              val={state.fax ?? ''}
              setValue={updateState}
              actionType="fax"
              inputType="tel"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol sizeMd="4">
            <TextInput
              label={t('harbour.internet')}
              val={state.internet ?? ''}
              setValue={updateState}
              actionType="internet"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('harbour.lat')}
              name="lat"
              val={state.geometry.lat ?? ''}
              setValue={updateState}
              actionType="lat"
              required
              error={validationErrors.find((error) => error.id === 'lat')?.msg}
              inputType="latitude"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('harbour.lon')}
              name="lon"
              val={state.geometry.lon ?? ''}
              setValue={updateState}
              actionType="lon"
              required
              error={validationErrors.find((error) => error.id === 'lon')?.msg}
              inputType="longitude"
              readonly={readonly}
              disabled={!readonly && state.status === Status.Removed}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default ContactInfoSection;
