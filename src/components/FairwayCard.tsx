import React, { useState } from 'react';
import {
  IonBreadcrumb,
  IonBreadcrumbs,
  IonButton,
  IonCol,
  IonGrid,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { Fairway, HarborPartsFragment, Pilot, Quay, Text, Tug, useFindFairwayCardByIdQuery, Vts } from '../graphql/generated';
import { metresToNauticalMiles } from '../utils/conversions';
import { coordinatesToStringHDM } from '../utils/CoordinateUtils';
import { ReactComponent as PrintIcon } from '../theme/img/print.svg';
import { ReactComponent as InfoIcon } from '../theme/img/info.svg';
import { getCurrentDecimalSeparator } from '../utils/common';
import { useSetSelectedFairwayCard } from './layers';
import { Lang, MASTERSGUIDE_URLS, N2000_URLS, PILOTORDER_URL } from '../utils/constants';

type PhonenumberProps = {
  number?: string | null;
  title?: string;
  showEmpty?: boolean;
};

const Phonenumber: React.FC<PhonenumberProps> = ({ number, title, showEmpty }) => {
  return (
    <>
      {number && (
        <>
          {title && title + ': '}
          <a href={'tel:' + number} aria-label={number?.split('').join(' ')}>
            {number}
          </a>
        </>
      )}
      {!number && showEmpty && '-'}
    </>
  );
};

type ParagraphProps = {
  title?: string;
  bodyText?: Text;
  bodyTextList?: (Text | null)[] | null;
  showNoData?: boolean;
};

const Paragraph: React.FC<ParagraphProps> = ({ title, bodyText, bodyTextList, showNoData }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {bodyTextList &&
        bodyTextList.map((text, idx) => {
          return (
            <p key={idx}>
              {idx === 0 && title && <strong>{title}: </strong>}
              {text && text[lang]}
            </p>
          );
        })}
      {bodyText && (
        <p>
          {title && <strong>{title}: </strong>}
          {bodyText[lang]}
        </p>
      )}
      {showNoData && !bodyText && !bodyTextList && (
        <p>
          {title && <strong>{title}: </strong>} {t('noData')}
        </p>
      )}
    </>
  );
};

type InfoParagraphProps = {
  title?: string;
};

const InfoParagraph: React.FC<InfoParagraphProps> = ({ title }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  return (
    <p className="info use-flex ion-align-items-center">
      <InfoIcon />
      {title || t('noData')}
    </p>
  );
};

type FairwaysProps = {
  data?: Fairway[] | null;
  lineText?: Text | null;
  anchorageTexts?: (Text | null)[] | null;
  designSpeedText?: Text | null;
  isN2000HeightSystem?: boolean;
  inlineLabel?: boolean;
};

const LiningInfo: React.FC<FairwaysProps> = ({ data, lineText }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const primaryFairway = data?.find((fairway) => fairway.primary);

  // Calculate the sum of navigation lines excluding theoretical curves (typeCode '4')
  const extractNavigationLinesLength = () => {
    const totalLength = data?.reduce((sum, card) => {
      return (
        sum +
        ((card.navigationLines &&
          card.navigationLines.reduce((acc, line) => {
            return acc + ((line.typeCode !== '4' && line.length) || 0);
          }, 0)) ||
          0)
      );
    }, 0);
    return totalLength;
  };

  // Extract notation information from fairway areas
  const extractNotationInfo = () => {
    const lateralMarking = data?.find((fairway) => fairway.areas?.some((area) => area.notationCode === 1));
    const cardinalMarking = data?.find((fairway) => fairway.areas?.some((area) => area.notationCode === 2));

    if (lateralMarking) return t('lateralMarking') + (cardinalMarking ? ' / ' + t('cardinalMarking') : '');
    if (cardinalMarking) return t('cardinalMarking');
    return '';
  };

  const formatSentence = (str?: string | null, endSentence?: boolean) => {
    if (endSentence) return str?.trim() + (str?.trim().slice(-1) === '.' ? '' : '.');
    return str?.trim().slice(-1) === '.' ? str?.trim().slice(0, -1) : str?.trim();
  };

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('liningAndMarking')}: </strong>
            {t('starts')}: {formatSentence(primaryFairway?.startText)}, {t('ends')}: {formatSentence(primaryFairway?.endText, true)}{' '}
            {lineText && formatSentence(lineText[lang], true)} {t('length')}:{' '}
            {((extractNavigationLinesLength() || 0) / 1000).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <span aria-label={t('unit.kmDesc', { count: 3 })} role="definition">
              km
            </span>{' '}
            / {metresToNauticalMiles(extractNavigationLinesLength()).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <span aria-label={t('unit.nmDesc', { count: 2 })} role="definition">
              {t('unit.nm')}
            </span>
            . {t('fairway')} {primaryFairway?.lighting && primaryFairway?.lighting[lang]?.toLocaleLowerCase()}. {extractNotationInfo()}.
          </p>
        </IonText>
      )}
    </>
  );
};

