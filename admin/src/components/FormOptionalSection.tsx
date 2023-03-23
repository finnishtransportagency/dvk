import React, { useEffect, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonItem, IonRow, IonText } from '@ionic/react';
import { ActionType, Lang } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import FormInput from './FormInput';
import { TugInput, VhfInput, VtsInput } from '../graphql/generated';
import FormTextInputRow from './FormTextInputRow';
import { ReactComponent as ChevronIcon } from '../theme/img/chevron.svg';
import { ReactComponent as BinIcon } from '../theme/img/bin.svg';

interface FormSectionProps {
  title: string;
  sections?: VtsInput[] | TugInput[] | VhfInput[] | null;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  sectionType: 'vts' | 'tug' | 'vhf';
  actionOuterTarget?: string | number;
}

const FormOptionalSection: React.FC<FormSectionProps> = ({ title, sections, updateState, sectionType, actionOuterTarget }) => {
  const { t } = useTranslation();

  const [openSections, setOpenSections] = useState<boolean[]>(new Array(sections?.length).fill(true));
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
                  title={t('general.delete') || ''}
                  aria-label={t('general.delete') || ''}
                >
                  <BinIcon />
                </IonButton>
                <IonButton
                  slot="end"
                  fill="clear"
                  className={'icon-only small' + (openSections[idx] ? ' close' : ' open')}
                  onClick={() => toggleSection(idx)}
                  title={(openSections[idx] ? t('general.close') : t('general.open')) || ''}
                  aria-label={(openSections[idx] ? t('general.close') : t('general.open')) || ''}
                >
                  <ChevronIcon />
                </IonButton>
              </IonItem>
            )}
            {actionOuterTarget !== undefined && <hr />}
            {sectionType === 'vts' && (
              <div className={'sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <IonGrid>
                  <FormTextInputRow
                    labelKey="fairwaycard.vts-name"
                    value={section.name}
                    actionType="vtsName"
                    updateState={updateState}
                    actionTarget={idx}
                    required
                  />
                  <IonRow>
                    <IonCol>
                      <FormInput
                        label={t('general.email')}
                        val={(section as VtsInput).email?.join(', ')}
                        setValue={updateState}
                        actionType="vtsEmail"
                        actionTarget={idx}
                        helperText={t('general.use-comma-separated-values')}
                      />
                    </IonCol>
                    <IonCol>
                      <FormInput
                        label={t('general.phone-number')}
                        val={(section as VtsInput).phoneNumber}
                        setValue={updateState}
                        actionType="vtsPhone"
                        actionTarget={idx}
                        inputType="tel"
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
                />
              </div>
            )}
            {sectionType === 'vhf' && (
              <IonGrid className={'sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <FormTextInputRow
                  labelKey="fairwaycard.vhf-name"
                  value={section.name}
                  actionType="vhfName"
                  updateState={updateState}
                  actionTarget={idx}
                  actionOuterTarget={actionOuterTarget}
                  required={!!(section.name?.fi || section.name?.sv || section.name?.en)}
                />
                <IonRow className="ion-justify-content-between ion-align-items-center">
                  <IonCol size="6">
                    <FormInput
                      label={t('fairwaycard.vhf-channel')}
                      val={(section as VhfInput).channel}
                      setValue={updateState}
                      actionType="vhfChannel"
                      actionTarget={idx}
                      actionOuterTarget={actionOuterTarget}
                      required
                    />
                  </IonCol>
                  <IonCol size="auto">
                    <IonButton
                      fill="clear"
                      className="icon-only small"
                      onClick={() => deleteSection(idx)}
                      title={t('general.delete') || ''}
                      aria-label={t('general.delete') || ''}
                    >
                      <BinIcon />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
            {sectionType === 'tug' && (
              <IonGrid className={'sectionContent' + (openSections[idx] ? ' open' : ' closed')}>
                <FormTextInputRow
                  labelKey="fairwaycard.tug-name"
                  value={section.name}
                  actionType="tugName"
                  updateState={updateState}
                  actionTarget={idx}
                  required
                />
                <IonRow>
                  <IonCol>
                    <FormInput
                      label={t('general.email')}
                      val={(section as TugInput).email}
                      setValue={updateState}
                      actionType="tugEmail"
                      actionTarget={idx}
                      inputType="email"
                    />
                  </IonCol>
                  <IonCol>
                    <FormInput
                      label={t('general.phone-number')}
                      val={(section as TugInput).phoneNumber?.join(', ')}
                      setValue={updateState}
                      actionType="tugPhone"
                      actionTarget={idx}
                      helperText={t('general.use-comma-separated-values')}
                    />
                  </IonCol>
                  <IonCol>
                    <FormInput
                      label={t('general.fax')}
                      val={(section as TugInput).fax}
                      setValue={updateState}
                      actionType="tugFax"
                      actionTarget={idx}
                      inputType="tel"
                    />
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
            <IonButton shape="round" size={actionOuterTarget !== undefined ? 'small' : 'default'} onClick={() => addSection()}>
              {t('fairwaycard.add-section-' + sectionType)}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default FormOptionalSection;
