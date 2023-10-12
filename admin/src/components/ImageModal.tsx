import React, { useRef, useState } from 'react';
import { IonButton, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CloseIcon } from '../theme/img/close_black_24dp.svg';
import { FairwayCardInput, PictureInput } from '../graphql/generated';
import { imageUrl, Lang, POSITION, BUTTON_COLORS } from '../utils/constants';
import north_arrow from '../theme/img/north_arrow.svg';

const getColorArray = (positionString: string) => {
  const colorArray = new Array(4).fill(BUTTON_COLORS.red);
  let greenIndex = 0;

  switch (positionString) {
    case 'topLeft':
      greenIndex = 1;
      break;
    case 'topRight':
      greenIndex = 2;
      break;
    case 'bottomRight':
      greenIndex = 3;
      break;
  }
  colorArray[greenIndex] = BUTTON_COLORS.green;

  return colorArray;
};
interface ModalProps {
  picture: PictureInput | '';
  fairwayCardInput: FairwayCardInput;
  setIsOpen: (picture: PictureInput | '') => void;
}

const ImageModal: React.FC<ModalProps> = ({ picture, fairwayCardInput, setIsOpen }) => {
  const { t, i18n } = useTranslation();
  const fi = i18n.getFixedT('fi');
  const sv = i18n.getFixedT('sv');
  const en = i18n.getFixedT('en');

  const [isLoading, setIsLoading] = useState(true);
  const [legendPosition, setLegendPosition] = useState(picture.legendPosition ?? POSITION.bottomLeft.position);
  const [buttonColors, setButtonColors] = useState<string[]>(getColorArray(picture.legendPosition));

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
      // tänne se tallentaminen
      setIsOpen('');
    }, 150);
  };

  // 0 being bottom left, incrementing clockwise
  // eslint-disable-next-line
  const changeLegendPosition = (position: any) => {
    const colorArray = new Array(4).fill(BUTTON_COLORS.red);
    colorArray[position.index] = BUTTON_COLORS.green;
    setLegendPosition(position.position);
    setButtonColors(colorArray);
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
                    <div className={`mapLegend ${legendPosition}`}>
                      <div className="bg"></div>
                      <div className="compassInfo" ref={compassInfo}>
                        <img
                          src={north_arrow}
                          alt=""
                          ref={compassNeedle}
                          onLoad={() => setTimeout(() => setBoundingBox(), 50)}
                          style={{ transform: 'rotate(' + picture.rotation?.toPrecision(2) + 'rad)' }}
                        />
                      </div>
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
                            {fairwayCardInput.n2000HeightSystem ? ' - N2000 (BSCD2000)' : ' - MW'}
                          </em>
                        )}
                        <em className="danger">{getTranslatedText('fairwaycard.notForNavigation')}</em>
                        <div className="mapScale" style={{ width: (picture.scaleWidth ?? 100) + 'px' }}>
                          {picture.scaleLabel}
                        </div>
                        {/* refactor as an own component */}
                        <button
                          className={`legendPositionButton ${POSITION.bottomLeft.position} ${buttonColors[0]}`}
                          onClick={() => {
                            changeLegendPosition(POSITION.bottomLeft);
                          }}
                        />
                        <button
                          className={`legendPositionButton ${POSITION.topLeft.position} ${buttonColors[1]}`}
                          onClick={() => {
                            changeLegendPosition(POSITION.topLeft);
                          }}
                        />
                        <button
                          className={`legendPositionButton ${POSITION.topRight.position} ${buttonColors[2]}`}
                          onClick={() => {
                            changeLegendPosition(POSITION.topRight);
                          }}
                        />
                        <button
                          className={`legendPositionButton ${POSITION.bottomRight.position} ${buttonColors[3]}`}
                          onClick={() => {
                            changeLegendPosition(POSITION.bottomRight);
                          }}
                        />
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