const DimensionInfo: React.FC<FairwaysProps> = ({ data, designSpeedText, isN2000HeightSystem }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const sizingVessels =
    data
      ?.flatMap((fairway) => (fairway.sizingVessels ? fairway.sizingVessels : []))
      .filter((value, index, self) => self.findIndex((inner) => inner.type === value.type) === index) || [];
  const minimumWidths = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.minimumWidth).filter((val) => val)))];
  const minimumTurningCircles = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.minimumTurningCircle).filter((val) => val)))];
  const additionalTexts = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.additionalInformation).filter((val) => val)))];

  const designDraftValues = [
    ...Array.from(
      new Set(
        data?.flatMap((fairway) => fairway.areas?.map((area) => (area.n2000draft || area.draft)?.toLocaleString())).filter((val) => val !== undefined)
      )
    ),
  ];
  const sweptDepthValues = [
    ...Array.from(
      new Set(
        data?.flatMap((fairway) => fairway.areas?.map((area) => (area.n2000depth || area.depth)?.toLocaleString())).filter((val) => val !== undefined)
      )
    ),
  ];

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('fairwayDesignVessel', { count: sizingVessels.length || 1 })}: </strong>
            {sizingVessels.map((vessel, idx) => {
              return (
                <span key={idx}>
                  {vessel && (
                    <>
                      <br />
                      {t('designVessel')} {idx + 1}: {vessel.type} l = {vessel.length}&nbsp;
                      <span aria-label={t('unit.mDesc', { count: Number(vessel.length) })} role="definition">
                        m
                      </span>
                      , b = {vessel.width}&nbsp;
                      <span aria-label={t('unit.mDesc', { count: Number(vessel.width) })} role="definition">
                        m
                      </span>
                      , t = {vessel.draft}&nbsp;
                      <span aria-label={t('unit.mDesc', { count: Number(vessel.draft) })} role="definition">
                        m
                      </span>
                      .
                    </>
                  )}
                </span>
              );
            })}
            {sizingVessels.length < 1 && t('noData')}
          </p>
          <p>
            <strong>{t('fairwayDimensions')}: </strong>
            {t('designDraft', { count: designDraftValues.length })}: {designDraftValues.join(' / ')}&nbsp;
            <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
              m
            </span>
            . {t('sweptDepth', { count: sweptDepthValues.length })}: {sweptDepthValues.join(' / ')}&nbsp;
            <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
              m
            </span>
            {minimumWidths.length > 0 && (
              <>
                . {t('minimumWidth', { count: minimumWidths.length })}: {minimumWidths.join(' / ')}&nbsp;
                <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
                  m
                </span>
              </>
            )}
            {minimumTurningCircles.length > 0 && (
              <>
                {minimumWidths.length > 0 ? (
                  <>
                    {t('and')}
                    {t('minimumTurningCircle', { count: minimumTurningCircles.length }).toLocaleLowerCase()}
                  </>
                ) : (
                  <>. {t('minimumTurningCircle', { count: minimumTurningCircles.length })}</>
                )}
                : {minimumTurningCircles.join(' / ')}&nbsp;
                <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
                  m
                </span>
              </>
            )}
            . {designSpeedText && designSpeedText[lang]}
            {isN2000HeightSystem && (
              <>
                <br />
                <strong>{t('attention')}</strong> {t('n2000Info')}
                <br />
                <a href={'//' + N2000_URLS[lang]} target="_blank" rel="noreferrer">
                  {N2000_URLS[lang]}
                </a>
              </>
            )}
            {additionalTexts.length > 0 && (
              <>
                <br />
                {additionalTexts.join(' ')}
              </>
            )}
          </p>
        </IonText>
      )}
    </>
  );
};

