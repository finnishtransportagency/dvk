import React, { useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CloseIcon } from '../theme/img/close_black_24dp.svg';
import { FairwayCardInput, PictureInput } from '../graphql/generated';
import { imageUrl, Lang } from '../utils/constants';
import north_arrow from '../theme/img/north_arrow.svg';

interface ModalProps {
  picture: PictureInput | '';
  fairwayCardInput: FairwayCardInput;
  setIsOpen: (picture: PictureInput | '') => void;
}

const ImageModal: React.FC<ModalProps> = ({ picture, fairwayCardInput, setIsOpen }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  const [isLoading, setIsLoading] = useState(true);

  const modal = useRef<HTMLIonModalElement>(null);
  const compassInfo = useRef<HTMLDivElement>(null);
  const compassNeedle = useRef<HTMLImageElement>(null);

  const setBoundingBox = () => {
    if (compassInfo.current && compassNeedle.current) {
      const bbox = compassNeedle.current.getBoundingClientRect();
      const sidePadding = 8;
      compassNeedle.current.style.marginLeft = bbox.width / 2 - sidePadding + 'px';
      compassInfo.current.style.minWidth = (bbox.width + sidePadding).toString() + 'px';
      compassInfo.current.style.minHeight = (bbox.height + sidePadding).toString() + 'px';
    }
  };

  const closeModal = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    setTimeout(() => {
      setIsOpen('');
    }, 150);
  };

  return (
    <IonModal ref={modal} isOpen={!!picture} className={'image ' + (picture ? picture.orientation : '')} onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{t('modal.help-title-picture-' + (picture ? picture.orientation : ''))}</div>
          </IonTitle>
          <IonButton
            slot="end"
            onClick={() => closeModal()}
            fill="clear"
            className="closeButton"
            title={t('general.close') ?? ''}
            aria-label={t('general.close') ?? ''}
          >
            <CloseIcon />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid className="ion-no-padding">
          <IonRow className="content">
            <IonCol>
              {picture && (
                <div className="imageWrapper">
                  <img src={imageUrl + fairwayCardInput.id + '/' + picture.id} alt={picture.id} onLoad={() => setIsLoading(false)} />
                  {!isLoading && (
                    <div className="mapLegend">
                      <div className="bg"></div>
                      <div className="compassInfo" ref={compassInfo}>
                        <img
                          src={north_arrow}
                          alt=""
                          ref={compassNeedle}
                          onLoad={setBoundingBox}
                          style={{ transform: 'rotate(' + picture.rotation?.toPrecision(2) + 'rad)' }}
                        />
                      </div>
                      <div className="cardInfo">
                        <IonText>
                          <h3>{fairwayCardInput.name ? fairwayCardInput.name[lang] ?? fairwayCardInput.name.fi : t('fairwaycard.documentTitle')}</h3>
                        </IonText>
                        {picture.modificationTimestamp && (
                          <em>
                            {t('general.item-modified')}{' '}
                            {t('general.datetimeFormat', {
                              val: picture.modificationTimestamp ?? '-',
                            })}
                            {fairwayCardInput.n2000HeightSystem ? ' - N2000 (BSCD2000)' : ' - MW'}
                          </em>
                        )}
                        <em className="danger">{t('fairwaycard.notForNavigation')}</em>
                        <div className="mapScale" style={{ width: picture.scaleWidth ?? 100 + 'px' }}>
                          {picture.scaleLabel}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" size="large" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.close')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ImageModal;
