import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import { FairwayCardInput, PictureInput } from '../graphql/generated';
import { imageUrl, Lang, POSITION, ActionType, ValueType } from '../utils/constants';
import north_arrow from '../theme/img/north_arrow.svg';

interface PositionButtonProps {
  position: string;
  legendPosition: string;
  setLegendPosition: (position: string) => void;
}

const LegendPositionButton: React.FC<PositionButtonProps> = ({ position, legendPosition, setLegendPosition }) => {
  return (
    <button
      className={`legendPositionButton ${position} ${legendPosition === position ? 'colorGreen' : 'colorRed'}`}
      onClick={() => {
        setLegendPosition(position);
      }}
    />
  );
};

interface ModalProps {
  picture: PictureInput | '';
  fairwayCardInput: FairwayCardInput;
  setIsOpen: (picture: PictureInput | '') => void;
  setPicture: (
    val: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  disabled: boolean;
  sourceCard?: string;
}

const ImageModal: React.FC<ModalProps> = ({ picture, fairwayCardInput, setIsOpen, setPicture, disabled, sourceCard }) => {
  const { t, i18n } = useTranslation();
  const fi = i18n.getFixedT('fi');
  const sv = i18n.getFixedT('sv');
  const en = i18n.getFixedT('en');
  const [isLoading, setIsLoading] = useState(true);
  const [legendPosition, setLegendPosition] = useState<string>(POSITION.bottomLeft);
  const modal = useRef<HTMLIonModalElement>(null);
  const compassInfo = useRef<HTMLDivElement>(null);
  const compassNeedle = useRef<HTMLImageElement>(null);

  const getPictureTitle = () => {
    const picInput = picture as PictureInput;
    if (picInput.text) {
      return picInput.text;
    } else if (picInput.lang) {
      return fairwayCardInput.name[picInput.lang as Lang] ?? fairwayCardInput.name.fi;
    } else {
      return '(' + t('fairwaycard.name') + ')';
    }
  };

  const getTranslatedText = (key: string, opts?: { val: number | string }) => {
    const pictureLang = (picture as PictureInput)?.lang;
    if (pictureLang === 'fi') {
      return fi(key, opts ?? {});
    } else if (pictureLang === 'sv') {
      return sv(key, opts ?? {});
    } else if (pictureLang === 'en') {
      return en(key, opts ?? {});
    } else {
      return t(key, opts ?? {});
    }
  };

  // sets legend accordingly when opening a picture, if undefined sets box to bottom left corner
  useEffect(() => {
    const pictureLegendPosition = (picture as PictureInput)?.legendPosition;
    setLegendPosition(pictureLegendPosition ?? POSITION.bottomLeft);
  }, [picture]);

  const setCompassInfo = () => {
    if (compassInfo.current && compassNeedle.current) {
      const bbox = compassNeedle.current.getBoundingClientRect();
      const sidePadding = 8;
      compassNeedle.current.style.marginLeft = bbox.width / 2 - sidePadding + 'px';
      compassInfo.current.style.minWidth = (bbox.width + sidePadding).toString() + 'px';
      compassInfo.current.style.minHeight = (bbox.height + sidePadding).toString() + 'px';
    }
  };

  // when closing a picture, updates fairwaycardreducer state by changing legendPosition
  // for the picture group in question
  const closeModal = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    const pictureGroupId = (picture as PictureInput)?.groupId;
    if (pictureGroupId) {
      setPicture(legendPosition, 'pictureLegendPosition', undefined, pictureGroupId);
    }
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
            <IonCol className="imageWrapperParent">
              {picture && (
                <div className="imageWrapper">
                  <img
                    src={`${imageUrl}${sourceCard?.length ? sourceCard : fairwayCardInput.id}/${picture.id}`}
                    alt={sourceCard?.length ? `${t('fairwaycard.pic-copy')}-${picture.id}` : picture.id}
                    onLoad={() => setIsLoading(false)}
                  />
                  {!isLoading && (
                    <div className={`mapLegend ${legendPosition}`}>
                      <div className="bg"></div>
                      {picture.rotation !== null && (
                        <div className="compassInfo" ref={compassInfo}>
                          <img
                            src={north_arrow}
                            alt=""
                            ref={compassNeedle}
                            onLoad={() => setTimeout(() => setCompassInfo(), 50)}
                            style={{ transform: 'rotate(' + picture.rotation?.toPrecision(2) + 'rad)' }}
                          />
                        </div>
                      )}
                      <div className="cardInfo">
                        <IonText>
                          <h3>{getPictureTitle()}</h3>
                        </IonText>
                        {picture.modificationTimestamp && (
                          <em>
                            {getTranslatedText('general.item-modified')}{' '}
                            {getTranslatedText('general.datetimeFormat', {
                              val: picture.modificationTimestamp ?? '-',
                            })}
                            {picture.scaleLabel && picture.scaleWidth && (fairwayCardInput.n2000HeightSystem ? ' - N2000 (BSCD2000)' : ' - MW')}
                          </em>
                        )}
                        <em className="danger">{getTranslatedText('fairwaycard.notForNavigation')}</em>
                        {picture.scaleLabel && picture.scaleWidth && (
                          <div className="mapScale" style={{ width: (picture.scaleWidth ?? 100) + 'px' }}>
                            {picture.scaleLabel}
                          </div>
                        )}
                        {!disabled && (
                          <>
                            <LegendPositionButton
                              position={POSITION.bottomLeft}
                              legendPosition={legendPosition}
                              setLegendPosition={setLegendPosition}
                            />
                            <LegendPositionButton position={POSITION.topLeft} legendPosition={legendPosition} setLegendPosition={setLegendPosition} />
                            <LegendPositionButton
                              position={POSITION.topRight}
                              legendPosition={legendPosition}
                              setLegendPosition={setLegendPosition}
                            />
                            <LegendPositionButton
                              position={POSITION.bottomRight}
                              legendPosition={legendPosition}
                              setLegendPosition={setLegendPosition}
                            />
                          </>
                        )}
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
          <IonButton slot="end" onClick={() => closeModal()} shape="round">
            {t('general.close')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ImageModal;
