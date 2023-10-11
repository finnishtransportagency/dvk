import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { QuayInput, SectionInput } from '../../graphql/generated';
import TextInputRow from './TextInputRow';
import Section from './Section';

interface QuayInputSectionProps {
  section: QuayInput;
  idx: number;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  open: boolean;
  focused?: boolean;
  validationErrors?: ValidationType[];
  disabled?: boolean;
}

const QuayInputSection: React.FC<QuayInputSectionProps> = ({ section, idx, updateState, open, focused, validationErrors, disabled }) => {
  const { t } = useTranslation();

  return (
    <div className={'sectionContent' + (open ? ' open' : ' closed')}>
      <IonGrid className="formGrid">
        <TextInputRow
          labelKey="harbour.quay-name"
          value={section.name}
          actionType="quayName"
          updateState={updateState}
          actionTarget={idx}
          required={!!(section.name?.fi ?? section.name?.sv ?? section.name?.en)}
          error={
            section.name?.fi || section.name?.sv || section.name?.en
              ? validationErrors?.find((error) => error.id === 'quayName-' + idx)?.msg
              : undefined
          }
          disabled={disabled}
          focused={focused}
        />
        <TextInputRow
          labelKey="harbour.quay-extra-info"
          value={section.extraInfo}
          actionType="quayExtraInfo"
          updateState={updateState}
          actionTarget={idx}
          required={!!(section.extraInfo?.fi ?? section.extraInfo?.sv ?? section.extraInfo?.en)}
          error={
            section.extraInfo?.fi || section.extraInfo?.sv || section.extraInfo?.en
              ? validationErrors?.find((error) => error.id === 'quayExtraInfo-' + idx)?.msg
              : undefined
          }
          disabled={disabled}
        />
        <IonRow>
          <IonCol sizeMd="4">
            <TextInput
              label={t('harbour.length')}
              val={section.length}
              setValue={updateState}
              actionType="quayLength"
              actionTarget={idx}
              inputType="number"
              unit="m"
              max={9999.9}
              decimalCount={1}
              disabled={disabled}
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('harbour.lat')}
              val={section.geometry?.lat}
              setValue={updateState}
              actionType="quayLat"
              actionTarget={idx}
              inputType="latitude"
              required={!!section.geometry?.lat || !!section.geometry?.lon}
              error={
                !section.geometry?.lat && section.geometry?.lon
                  ? validationErrors?.find((error) => error.id === 'quayGeometry-' + idx)?.msg
                  : undefined
              }
              disabled={disabled}
            />
          </IonCol>
          <IonCol sizeMd="4">
            <TextInput
              label={t('harbour.lon')}
              val={section.geometry?.lon}
              setValue={updateState}
              actionType="quayLon"
              actionTarget={idx}
              inputType="longitude"
              required={!!section.geometry?.lat || !!section.geometry?.lon}
              error={
                section.geometry?.lat && !section.geometry?.lon
                  ? validationErrors?.find((error) => error.id === 'quayGeometry-' + idx)?.msg
                  : undefined
              }
              disabled={disabled}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <Section
        title={''}
        sections={section.sections as SectionInput[]}
        updateState={updateState}
        sectionType="section"
        actionOuterTarget={idx}
        validationErrors={validationErrors}
        disabled={disabled}
      />
    </div>
  );
};

export default QuayInputSection;
