import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '../graphql/generated';
import { Lang } from '../utils/constants';
import north_arrow from '../theme/img/north_arrow.svg';
import { debounce } from 'lodash';
import { refreshPrintableMap } from '../utils/common';
import dvkMap from './DvkMap';
import { IonText } from '@ionic/react';

type FairwayCardProps = {
  pictures?: string[];
  name?: Text;
  modified?: number;
  isN2000?: boolean;
};

const PrintMap: React.FC<FairwayCardProps> = ({ name, modified, isN2000, pictures }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const debouncedPrintImageRefresh = debounce(() => {
    refreshPrintableMap(pictures);
  }, 500);

  useEffect(() => {
    dvkMap.olMap?.on('moveend', debouncedPrintImageRefresh);
    dvkMap.olMap?.on('loadend', debouncedPrintImageRefresh);
    dvkMap.olMap?.on('rendercomplete', debouncedPrintImageRefresh);

    return () => {
      dvkMap.olMap?.un('moveend', debouncedPrintImageRefresh);
      dvkMap.olMap?.un('loadend', debouncedPrintImageRefresh);
      dvkMap.olMap?.un('rendercomplete', debouncedPrintImageRefresh);
    };
  }, [debouncedPrintImageRefresh]);

  return (
    <>
      <div className="mapWrapper">
        <div className="mapContent">
          <div className="mapExport" id="mapExport"></div>
          <div className="mapLegend">
            <div className="bg"></div>
            <div id="compassInfo">
              <img id="compassNeedle" src={north_arrow} alt="" />
            </div>
            <div className="cardInfo">
              <IonText>
                <h3 id="exportFairwayName">{name ? name[lang] ?? name.fi : t('documentTitle')}</h3>
              </IonText>
              {modified && (
                <em>
                  {t('modified')}{' '}
                  {t('modifiedDate', {
                    val: modified ? modified : '-',
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
      {pictures?.map((_, index) => {
        return (
          <>
            <div className="pagebreak"></div>
            <div className="mapWrapper">
              <div className="mapContent">
                <div className="mapExport" id={`mapExport${index}`}></div>
              </div>
            </div>
          </>
        );
      })}
    </>
  );
};

export default PrintMap;
