import React, { useState } from 'react';
import { IonBreadcrumbs, IonButton, IonCol, IonGrid, IonLabel, IonRow, IonSegment, IonSegmentButton, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Fairway, HarborPartsFragment, Pilot, Quay, Text, Tug, Vts } from '../../graphql/generated';
import { metresToNauticalMiles } from '../../utils/conversions';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { ReactComponent as PrintIcon } from '../../theme/img/print.svg';
import { getCurrentDecimalSeparator, isMobile } from '../../utils/common';
import { setSelectedFairwayCard, setSelectedPilotPlace } from '../layers';
import { Lang, MASTERSGUIDE_URLS, N2000_URLS, PILOTORDER_URL } from '../../utils/constants';
import PrintMap from '../PrintMap';
import { useFairwayCardListData } from '../../utils/dataLoader';
import Breadcrumb from './Breadcrumb';
import Paragraph, { InfoParagraph } from './Paragraph';
import Phonenumber from './Phonenumber';
import { useDvkContext } from '../../hooks/dvkContext';

type FairwaysProps = {
  data?: Fairway[] | null;
  lineText?: Text | null;
  speedLimitText?: Text | null;
  anchorageText?: Text | null;
  designSpeedText?: Text | null;
  isN2000HeightSystem?: boolean;
  inlineLabel?: boolean;
};

const LiningInfo: React.FC<FairwaysProps> = ({ data, lineText }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const primaryFairway = data?.find((fairway) => fairway.primary);
  const secondaryFairway = data?.find((fairway) => fairway.secondary) || primaryFairway;

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

  const extractLightingInfo = () => {
    switch (primaryFairway?.lightingCode) {
      case '1':
        return t('fairwayLit');
      case '2':
        return t('fairwayUnlit');
      default:
        return t('lightingUnknown');
    }
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
    if (str) {
      if (endSentence) return str.trim() + (str.trim().slice(-1) === '.' ? '' : '.');
      return str.trim().slice(-1) === '.' ? str.trim().slice(0, -1) : str.trim();
    } else {
      return '';
    }
  };

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('liningAndMarking')}: </strong>
            {t('starts')}: {formatSentence(primaryFairway?.startText)}, {t('ends')}: {formatSentence(secondaryFairway?.endText, true)}{' '}
            {lineText && formatSentence(lineText[lang], true)} {t('length')}:{' '}
            {((extractNavigationLinesLength() || 0) / 1000).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <span aria-label={t('unit.kmDesc', { count: 3 })} role="definition">
              km
            </span>{' '}
            / {metresToNauticalMiles(extractNavigationLinesLength()).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <span aria-label={t('unit.nmDesc', { count: 2 })} role="definition">
              {t('unit.nm')}
            </span>
            . {extractLightingInfo()}. {extractNotationInfo()}.
          </p>
        </IonText>
      )}
    </>
  );
};

const DimensionInfo: React.FC<FairwaysProps> = ({ data, designSpeedText, isN2000HeightSystem }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

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
        data
          ?.flatMap((fairway) => fairway.areas?.map((area) => (isN2000HeightSystem ? area.n2000draft : area.draft)?.toLocaleString()))
          .filter((val) => val !== undefined && val !== '0')
      )
    ),
  ];
  const sweptDepthValues = [
    ...Array.from(
      new Set(
        data
          ?.flatMap((fairway) => fairway.areas?.map((area) => (isN2000HeightSystem ? area.n2000depth : area.depth)?.toLocaleString()))
          .filter((val) => val !== undefined)
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
                      {t('designVessel')} {idx + 1}: {t('vesselType' + vessel.typeCode)}, l = {vessel.length}&nbsp;
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
            {sizingVessels.length < 1 && t('noDataSet')}
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
                <a href={'//' + N2000_URLS[lang]} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
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
  const { state } = useDvkContext();

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
                <a href={'//' + MASTERSGUIDE_URLS[lang]} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
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
            {prohibitionAreas?.length < 1 && t('noDataSet')}
          </p>
        </>
      )}
    </>
  );
};