const ProhibitionInfo: React.FC<FairwaysProps> = ({ data, inlineLabel }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const prohibitionAreas = data?.flatMap((fairway) => fairway.areas?.filter((area) => area.typeCode === 15)) || [];

  return (
    <>
      {data && (
        <>
          {!inlineLabel && <h5>{t('prohibitionAreas')}</h5>}
          <p>
            {inlineLabel && <strong>{t('prohibitionAreas')}: </strong>}
            {prohibitionAreas?.length > 0 && (
              <>
                {t('prohibitionText', { count: prohibitionAreas?.length })}{' '}
                <a href={'//' + MASTERSGUIDE_URLS[lang]} target="_blank" rel="noreferrer">
                  {MASTERSGUIDE_URLS[lang]}
                </a>
                .
                {prohibitionAreas.map((area, i) => (
                  <span key={i}>
                    {area?.additionalInformation && (
                      <>
                        <br />
                        {area?.additionalInformation}
                      </>
                    )}
                  </span>
                ))}
              </>
            )}
            {prohibitionAreas?.length < 1 && t('noData')}
          </p>
        </>
      )}
    </>
  );
};
const AnchorageInfo: React.FC<FairwaysProps> = ({ data, inlineLabel, anchorageTexts }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const anchorageAreas = data?.flatMap((fairway) => fairway.areas?.filter((area) => area.typeCode === 2)) || [];

  return (
    <>
      <Paragraph title={inlineLabel ? t('anchorage') : ''} bodyTextList={anchorageTexts} showNoData={anchorageAreas.length > 0} />
      <p>
        {anchorageAreas.map((area, i) => (
          <span key={i}>
            {area?.additionalInformation && (
              <>
                {area?.additionalInformation}
                <br />
              </>
            )}
          </span>
        ))}
      </p>
    </>
  );
};

const GeneralInfo: React.FC<FairwaysProps> = ({ data }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const minimumWidths = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.minimumWidth).filter((val) => val)))];
  const minimumTurningCircles = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.minimumTurningCircle).filter((val) => val)))];
  const reserveWaters = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.reserveWater?.trim()).filter((val) => val)))];

  return (
    <p>
      {t('minimumWidth', { count: minimumWidths.length })}: {minimumWidths.join(' / ') || '-'}&nbsp;
      <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
        m
      </span>
      <br />
      {t('minimumTurningCircle', { count: minimumTurningCircles.length })}: {minimumTurningCircles.join(' / ') || '-'}&nbsp;
      <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
        m
      </span>
      <br />
      {t('reserveWater', { count: reserveWaters.length })}: {reserveWaters.join(' / ').replaceAll('.', getCurrentDecimalSeparator()) || '-'}&nbsp;
      <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
        m
      </span>
    </p>
  );
};

