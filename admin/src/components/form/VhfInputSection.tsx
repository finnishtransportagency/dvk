import React from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { VhfInput } from '../../graphql/generated';
import TextInputRow from './TextInputRow';
import BinIcon from '../../theme/img/bin.svg?react';

interface VhfInputSectionProps {
  section: VhfInput;
  idx: number;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  deleteSection: (idx: number) => void;
  open: boolean;
  focused?: boolean;
  validationErrors?: ValidationType[];
  disabled?: boolean;
  actionOuterTarget?: string | number;
}

const VhfInputSection: React.FC<VhfInputSectionProps> = ({
  section,
  idx,
  updateState,
  deleteSection,
  open,
  focused,
  validationErrors,
  disabled,
  actionOuterTarget,
}) => {
  const { t } = useTranslation();

  return (
    <IonGrid className={'formGrid sectionContent' + (open ? ' open' : ' closed')}>
      <TextInputRow
        labelKey="fairwaycard.vhf-name"
        value={section.name}
        actionType="vhfName"
        updateState={updateState}
        actionTarget={idx}
        actionOuterTarget={actionOuterTarget}
        required={!!(section.name?.fi ?? section.name?.sv ?? section.name?.en)}
        error={
          section.name?.fi || section.name?.sv || section.name?.en
            ? validationErrors?.find((error) => error.id === 'vhfName-' + actionOuterTarget + '-' + idx)?.msg
            : undefined
        }
        disabled={disabled}
        focused={focused}
      />
      <IonRow className="ion-justify-content-between">
        <IonCol sizeMd="4">
          <TextInput
            label={t('fairwaycard.vhf-channel')}
            val={section.channel}
            setValue={updateState}
            actionType="vhfChannel"
            actionTarget={idx}
            actionOuterTarget={actionOuterTarget}
            required
            error={!section.channel ? validationErrors?.find((error) => error.id === 'vhfChannel-' + actionOuterTarget + '-' + idx)?.msg : undefined}
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
  );
};

export default VhfInputSection;
