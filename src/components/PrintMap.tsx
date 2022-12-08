import React from 'react';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { Text } from '../graphql/generated';
import { Lang } from '../utils/constants';
import north_arrow from '../theme/img/north_arrow.svg';
import { debounce } from 'lodash';
import { refreshPrintableMap } from '../utils/common';
import dvkMap from './DvkMap';
import { IonText } from '@ionic/react';

type FairwayCardProps = {
  name?: Text;
  modified?: number;
  isN2000?: boolean;
};

const PrintMap: React.FC<FairwayCardProps> = ({ name, modified, isN2000 }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const debouncedPrintImageRefresh = React.useRef(
    debounce(() => {
      refreshPrintableMap();
    }, 500)
  ).current;

  dvkMap.olMap?.on('moveend', () => {
    debouncedPrintImageRefresh();
  });
  dvkMap.olMap?.on('loadend', () => {
    debouncedPrintImageRefresh();
  });

  dvkMap.olMap?.once('rendercomplete', () => {
    debouncedPrintImageRefresh();
  });

  return (
    <>
      <div className="mapWrapper">
        <div className="mapContent">
          <div id="mapExport"></div>
          <div className="mapLegend">
            <div className="bg"></div>
            <div id="compassInfo">
              <img id="compassNeedle" src={north_arrow} alt="" />
            </div>
            <div className="cardInfo">
              <IonText>
                <h3 id="exportFairwayName">{name ? name[lang] : t('documentTitle')}</h3>
              </IonText>
              {modified && (
                <em>
                  {t('modified')}{' '}
                  {t('modifiedDate', {
                    val: modified ? new Date(modified * 1000) : '-',
                  })}
                  {isN2000 ? ' - N2000 (BSCD2000)' : ' - MW'}
                </em>
              )}
              <em className="danger">{t('notForNavigation')}</em>
              <div id="mapScale"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintMap;
