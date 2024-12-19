import React, { ReactElement, useCallback } from 'react';
import { IonCol, IonGrid, IonImg, IonItem, IonRadio, IonRadioGroup, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Label from './Label';
import { debounce } from 'lodash';
import { removeSoftHyphen } from '../utils/helpers';

export type OptionType = {
  id: number;
  name: string;
  img?: string;
  desc?: string;
  opaque?: boolean;
};

interface RadioSelectProps {
  title: string;
  name: string;
  value: OptionType | null;
  options: OptionType[];
  required?: boolean;
  actionType: Action['type'];
  translateOptions?: boolean;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
  infoContentSize?: 'medium' | 'large';
  columnSize?: string;
}

const RadioSelectField: React.FC<RadioSelectProps> = (props) => {
  const { t } = useTranslation();
  const { dispatch } = useSquatContext();

  const updateAction = useCallback(
    (value: OptionType, tagName: string) => {
      dispatch({
        type: props.actionType,
        payload: {
          key: props.name,
          value: value,
          elType: tagName,
        },
      });
    },
    [dispatch, props.actionType, props.name]
  );

  const debouncedUpdateAction = React.useRef(
    debounce((value: OptionType, tagName: string) => {
      updateAction(value, tagName);
    }, 100)
  ).current;

  const handleChange = useCallback(
    (e: { target: HTMLIonRadioGroupElement }) => {
      debouncedUpdateAction(e.target.value, e.target.tagName);
    },
    [debouncedUpdateAction]
  );

  const handleClick = (option: OptionType) => {
    debouncedUpdateAction(option, 'ion-radio-group');
  };

  return (
    <IonRadioGroup value={props.value} name={props.name} onIonChange={handleChange} aria-label={props.title}>
      <Label
        id={`${props.actionType}-label`}
        title={props.title}
        required={props.required}
        infoContentTitle={props.infoContentTitle}
        infoContent={props.infoContent}
        infoContentSize={props.infoContentSize}
      />
      <IonGrid className="no-padding" style={{ marginTop: '1px' }}>
        <IonRow>
          {props.options.map((option) => {
            const optionName = props.translateOptions ? t(option.name) : option.name;
            return (
              <IonCol key={option.id} className={'col-radio' + (props.value !== option ? ' col-radio-unchecked' : '')} size={props.columnSize}>
                <IonItem
                  lines="none"
                  className={(props.value === option ? '' : 'item-radio-unchecked ') + 'no-padding align-center no-background-focused'}
                  onClick={() => (props.value !== option ? handleClick(option) : null)}
                >
                  <IonGrid className="no-padding">
                    <IonRow>
                      <IonCol>
                        <IonText className="ion-text-wrap radio">
                          {option.img && <IonImg aria-hidden className={option.opaque ? 'opaque' : ''} src={option.img} />}
                          <p>{optionName}</p>
                        </IonText>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol>
                        <IonRadio
                          id={t(option.name, { lng: 'en' })}
                          name={t(option.name, { lng: 'en' })}
                          aria-label={removeSoftHyphen(optionName)}
                          value={option}
                          className={props.value === option ? 'radio-checked' : 'radio-unchecked'}
                          data-testid={t(option.name, { lng: 'en' })}
                        />
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>
              </IonCol>
            );
          })}
        </IonRow>
      </IonGrid>
    </IonRadioGroup>
  );
};

export default RadioSelectField;