const SpeedLimitInfo: React.FC<FairwaysProps> = ({ data, speedLimitText, inlineLabel }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const speedLimits =
    data
      ?.flatMap((fairway) =>
        fairway.restrictionAreas?.filter((area) => (area.types?.filter((type) => type.code === '01') || []).length > 0 && area.location && area.value)
      )
      .filter(
        (value, index, self) =>
          self.findIndex((inner) => inner?.id === value?.id || (inner?.location === value?.location && inner?.value === value?.value)) === index
      ) || [];

  return (
    <>
      <p>
        {inlineLabel && speedLimits.length > 0 && <strong>{t('speedLimit')}: </strong>}
        {speedLimits.map((area, idx) => (
          <span key={'limit-' + area?.id}>
            {(inlineLabel || idx > 0) && <br />}
            {t('speedLimitAt')} {area?.location}: {area?.value}{' '}
            <span aria-label={t('unit.kmhDesc', { count: area?.value || 0 })} role="definition">
              km/h
            </span>
          </span>
        ))}
      </p>
      <Paragraph
        title={inlineLabel && speedLimits.length < 1 ? t('speedLimit') : ''}
        bodyText={speedLimitText || undefined}
        showNoData={speedLimits.length < 1}
      />
    </>
  );
};

const AnchorageInfo: React.FC<FairwaysProps> = ({ data, inlineLabel, anchorageText }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const anchorageAreas = data?.flatMap((fairway) => fairway.areas?.filter((area) => area.typeCode === 2)) || [];

  return (
    <>
      <Paragraph title={inlineLabel ? t('anchorage') : ''} bodyText={anchorageText || undefined} showNoData={anchorageAreas.length > 0} />
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

const AreaInfo: React.FC<FairwaysProps> = ({ data, isN2000HeightSystem }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const fairwayAreas =
    data?.flatMap((fairway) =>
      fairway.areas?.sort((a, b) => {
        const areaFairwayA = a.fairways?.find((f) => f.fairwayId === fairway.id);
        const areaFairwayB = b.fairways?.find((f) => f.fairwayId === fairway.id);
        const sequenceNumberA = areaFairwayA?.sequenceNumber ?? 0;
        const sequenceNumberB = areaFairwayB?.sequenceNumber ?? 0;
        return sequenceNumberA - sequenceNumberB;
      })
    ) || [];

  return (
    <ol>
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
        const isDraftAvailable = ((isN2000HeightSystem ? area?.n2000draft : area?.draft) || 0) > 0;

        return (
          <li key={idx}>
            <em>{area?.name || <>{t('areaType' + area?.typeCode)}</>}</em>
            {isDraftAvailable && (
              <>
                <br />
                {t('designDraft', { count: 1 })}: {(isN2000HeightSystem ? area?.n2000draft : area?.draft)?.toLocaleString() || '-'}&nbsp;
                <span aria-label={t('unit.mDesc', { count: Number(isN2000HeightSystem ? area?.n2000draft : area?.draft) })} role="definition">
                  m
                </span>
              </>
            )}
            <br />
            {t('sweptDepth', { count: 1 })}: {(isN2000HeightSystem ? area?.n2000depth : area?.depth)?.toLocaleString() || '-'}&nbsp;
            <span aria-label={t('unit.mDesc', { count: Number(isN2000HeightSystem ? area?.n2000depth : area?.depth) })} role="definition">
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
          </li>
        );
      })}
    </ol>
  );
};

type PilotInfoProps = {
  data?: Pilot | null;
};

