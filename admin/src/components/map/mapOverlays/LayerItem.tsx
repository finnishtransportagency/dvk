import React, { useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getMap } from '../DvkMap';
import './LayerModal.css';
import arrowDownIcon from '../../../theme/img/arrow_down.svg';
import DepthMW from '../../../theme/img/syvyys_mw.svg?react';
import DepthN2000 from '../../../theme/img/syvyys_n2000.svg?react';
import { FeatureDataLayerId } from '../../../utils/constants';

const LegendDepth = () => {
  return (
    <IonGrid className="legend ion-no-padding">
      <IonRow>
        <IonCol size="2">
          <IonItem>
            <DepthN2000 />
          </IonItem>
        </IonCol>
        <IonCol size="3">
          <IonItem>
            <IonText>N2000</IonText>
          </IonItem>
        </IonCol>
        <IonCol size="2">
          <IonItem>
            <DepthMW />
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>MW</IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

const LegendSpeedlimits = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend speedlimit ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              30-26{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 }) || ''} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit30"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              25-21{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 }) || ''} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit25"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              20-16{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 }) || ''} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit20"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              15-11{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 }) || ''} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit15"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              10-6{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 }) || ''} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit10"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              5-1{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 }) || ''} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit5"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

interface LayerItemProps {
  id: FeatureDataLayerId;
  title: string;
  noOfflineSupport?: boolean;
  layers: string[];
  setLayers: React.Dispatch<React.SetStateAction<string[]>>;
}

const LayerItem: React.FC<LayerItemProps> = ({ id, title, layers, setLayers }) => {
  const { t } = useTranslation();
  const [legendOpen, setLegendOpen] = useState(false);
  const [legends, setLegends] = useState<string[]>([]);
  const dvkMap = getMap();

  const toggleDetails = () => {
    setLegendOpen(!legendOpen);
    setTimeout(() => {
      setLegends((prev) => {
        if (prev.includes(id)) {
          return [...prev.filter((l) => l !== id)];
        }
        return [...prev, id];
      });
    }, 250);
  };
  const dataUpdatedAt = dvkMap.getFeatureLayer(id).get('dataUpdatedAt');
  const initialized = !!dataUpdatedAt;
  const disabled = !initialized;

  return (
    <IonGrid className="ion-no-padding layerItem">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonCheckbox
              aria-labelledby={`${title}-label`}
              value={id}
              checked={layers.includes(id)}
              slot="start"
              onIonChange={() =>
                setLayers((prev) => {
                  if (prev.includes(id)) {
                    return [...prev.filter((p) => p !== id)];
                  }
                  return [...prev, id];
                })
              }
              disabled={disabled}
              labelPlacement="end"
            >
              <IonText id={`${title}-label`} className={disabled ? 'labelText disabled' : 'labelText'}>
                {title}
              </IonText>
              <IonText className={'layerLegend layer ' + id}></IonText>
            </IonCheckbox>
          </IonItem>
        </IonCol>
        <IonCol size="auto">
          {(id === 'speedlimit' || id === 'depth12') && (
            <IonButton
              fill="clear"
              className={'toggleButton' + (legendOpen || legends.includes(id) ? ' close' : ' open')}
              aria-label={(legendOpen || legends.includes(id) ? t('common.close') : t('common.open')) || ''}
              onClick={() => toggleDetails()}
            >
              <IonIcon icon={arrowDownIcon} />
            </IonButton>
          )}
        </IonCol>
      </IonRow>
      {(id === 'speedlimit' || id === 'depth12') && (
        <IonRow className={'toggle ' + (legendOpen || legends.includes(id) ? 'show' : 'hide')}>
          <IonCol>
            {id === 'speedlimit' && <LegendSpeedlimits />}
            {id === 'depth12' && <LegendDepth />}
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
};

export default LayerItem;
