import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Orientation, PicturePartsFragment, Text } from '../graphql/generated';
import { Lang, imageUrl } from '../utils/constants';
import north_arrow from '../theme/img/north_arrow.svg';
import { debounce } from 'lodash';
import { refreshPrintableMap } from '../utils/common';
import dvkMap from './DvkMap';
import { IonText } from '@ionic/react';

type FairwayCardProps = {
  pictures?: PicturePartsFragment[];
  id?: string;
  name?: Text;
  modified?: number;
  isN2000?: boolean;
};

const PrintMap: React.FC<FairwayCardProps> = ({ id, name, modified, isN2000, pictures }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const debouncedPrintImageRefresh = debounce(() => {
    refreshPrintableMap();
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

  const setBoundingBox = useCallback((pictureId: string) => {
    const compassInfo = document.getElementById('compassInfo' + pictureId);
    const compassNeedle = document.getElementById('compassNeedle' + pictureId);
    if (compassInfo && compassNeedle) {
      const bbox = compassNeedle.getBoundingClientRect();
      const sidePadding = 8;
      compassNeedle.style.marginLeft = bbox.width / 2 - sidePadding / 2 + 'px';
      compassInfo.style.minWidth = (bbox.width + sidePadding).toString() + 'px';
      compassInfo.style.minHeight = (bbox.height + sidePadding).toString() + 'px';
    }
  }, []);

  useEffect(() => {
    for (const picture of pictures ?? []) {
      setBoundingBox(picture.id);
    }
  }, [pictures, setBoundingBox]);

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
              <div id="mapScale" className="mapScale"></div>
            </div>
          </div>
        </div>
      </div>
      {pictures?.map((picture, index) => {
        return (
          <div className={'imageWrapper ' + (picture.orientation === Orientation.Portrait ? 'hide-landscape' : 'hide-portrait')} key={picture.id}>
            <div className="pagebreak"></div>
            <div className="mapWrapper">
              <div className="mapContent">
                <div className="mapExport" id={`mapExport${index}`}>
                  <img src={imageUrl + id + '/' + picture.id} alt={picture.id} />
                </div>
                <div className="mapLegend">
                  <div className="bg"></div>
                  <div className="compassInfo" id={'compassInfo' + picture.id}>
                    <img
                      src={north_arrow}
                      alt=""
                      id={'compassNeedle' + picture.id}
                      style={{ transform: 'rotate(' + picture.rotation?.toPrecision(2) + 'rad)' }}
                    />
                  </div>
                  <div className="cardInfo">
                    <IonText>
                      <h3>{name ? name[lang] ?? name.fi : t('fairwaycard.documentTitle')}</h3>
                    </IonText>
                    {picture.modificationTimestamp && (
                      <em>
                        {t('modified')}{' '}
                        {t('modifiedDate', {
                          val: picture.modificationTimestamp ?? '-',
                        })}
                        {isN2000 ? ' - N2000 (BSCD2000)' : ' - MW'}
                      </em>
                    )}
                    <em className="danger">{t('notForNavigation')}</em>
                    <div className="mapScale" style={{ width: (picture.scaleWidth ?? 100) + 'px' }}>
                      {picture.scaleLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default PrintMap;