const AreaInfo: React.FC<FairwaysProps> = ({ data }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const fairwayAreas = data?.flatMap((fairway) => fairway.areas) || [];

  return (
    <>
      {fairwayAreas.map((area, idx) => {
        const sizingSpeeds = [
          ...Array.from(
            new Set(
              area?.fairways
                ?.flatMap((fairway) => [fairway.sizingSpeed?.toLocaleString(), fairway.sizingSpeed2?.toLocaleString()])
                .filter((val) => val)
            )
          ),
        ];

        return (
          <p key={idx}>
            <em>
              {area?.name || (
                <>
                  {t('area')} {idx + 1}
                </>
              )}
            </em>
            <br />
            {t('designDraft', { count: 1 })}: {(area?.n2000draft || area?.draft)?.toLocaleString() || '-'}&nbsp;
            <span aria-label={t('unit.mDesc', { count: Number(area?.n2000draft || area?.draft) })} role="definition">
              m
            </span>
            <br />
            {t('sweptDepth', { count: 1 })}: {(area?.n2000depth || area?.depth)?.toLocaleString() || '-'}&nbsp;
            <span aria-label={t('unit.mDesc', { count: Number(area?.n2000depth || area?.depth) })} role="definition">
              m
            </span>
            {sizingSpeeds.length > 0 && (
              <>
                <br />
                {t('designSpeed')}: {sizingSpeeds.join(' / ').toLocaleString()}&nbsp;
                <span aria-label={t('unit.ktsDesc', { count: 0 })} role="definition">
                  kts
                </span>
              </>
            )}
            <br />
            {area?.notationCode === 1 ? t('lateralMarking') : ''}
            {area?.notationCode === 2 ? t('cardinalMarking') : ''}
          </p>
        );
      })}
    </>
  );
};

type PilotInfoProps = {
  data?: Pilot | null;
};

const PilotInfo: React.FC<PilotInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('pilotOrder')}: </strong>
            {t('email')}: <a href={'mailto:' + data.email}>{data.email}</a>
            <br />
            {t('orderFrom')}:{' '}
            <a href={'//' + PILOTORDER_URL} target="_blank" rel="noreferrer">
              {PILOTORDER_URL}
            </a>
            <br />
            <Phonenumber title={t('phone')} showEmpty number={data.phoneNumber} />
            <br />
            <Phonenumber title={t('fax')} showEmpty number={data.fax} />
            {data.places?.map((place, idx) => {
              return (
                <span key={idx}>
                  {place.geometry?.coordinates && (
                    <>
                      <br />
                      {t('pilotPlace')}
                      {' ' + place.name}:{' '}
                      {place.geometry?.coordinates[0] &&
                        place.geometry?.coordinates[1] &&
                        coordinatesToStringHDM([place.geometry?.coordinates[0], place.geometry.coordinates[1]])}
                      .
                      {place.pilotJourney && (
                        <>
                          {' '}
                          {t('pilotageDistance')}: {place.pilotJourney.toLocaleString()}&nbsp;
                          <span aria-label={t('unit.nmDesc', { count: place.pilotJourney })} role="definition">
                            {t('unit.nm')}
                          </span>
                          .
                        </>
                      )}
                    </>
                  )}
                </span>
              );
            })}
            {data.extraInfo && (
              <>
                <br />
                {data.extraInfo[lang]}
              </>
            )}
          </p>
        </IonText>
      )}
    </>
  );
};

type VTSInfoProps = {
  data?: Vts | null;
};

const VTSInfo: React.FC<VTSInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('vts')}: </strong>
            {data.name && data.name[lang]}, {t('vhf')}{' '}
            {data.vhf?.map((v) => (v?.name ? v.channel + ' (' + v?.name[lang] + ')' : v?.channel)).join(', ')}.{' '}
            <Phonenumber title={t('phone')} showEmpty number={data.phoneNumber} />,{' '}
            {data.email &&
              data.email?.map((email, idx) => {
                return (
                  <span key={idx}>
                    <a href={'mailto:' + email} key={idx}>
                      {email}
                    </a>
                    {Number(data?.email?.length) > idx + 1 ? t('and') : ''}
                  </span>
                );
              })}
          </p>
        </IonText>
      )}
    </>
  );
};

type TugInfoProps = {
  data?: (Tug | null)[] | null;
};