const PilotInfo: React.FC<PilotInfoProps> = ({ data }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const highlightPilot = (id: string | number) => {
    setSelectedPilotPlace(id);
  };

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('pilotOrder')}: </strong>
            {t('email')}: <a href={'mailto:' + data.email}>{data.email}</a>
            <br />
            {t('orderFrom')}:{' '}
            <a href={'//' + PILOTORDER_URL} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
              {PILOTORDER_URL}
            </a>
            <br />
            <Phonenumber title={t('phone')} showEmpty number={data.phoneNumber} />
            <br />
            <Phonenumber title={t('fax')} showEmpty number={data.fax} />
            {data.places?.map((place, idx) => {
              return (
                <IonLabel
                  key={place.id}
                  className="hoverText"
                  onMouseOver={() => highlightPilot(place.id)}
                  onFocus={() => highlightPilot(place.id)}
                  onMouseOut={() => highlightPilot(0)}
                  onBlur={() => highlightPilot(0)}
                  tabIndex={0}
                  data-testid={idx < 1 ? 'pilotPlaceHover' : ''}
                >
                  {place.geometry?.coordinates && (
                    <>
                      {t('pilotPlace')} {place.name[lang]}:{' '}
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
                </IonLabel>
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
  const { state } = useDvkContext();

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
              <a href={data.internet} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
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
            <h5>{t('restrictions')}</h5>
            {(data.extraInfo && <p>{data.extraInfo[lang]}</p>) || <InfoParagraph title={t('noRestrictions')} />}
          </IonText>
          <IonText>
            <h5>{t('quays')}</h5>
            <div className="printGrid">{(data.quays && <QuayInfo data={data?.quays} />) || <InfoParagraph />}</div>
          </IonText>
          <IonText>
            <h5>{t('cargo')}</h5>
            {(data.cargo && <p>{data.cargo[lang]}</p>) || <InfoParagraph />}
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

  const { data, isLoading, dataUpdatedAt, isFetching } = useFairwayCardListData();
  const filteredFairwayCard = data?.fairwayCards.filter((card) => card.id === id);
  const fairwayCard = filteredFairwayCard && filteredFairwayCard.length > 0 ? filteredFairwayCard[0] : undefined;

  const isN2000HeightSystem = !!fairwayCard?.n2000HeightSystem;

  const getTabLabel = (tabId: string): string => {
    switch (tabId) {
      case '1':
        return t('title', { count: 1 });
      case '2':
        return t('harboursTitle');
      case '3':
        return t('areasTitle');
      default:
        return '-';
    }
  };

  const path = [
    {
      title: t('title', { count: 0 }),
      route: '/kortit/',
    },
    {
      title: fairwayCard?.name[lang] || fairwayCard?.name.fi || '',
      route: '/kortit/' + id,
      onClick: () => {
        setSelectedFairwayCard(fairwayCard);
      },
    },
    {
      title: getTabLabel(tab),
    },
  ];

  return (
    <>
      {isLoading && (
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

      {!isLoading && (
        <>
          <Breadcrumb path={path} />

          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol>
                <IonText className="fairwayTitle" id="mainPageContent">
                  <h2 className="no-margin-bottom">
                    <strong>{fairwayCard?.name[lang]}</strong>
                  </h2>
                </IonText>
              </IonCol>
              <IonCol size="auto" className="ion-align-self-end">
                <IonButton
                  fill="clear"
                  className="icon-only small no-mobile no-print"
                  onClick={() => window.print()}
                  title={t('print')}
                  aria-label={t('print')}
                  role="button"
                  data-testid="printButton"
                >
                  <PrintIcon />
                </IonButton>
                <IonText className="fairwayTitle printable">
                  <h3 className="no-margin-bottom">{t('title', { count: 1 })}</h3>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonText className="fairwayTitle">
                  <em>
                    {t('modified')}{' '}
                    {t('modifiedDate', {
                      val: fairwayCard?.modificationTimestamp ? fairwayCard?.modificationTimestamp : '-',
                    })}
                    {isN2000HeightSystem ? ' - N2000 (BSCD2000)' : ' - MW'}
                  </em>
                  <br />
                  <em className="no-print">
                    {t('dataUpdated')} {!isLoading && !isFetching && <>{t('datetimeFormat', { val: dataUpdatedAt })}</>}
                    {(isLoading || isFetching) && (
                      <IonSkeletonText
                        animated={true}
                        style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
                      />
                    )}
                  </em>
                </IonText>
              </IonCol>
              <IonCol size="auto" className="ion-align-self-start">
                <IonText className="fairwayTitle">
                  <em>{t('notForNavigation')}</em>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonSegment className="tabs" onIonChange={(e) => setTab(e.detail.value || '1')} value={tab} data-testid="tabChange">
            {['1', '2', '3'].map((tabId) => (
              <IonSegmentButton key={tabId} value={tabId}>
                <IonLabel>
                  <h3>{getTabLabel(tabId)}</h3>
                </IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

          <div className={'tabContent tab1' + (widePane ? ' wide' : '') + (tab === '1' ? ' active' : '')}>
            <IonText className="no-margin-top">
              <h4>
                <strong>{t('information')}</strong>
              </h4>
            </IonText>
            <LiningInfo data={fairwayCard?.fairways} lineText={fairwayCard?.lineText} />
            <DimensionInfo data={fairwayCard?.fairways} designSpeedText={fairwayCard?.designSpeed} isN2000HeightSystem={isN2000HeightSystem} />
            <IonText>
              <Paragraph title={t('attention')} bodyText={fairwayCard?.attention || undefined} />
              <ProhibitionInfo data={fairwayCard?.fairways} inlineLabel />
              <SpeedLimitInfo data={fairwayCard?.fairways} speedLimitText={fairwayCard?.speedLimit} inlineLabel />
              <AnchorageInfo data={fairwayCard?.fairways} anchorageText={fairwayCard?.anchorage} inlineLabel />
            </IonText>

            <IonText>
              <h4>
                <strong>{t('navigation')}</strong>
              </h4>
              <Paragraph bodyText={fairwayCard?.generalInfo || undefined} />
              <Paragraph title={t('navigationCondition')} bodyText={fairwayCard?.navigationCondition || undefined} showNoData />
              <Paragraph title={t('iceCondition')} bodyText={fairwayCard?.iceCondition || undefined} showNoData />
            </IonText>

            <IonText>
              <h4>
                <strong>
                  {t('recommendations')} <span>({t('fairwayAndHarbour')})</span>
                </strong>
              </h4>
              <Paragraph title={t('windRecommendation')} bodyText={fairwayCard?.windRecommendation || undefined} showNoData />
              <Paragraph title={t('vesselRecommendation')} bodyText={fairwayCard?.vesselRecommendation || undefined} showNoData />
              <Paragraph title={t('visibilityRecommendation')} bodyText={fairwayCard?.visibility || undefined} showNoData />
              <Paragraph title={t('windGauge')} bodyText={fairwayCard?.windGauge || undefined} showNoData />
              <Paragraph title={t('seaLevel')} bodyText={fairwayCard?.seaLevel || undefined} showNoData />
            </IonText>

            <IonText>
              <h4>
                <strong>{t('trafficServices')}</strong>
              </h4>
            </IonText>
            <PilotInfo data={fairwayCard?.trafficService?.pilot} />
            {fairwayCard?.trafficService?.vts?.map((vts: Vts | null | undefined, idx: React.Key | null | undefined) => {
              return <VTSInfo data={vts} key={idx} />;
            })}
            <TugInfo data={fairwayCard?.trafficService?.tugs} />
          </div>

          <div className={'tabContent tab2' + (widePane ? ' wide' : '') + (tab === '2' ? ' active' : '')}>
            {fairwayCard?.harbors?.map((harbour: HarborPartsFragment | null | undefined, idx: React.Key | null | undefined) => {
              return <HarbourInfo data={harbour} key={idx} />;
            })}
            {(!fairwayCard?.harbors || fairwayCard?.harbors?.length === 0) && (
              <IonText className="no-print">
                <InfoParagraph />
              </IonText>
            )}
          </div>

          <div className={'tabContent tab3' + (widePane ? ' wide' : '') + (tab === '3' ? ' active' : '')}>
            <IonText className="no-margin-top">
              <h5>{t('commonInformation')}</h5>
              <GeneralInfo data={fairwayCard?.fairways} />
              <ProhibitionInfo data={fairwayCard?.fairways} />
              <h5>{t('speedLimit')}</h5>
              <SpeedLimitInfo data={fairwayCard?.fairways} speedLimitText={fairwayCard?.speedLimit} />
              <h5>{t('anchorage')}</h5>
              <AnchorageInfo data={fairwayCard?.fairways} anchorageText={fairwayCard?.anchorage} />
              <h5>{t('fairwayAreas')}</h5>
              <AreaInfo data={fairwayCard?.fairways} />
            </IonText>
          </div>
          {!isMobile() && (
            <>
              <div className="pagebreak" />
              <PrintMap
                name={fairwayCard?.name || undefined}
                modified={fairwayCard?.modificationTimestamp || undefined}
                isN2000={isN2000HeightSystem}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default FairwayCard;
