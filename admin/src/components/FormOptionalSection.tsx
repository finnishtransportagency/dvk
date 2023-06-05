import React, { useEffect, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonItem, IonRow, IonText } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import FormInput from './FormInput';
import { QuayInput, SectionInput, TugInput, VhfInput, VtsInput } from '../graphql/generated';
import FormTextInputRow from './FormTextInputRow';
import { ReactComponent as ChevronIcon } from '../theme/img/chevron.svg';
import { ReactComponent as BinIcon } from '../theme/img/bin.svg';

interface FormSectionProps {
  title: string;
  sections?: VtsInput[] | TugInput[] | VhfInput[] | QuayInput[] | SectionInput[] | null;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  sectionType: 'vts' | 'tug' | 'vhf' | 'quay' | 'section';
  actionOuterTarget?: string | number;
  validationErrors?: ValidationType[];
  disabled?: boolean;
}

const FormOptionalSection: React.FC<FormSectionProps> = ({
  title,
  sections,
  updateState,
  sectionType,
  actionOuterTarget,
  validationErrors,
  disabled,
}) => {
  const { t } = useTranslation();

  const [openSections, setOpenSections] = useState<boolean[]>(new Array(sections?.length).fill(true));
  const [focused, setFocused] = useState<boolean>(false);

  const toggleSection = (position: number) => {
    const opened = openSections.map((s, idx) => (idx === position ? !s : s));
    setOpenSections(opened);
  };

  const addSection = () => {
    if (actionOuterTarget === undefined) {
      updateState(true, sectionType);
    } else {
      updateState(true, sectionType, undefined, undefined, actionOuterTarget);
    }
    setOpenSections(openSections.concat(true));
    // Trigger setting focus on last section's first input
    setFocused(true);
    setTimeout(() => {
      setFocused(false);
    }, 150);
  };
  const deleteSection = (idx: number) => {
    updateState(false, sectionType, undefined, idx, actionOuterTarget);
    setOpenSections(openSections.filter((s, i) => idx !== i));
  };

  useEffect(() => {
    if (openSections.length !== sections?.length) setOpenSections(new Array(sections?.length).fill(true));
  }, [sections, openSections.length]);

  return (
    <>
      {sections?.map((section, idx) => {
        return (
          <div className="formSection" key={title + idx}>
            {actionOuterTarget === undefined && (
              <IonItem className="sectionHeader">
                <IonText>
                  <h3>
                    {title} {idx + 1}
                  </h3>
                </IonText>
                <IonButton
                  slot="end"
                  fill="clear"
                  className="icon-only small"
                  onClick={() => deleteSection(idx)}
                  title={t('general.delete') ?? ''}
                  aria-label={t('general.delete') ?? ''}
                  disabled={disabled}
                >
                  <BinIcon />
                </IonButton>
                <IonButton
                  slot="end"
                  fill="clear"
                  className={'icon-only small toggle' + (openSections[idx] ? ' close' : ' open')}
                  onClick={() => toggleSection(idx)}
                  title={(openSections[idx] ? t('general.close') : t('general.open')) ?? ''}
                  aria-label={(openSections[idx] ? t('general.close') : t('general.open')) ?? ''}
                >
                  <ChevronIcon />
                </IonButton>
              </IonItem>
            )}
            {actionOuterTarget !== undefined && <hr />}

            {sectionType === 'vts' && (
              <div className={'sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <IonGrid className="formGrid">
                  <FormTextInputRow
                    labelKey="fairwaycard.vts-name"
                    value={(section as VtsInput).name}
                    actionType="vtsName"
                    updateState={updateState}
                    actionTarget={idx}
                    required
                    error={
                      !(section as VtsInput).name?.fi || !(section as VtsInput).name.sv || !(section as VtsInput).name.en
                        ? validationErrors?.find((error) => error.id === 'vtsName-' + idx)?.msg
                        : undefined
                    }
                    disabled={disabled}
                    focused={idx === sections.length - 1 ? focused : undefined}
                  />
                  <IonRow>
                    <IonCol sizeMd="6">
                      <FormInput
                        label={t('general.email')}
                        val={(section as VtsInput).email?.join(',')}
                        setValue={updateState}
                        actionType="vtsEmail"
                        actionTarget={idx}
                        inputType="email"
                        helperText={t('general.use-comma-separated-values')}
                        multiple
                        disabled={disabled}
                      />
                    </IonCol>
                    <IonCol sizeMd="6">
                      <FormInput
                        label={t('general.phone-number')}
                        val={(section as VtsInput).phoneNumber}
                        setValue={updateState}
                        actionType="vtsPhone"
                        actionTarget={idx}
                        inputType="tel"
                        disabled={disabled}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
                <FormOptionalSection
                  title={''}
                  sections={(section as VtsInput).vhf as VhfInput[]}
                  updateState={updateState}
                  sectionType="vhf"
                  actionOuterTarget={idx}
                  validationErrors={validationErrors}
                  disabled={disabled}
                />
              </div>
            )}

            {sectionType === 'vhf' && (
              <IonGrid className={'formGrid sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <FormTextInputRow
                  labelKey="fairwaycard.vhf-name"
                  value={(section as VhfInput).name}
                  actionType="vhfName"
                  updateState={updateState}
                  actionTarget={idx}
                  actionOuterTarget={actionOuterTarget}
                  required={!!((section as VhfInput).name?.fi ?? (section as VhfInput).name?.sv ?? (section as VhfInput).name?.en)}
                  error={
                    (section as VhfInput).name?.fi || (section as VhfInput).name?.sv || (section as VhfInput).name?.en
                      ? validationErrors?.find((error) => error.id === 'vhfName-' + actionOuterTarget + '-' + idx)?.msg
                      : undefined
                  }
                  disabled={disabled}
                  focused={idx === sections.length - 1 ? focused : undefined}
                />
                <IonRow className="ion-justify-content-between">
                  <IonCol sizeMd="4">
                    <FormInput
                      label={t('fairwaycard.vhf-channel')}
                      val={(section as VhfInput).channel}
                      setValue={updateState}
                      actionType="vhfChannel"
                      actionTarget={idx}
                      actionOuterTarget={actionOuterTarget}
                      required
                      error={
                        !(section as VhfInput).channel
                          ? validationErrors?.find((error) => error.id === 'vhfChannel-' + actionOuterTarget + '-' + idx)?.msg
                          : undefined
                      }
                      inputType="number"
                      max={999}
                      decimalCount={0}
                      disabled={disabled}
                    />
                  </IonCol>
                  <IonCol size="auto" className="ion-align-self-center">
                    <IonButton
                      fill="clear"
                      className="icon-only small"
                      onClick={() => deleteSection(idx)}
                      title={t('general.delete') ?? ''}
                      aria-label={t('general.delete') ?? ''}
                      disabled={disabled}
                    >
                      <BinIcon />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {sectionType === 'tug' && (
              <IonGrid className={'formGrid sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <FormTextInputRow
                  labelKey="fairwaycard.tug-name"
                  value={(section as TugInput).name}
                  actionType="tugName"
                  updateState={updateState}
                  actionTarget={idx}
                  required
                  error={
                    !(section as TugInput).name?.fi || !(section as TugInput).name?.sv || !(section as TugInput).name?.en
                      ? validationErrors?.find((error) => error.id === 'tugName-' + idx)?.msg
                      : undefined
                  }
                  disabled={disabled}
                  focused={idx === sections.length - 1 ? focused : undefined}
                />
                <IonRow>
                  <IonCol sizeMd="4">
                    <FormInput
                      label={t('general.email')}
                      val={(section as TugInput).email}
                      setValue={updateState}
                      actionType="tugEmail"
                      actionTarget={idx}
                      inputType="email"
                      disabled={disabled}
                    />
                  </IonCol>
                  <IonCol sizeMd="4">
                    <FormInput
                      label={t('general.phone-number')}
                      val={(section as TugInput).phoneNumber?.join(',')}
                      setValue={updateState}
                      actionType="tugPhone"
                      actionTarget={idx}
                      helperText={t('general.use-comma-separated-values')}
                      inputType="tel"
                      multiple
                      disabled={disabled}
                    />
                  </IonCol>
                  <IonCol sizeMd="4">
                    <FormInput
                      label={t('general.fax')}
                      val={(section as TugInput).fax}
                      setValue={updateState}
                      actionType="tugFax"
                      actionTarget={idx}
                      inputType="tel"
                      disabled={disabled}
                    />
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {sectionType === 'quay' && (
              <div className={'sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <IonGrid className="formGrid">
                  <FormTextInputRow
                    labelKey="harbour.quay-name"
                    value={(section as QuayInput).name}
                    actionType="quayName"
                    updateState={updateState}
                    actionTarget={idx}
                    required={!!((section as QuayInput).name?.fi ?? (section as QuayInput).name?.sv ?? (section as QuayInput).name?.en)}
                    error={
                      (section as QuayInput).name?.fi || (section as QuayInput).name?.sv || (section as QuayInput).name?.en
                        ? validationErrors?.find((error) => error.id === 'quayName-' + idx)?.msg
                        : undefined
                    }
                    disabled={disabled}
                    focused={idx === sections.length - 1 ? focused : undefined}
                  />
                  <FormTextInputRow
                    labelKey="harbour.quay-extra-info"
                    value={(section as QuayInput).extraInfo}
                    actionType="quayExtraInfo"
                    updateState={updateState}
                    actionTarget={idx}
                    required={
                      !!((section as QuayInput).extraInfo?.fi ?? (section as QuayInput).extraInfo?.sv ?? (section as QuayInput).extraInfo?.en)
                    }
                    error={
                      (section as QuayInput).extraInfo?.fi || (section as QuayInput).extraInfo?.sv || (section as QuayInput).extraInfo?.en
                        ? validationErrors?.find((error) => error.id === 'quayExtraInfo-' + idx)?.msg
                        : undefined
                    }
                    disabled={disabled}
                  />
                  <IonRow>
                    <IonCol sizeMd="4">
                      <FormInput
                        label={t('harbour.length')}
                        val={(section as QuayInput).length}
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
                      <FormInput
                        label={t('harbour.lat')}
                        val={(section as QuayInput).geometry?.lat}
                        setValue={updateState}
                        actionType="quayLat"
                        actionTarget={idx}
                        inputType="latitude"
                        required={!!(section as QuayInput).geometry?.lat || !!(section as QuayInput).geometry?.lon}
                        error={
                          !(section as QuayInput).geometry?.lat && (section as QuayInput).geometry?.lon
                            ? validationErrors?.find((error) => error.id === 'quayGeometry-' + idx)?.msg
                            : undefined
                        }
                        disabled={disabled}
                      />
                    </IonCol>
                    <IonCol sizeMd="4">
                      <FormInput
                        label={t('harbour.lon')}
                        val={(section as QuayInput).geometry?.lon}
                        setValue={updateState}
                        actionType="quayLon"
                        actionTarget={idx}
                        inputType="longitude"
                        required={!!(section as QuayInput).geometry?.lat || !!(section as QuayInput).geometry?.lon}
                        error={
                          (section as QuayInput).geometry?.lat && !(section as QuayInput).geometry?.lon
                            ? validationErrors?.find((error) => error.id === 'quayGeometry-' + idx)?.msg
                            : undefined
                        }
                        disabled={disabled}
                      />
                    </IonCol>
                  </IonRow>
                </IonGrid>
                <FormOptionalSection
                  title={''}
                  sections={(section as QuayInput).sections as SectionInput[]}
                  updateState={updateState}
                  sectionType="section"
                  actionOuterTarget={idx}
                  validationErrors={validationErrors}
                  disabled={disabled}
                />
              </div>
            )}

            {sectionType === 'section' && (
              <IonGrid className={'formGrid sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <IonRow>
                  <IonCol>
                    <FormInput
                      label={t('harbour.section-name')}
                      val={(section as SectionInput).name}
                      setValue={updateState}
                      actionType="sectionName"
                      actionTarget={idx}
                      actionOuterTarget={actionOuterTarget}
                      disabled={disabled}
                      focused={idx === sections.length - 1 ? focused : undefined}
                    />
                  </IonCol>
                  <IonCol>
                    <FormInput
                      label={t('harbour.depth')}
                      val={(section as SectionInput).depth}
                      setValue={updateState}
                      actionType="sectionDepth"
                      actionTarget={idx}
                      actionOuterTarget={actionOuterTarget}
                      inputType="number"
                      unit="m"
                      max={999.99}
                      decimalCount={2}
                      disabled={disabled}
                    />
                  </IonCol>
                  <IonCol>
                    <FormInput
                      label={t('harbour.lat')}
                      val={(section as SectionInput).geometry?.lat}
                      setValue={updateState}
                      actionType="sectionLat"
                      actionTarget={idx}
                      actionOuterTarget={actionOuterTarget}
                      required={!!(section as SectionInput).geometry?.lat || !!(section as SectionInput).geometry?.lon}
                      inputType="latitude"
                      error={
                        !(section as SectionInput).geometry?.lat && (section as SectionInput).geometry?.lon
                          ? validationErrors?.find((error) => error.id === 'sectionGeometry-' + actionOuterTarget + '-' + idx)?.msg
                          : undefined
                      }
                      disabled={disabled}
                    />
                  </IonCol>
                  <IonCol>
                    <FormInput
                      label={t('harbour.lon')}
                      val={(section as SectionInput).geometry?.lon}
                      setValue={updateState}
                      actionType="sectionLon"
                      actionTarget={idx}
                      actionOuterTarget={actionOuterTarget}
                      required={!!(section as SectionInput).geometry?.lat || !!(section as SectionInput).geometry?.lon}
                      inputType="longitude"
                      error={
                        (section as SectionInput).geometry?.lat && !(section as SectionInput).geometry?.lon
                          ? validationErrors?.find((error) => error.id === 'sectionGeometry-' + actionOuterTarget + '-' + idx)?.msg
                          : undefined
                      }
                      disabled={disabled}
                    />
                  </IonCol>
                  <IonCol size="auto" className="ion-align-self-center">
                    <IonButton
                      fill="clear"
                      className="icon-only small"
                      onClick={() => deleteSection(idx)}
                      title={t('general.delete') ?? ''}
                      aria-label={t('general.delete') ?? ''}
                      disabled={disabled}
                    >
                      <BinIcon />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </div>
        );
      })}

      <IonGrid>
        <IonRow className="ion-justify-content-end">
          <IonCol size="auto">
            <IonButton shape="round" onClick={() => addSection()} disabled={disabled}>
              {t('general.add-section-' + sectionType)}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default FormOptionalSection;