const TugInfo: React.FC<TugInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('tugs')}: </strong>
            {data.map((tug, idx) => {
              return (
                <span key={idx}>
                  {idx !== 0 && <br />}
                  {tug?.name && tug.name[lang]}
                  {tug?.phoneNumber && (
                    <>
                      {' '}
                      {t('phone')}
                      {': '}
                      {tug?.phoneNumber.map((phone, jdx) => {
                        return (
                          <span key={jdx}>
                            <Phonenumber number={phone} />
                            {Number(tug.phoneNumber?.length) > jdx + 1 ? t('and') : ' '}
                          </span>
                        );
                      })}
                    </>
                  )}
                </span>
              );
            })}
          </p>
        </IonText>
      )}
    </>
  );
};

type QuayInfoProps = {
  data?: (Quay | null)[] | null;
};

const QuayInfo: React.FC<QuayInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data &&
        data.map((quay, jdx) => {
          return (
            <p key={jdx}>
              {quay?.name && quay.name[lang]?.charAt(0).toLocaleUpperCase()}
              {quay?.name && quay.name[lang]?.slice(1)}
              {!quay?.name && t('quay')}
              {quay?.length && (
                <>
                  {' - '}
                  <em>
                    {t('length')} {quay?.length?.toLocaleString()}&nbsp;
                    <span aria-label={t('unit.mDesc', { count: Number(quay?.length) })} role="definition">
                      m
                    </span>
                  </em>
                </>
              )}
              {quay?.sections?.map((section, kdx) => {
                return (
                  <span key={kdx}>
                    <br />
                    {section?.name && section.name + ': '} {t('sweptDepth', { count: 1 })} {section?.depth?.toLocaleString()}&nbsp;
                    <span aria-label={t('unit.mDesc', { count: Number(section?.depth) })} role="definition">
                      m
                    </span>
                  </span>
                );
              })}
              {quay?.extraInfo && (
                <>
                  <br />
                  {quay.extraInfo[lang]?.charAt(0).toLocaleUpperCase()}
                  {quay.extraInfo[lang]?.slice(1)}.
                </>
              )}
            </p>
          );
        })}
    </>
  );
};

type ContactInfoProps = {
  data?: HarborPartsFragment | null;
};

const ContactInfo: React.FC<ContactInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  return (
    <>
      {data && (
        <p>
          {data.company && (
            <>
              <span>{data.company[lang]}</span>
              <br />
            </>
          )}
          {data.internet && (
            <>
              <a href={data.internet} target="_blank" rel="noreferrer">
                {data.internet}
              </a>
              <br />
            </>
          )}
          {t('phone')}:{' '}
          {data.phoneNumber?.map((phone, idx) => {
            return (
              <span key={idx}>
                <Phonenumber number={phone} />
                {Number(data.phoneNumber?.length) > idx + 1 ? t('and') : ''}
              </span>
            );
          })}
          {data.fax && (
            <>
              <br />
              {t('fax')}: <Phonenumber number={data.fax} />
            </>
          )}
          <br />
          {t('email')}: {data.email ? <a href={'mailto:' + data.email}>{data.email}</a> : '-'}
        </p>
      )}
    </>
  );
};

type HarbourInfoProps = {
  data?: HarborPartsFragment | null;
};

const HarbourInfo: React.FC<HarbourInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data && (
        <>
          <IonText className="no-margin-top">
            <h4>
              <strong>{data.name && data.name[lang]}</strong>
            </h4>
          </IonText>
          <IonText>
            <h5>{t('restrictions')}</h5>
            {(data.extraInfo && <p>{data.extraInfo[lang]}</p>) || <InfoParagraph title={t('noRestrictions')} />}
          </IonText>
          <IonText>
            <h5>{t('quays')}</h5>
            {(data.quays && <QuayInfo data={data?.quays} />) || <InfoParagraph />}
          </IonText>
          <IonText>
            <h5>{t('cargo')}</h5>
            {data.cargo?.map((cargo, jdx) => {
              return <p key={jdx}>{cargo && cargo[lang]}</p>;
            }) || <InfoParagraph />}
          </IonText>
          <IonText>
            <h5>{t('harbourBasin')}</h5>
            {(data.harborBasin && <p>{data.harborBasin[lang]}</p>) || <InfoParagraph />}
          </IonText>
          <IonText>
            <h5>{t('contactDetails')}</h5>
            <ContactInfo data={data} />
          </IonText>
        </>
      )}
    </>
  );
};

type FairwayCardProps = {
  id: string;
  widePane?: boolean;
};

const FairwayCard: React.FC<FairwayCardProps> = ({ id, widePane }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const [tab, setTab] = useState<string>('1');
  const lang = i18n.resolvedLanguage as Lang;
  const { data, loading } = useFindFairwayCardByIdQuery({
    variables: {
      id: id,
    },
  });

  const primaryFairway = data?.fairwayCard?.fairways.find((fairway) => fairway.primary);
  const isN2000HeightSystem = typeof primaryFairway?.navigationLines?.find((line) => line.n2000ReferenceLevel === 'N2000') == 'object';

  useSetSelectedFairwayCard(data);

  return (
    <>
      {loading && (
        <>
          <IonBreadcrumbs>
            <IonSkeletonText animated={true} style={{ width: '100%', height: widePane ? '24px' : '48px', margin: '0' }}></IonSkeletonText>
          </IonBreadcrumbs>
          <IonText>
            <h2 className="no-margin-bottom">
              <IonSkeletonText animated={true} style={{ width: '100%', height: '30px' }}></IonSkeletonText>
            </h2>
            <IonSkeletonText animated={true} style={{ width: '150px', height: '14px', margin: '0' }}></IonSkeletonText>
          </IonText>
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50px', marginTop: '20px' }}></IonSkeletonText>
          <IonSkeletonText animated={true} style={{ width: '100%', height: '50vh', marginTop: '20px' }}></IonSkeletonText>
        </>
      )}

      {!loading && (
        <>
          <IonBreadcrumbs>
            <IonBreadcrumb routerLink="/">
              {t('home')}
              <IonLabel slot="separator">&gt;</IonLabel>
            </IonBreadcrumb>
            <IonBreadcrumb routerLink="/vaylakortit/">
              {t('title', { count: 0 })}
              <IonLabel slot="separator">&gt;</IonLabel>
            </IonBreadcrumb>
            <IonBreadcrumb routerLink={'/vaylakortit/' + id}>
              {data?.fairwayCard?.name[lang]}
              <IonLabel slot="separator">&gt;</IonLabel>
            </IonBreadcrumb>
            <IonBreadcrumb>
              <strong>{t('title', { count: 1 })}</strong>
            </IonBreadcrumb>
          </IonBreadcrumbs>

          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol>
                <IonText>
                  <h2 className="no-margin-bottom">
                    <strong>{data?.fairwayCard?.name[lang]}</strong>
                  </h2>
                  <small>
                    <em>
                      {t('modified')}{' '}
                      {t('modifiedDate', {
                        val: data?.fairwayCard?.modificationTimestamp ? new Date(data?.fairwayCard?.modificationTimestamp * 1000) : '-',
                      })}
                      {isN2000HeightSystem ? ' - N2000 (BSCD2000)' : ' - MW'}
                    </em>
                  </small>
                </IonText>
              </IonCol>
              <IonCol size="auto" className="ion-align-self-center">
                <IonButton
                  fill="clear"
                  className="icon-only small"
                  onClick={() => window.print()}
                  title={t('print')}
                  aria-label={t('print')}
                  role="button"
                  data-testid="printButton"
                >
                  <PrintIcon />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonSegment className="tabs" onIonChange={(e) => setTab(e.detail.value || '1')} value={tab} mode="md" data-testid="tabChange">
            <IonSegmentButton value="1">
              <IonLabel>
                <h3>{t('title', { count: 0 })}</h3>
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="2">
              <IonLabel>
                <h3>{t('harboursTitle')}</h3>
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="3">
              <IonLabel>
                <h3>{t('areasTitle')}</h3>
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {tab === '1' && (
            <div className={'tabContent' + (widePane ? ' wide' : '')}>
              <IonText className="no-margin-top">
                <h4>
                  <strong>{t('information')}</strong>
                </h4>
              </IonText>
              <LiningInfo data={data?.fairwayCard?.fairways} lineText={data?.fairwayCard?.lineText} />
              <DimensionInfo
                data={data?.fairwayCard?.fairways}
                designSpeedText={data?.fairwayCard?.designSpeed}
                isN2000HeightSystem={isN2000HeightSystem}
              />
              <IonText>
                <Paragraph title={t('attention')} bodyText={data?.fairwayCard?.attention || undefined} />
                <ProhibitionInfo data={data?.fairwayCard?.fairways} inlineLabel />
                <Paragraph title={t('speedLimit')} bodyTextList={data?.fairwayCard?.speedLimit} showNoData />
                <AnchorageInfo data={data?.fairwayCard?.fairways} anchorageTexts={data?.fairwayCard?.anchorage} inlineLabel />
              </IonText>

              <IonText>
                <h4>
                  <strong>{t('navigation')}</strong>
                </h4>
                <Paragraph bodyText={data?.fairwayCard?.generalInfo || undefined} />
                <Paragraph title={t('navigationCondition')} bodyText={data?.fairwayCard?.navigationCondition || undefined} showNoData />
                <Paragraph title={t('iceCondition')} bodyText={data?.fairwayCard?.iceCondition || undefined} showNoData />
              </IonText>

              <IonText>
                <h4>
                  <strong>
                    {t('recommendations')} <span>({t('fairwayAndHarbour')})</span>
                  </strong>
                </h4>
                <Paragraph title={t('windRecommendation')} bodyText={data?.fairwayCard?.windRecommendation || undefined} showNoData />
                <Paragraph title={t('vesselRecommendation')} bodyText={data?.fairwayCard?.vesselRecommendation || undefined} showNoData />
                <Paragraph title={t('visibilityRecommendation')} bodyText={data?.fairwayCard?.visibility || undefined} showNoData />
                <Paragraph title={t('windGauge')} bodyText={data?.fairwayCard?.windGauge || undefined} showNoData />
                <Paragraph title={t('seaLevel')} bodyText={data?.fairwayCard?.seaLevel || undefined} showNoData />
              </IonText>

              <IonText>
                <h4>
                  <strong>{t('trafficServices')}</strong>
                </h4>
              </IonText>
              <PilotInfo data={data?.fairwayCard?.trafficService?.pilot} />
              <VTSInfo data={data?.fairwayCard?.trafficService?.vts} />
              <TugInfo data={data?.fairwayCard?.trafficService?.tugs} />
            </div>
          )}

          {tab === '2' && (
            <div className={'tabContent' + (widePane ? ' wide' : '')}>
              {data?.fairwayCard?.harbors?.map((harbour, idx) => {
                return <HarbourInfo data={harbour} key={idx} />;
              })}
              {!data?.fairwayCard?.harbors && (
                <IonText>
                  <InfoParagraph />
                </IonText>
              )}
            </div>
          )}

          {tab === '3' && (
            <div className={'tabContent' + (widePane ? ' wide' : '')}>
              <IonText className="no-margin-top">
                <h5>{t('commonInformation')}</h5>
                <GeneralInfo data={data?.fairwayCard?.fairways} />
                <ProhibitionInfo data={data?.fairwayCard?.fairways} />
                <h5>{t('speedLimit')}</h5>
                <Paragraph bodyTextList={data?.fairwayCard?.speedLimit} showNoData />
                <h5>{t('anchorage')}</h5>
                <AnchorageInfo data={data?.fairwayCard?.fairways} anchorageTexts={data?.fairwayCard?.anchorage} />
                <h5>{t('fairwayAreas')}</h5>
                <AreaInfo data={data?.fairwayCard?.fairways} />
              </IonText>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default FairwayCard;
