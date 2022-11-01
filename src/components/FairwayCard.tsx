import React, { useEffect, useState } from 'react';
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
import { AreaFairway, Fairway, Harbor, Pilot, Quay, Text, Tug, useFindFairwayCardByIdQuery, Vts } from '../graphql/generated';
import { metresToNauticalMiles } from '../utils/conversions';
import { coordinatesToStringHDM } from '../utils/CoordinateUtils';
import { ReactComponent as PrintIcon } from '../theme/img/print.svg';
import { ReactComponent as InfoIcon } from '../theme/img/info.svg';
import { getCurrentDecimalSeparator } from '../utils/common';
import { useMap } from './DvkMap';
import Select from 'ol/interaction/Select';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import VectorSource from 'ol/source/Vector';

type Lang = 'fi' | 'sv' | 'en';

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
};

const Paragraph: React.FC<ParagraphProps> = ({ title, bodyText, bodyTextList }) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
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

type FairwayProps = {
  data?: Fairway | null;
  lineText?: Text | null;
};

const LiningInfo: React.FC<FairwayProps> = ({ data, lineText }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  // Calculate the sum of navigation lines excluding theoretical curves (typeCode '4')
  const extractNavigationLinesLength = () => {
    const totalLength =
      data?.navigationLines &&
      data?.navigationLines.reduce((acc, line) => {
        return acc + ((line.typeCode !== '4' && line.length) || 0);
      }, 0);
    return totalLength;
  };

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('liningAndMarking')}: </strong>
            {t('starts')}: {data.startText}, {t('ends')}: {data.endText}. {lineText && lineText[lang]} {t('length')}:{' '}
            {((extractNavigationLinesLength() || 0) / 1000).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <span aria-label={t('unit.kmDesc', { count: 3 })} role="definition">
              km
            </span>{' '}
            / {metresToNauticalMiles(extractNavigationLinesLength()).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <span aria-label={t('unit.nmDesc', { count: 2 })} role="definition">
              {t('unit.nm')}
            </span>
            . {t('fairway')} {data.lighting && data.lighting[lang]?.toLocaleLowerCase()}. &lt;Lateraalimerkintä/Kardinaalimerkintä&gt;
          </p>
        </IonText>
      )}
    </>
  );
};

const DimensionInfo: React.FC<FairwayProps> = ({ data }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('fairwayDesignVessel', { count: data.sizingVessels?.length || 1 })}: </strong>
            {data &&
              data.sizingVessels?.map((vessel, idx) => {
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
          </p>
          <p>
            <strong>{t('fairwayDimensions')}: </strong>
            {data && data.sizing && (
              <>
                {data.sizing.minimumWidth && (
                  <>
                    {t('designDraft')}: X&nbsp;
                    <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
                      m
                    </span>
                    .{' '}
                  </>
                )}
                {data.sizing.minimumWidth && (
                  <>
                    {t('sweptDepths')}: Y&nbsp;
                    <span aria-label={t('unit.mDesc', { count: 0 })} role="definition">
                      m
                    </span>
                    .{' '}
                  </>
                )}
                {data.sizing.minimumWidth && (
                  <>
                    {t('minimumWidth')}: {data.sizing.minimumWidth}&nbsp;
                    <span aria-label={t('unit.mDesc', { count: Number(data.sizing.minimumWidth) })} role="definition">
                      m
                    </span>
                  </>
                )}
                {data.sizing.minimumTurningCircle && (
                  <>
                    {t('and')}
                    {t('minimumTurningCircle').toLocaleLowerCase()}: {data.sizing.minimumTurningCircle}&nbsp;
                    <span aria-label={t('unit.mDesc', { count: Number(data.sizing.minimumTurningCircle) })} role="definition">
                      m
                    </span>
                    .{' '}
                  </>
                )}
                {data.sizing.minimumTurningCircle && (
                  <>
                    {t('designSpeed')}: Z&nbsp;
                    <span aria-label={t('unit.ktsDesc', { count: 0 })} role="definition">
                      kts
                    </span>
                    .
                  </>
                )}
                <br />
                {data.sizing.additionalInformation}
              </>
            )}
          </p>
        </IonText>
      )}
    </>
  );
};

const GeneralInfo: React.FC<FairwayProps> = ({ data }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  return (
    <>
      {data && (
        <p>
          {data.sizing && (
            <>
              {t('minimumWidth')}: {data.sizing.minimumWidth || '-'}&nbsp;
              <span aria-label={t('unit.mDesc', { count: Number(data.sizing.minimumWidth) })} role="definition">
                m
              </span>
              <br />
              {t('minimumTurningCircle')}: {data.sizing.minimumTurningCircle || '-'}&nbsp;
              <span aria-label={t('unit.mDesc', { count: Number(data.sizing.minimumTurningCircle) })} role="definition">
                m
              </span>
              <br />
              {t('reserveWater')}: {data.sizing.reserveWater?.replaceAll('.', getCurrentDecimalSeparator()).trim() || '-'}&nbsp;
              <span aria-label={t('unit.mDesc', { count: Number(data.sizing.reserveWater) })} role="definition">
                m
              </span>
            </>
          )}
        </p>
      )}
    </>
  );
};

const AreaInfo: React.FC<FairwayProps> = ({ data }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const getSizingSpeed = (areaFairways?: AreaFairway[] | null) => {
    const filtered = areaFairways?.filter((fairway) => fairway.sizingSpeed || fairway.sizingSpeed2);
    return filtered && filtered.length > 0 ? filtered[0] : null;
  };

  return (
    <>
      {data &&
        data.areas?.map((area, idx) => {
          const sizingData = getSizingSpeed(area.fairways);
          return (
            <p key={idx}>
              <em>
                {area.name || (
                  <>
                    {t('area')} {idx + 1}
                  </>
                )}
              </em>
              <br />
              {t('designDraft')}: {area.n2000depth?.toLocaleString() || area.depth?.toLocaleString() || '-'}&nbsp;
              <span aria-label={t('unit.mDesc', { count: Number(area.depth) })} role="definition">
                m
              </span>
              <br />
              {t('sweptDepth')}: {area.n2000draft?.toLocaleString() || area.draft?.toLocaleString() || '-'}&nbsp;
              <span aria-label={t('unit.mDesc', { count: Number(area.draft) })} role="definition">
                m
              </span>
              {sizingData && (
                <>
                  <br />
                  {t('designSpeed')}: {sizingData.sizingSpeed?.toLocaleString()}
                  {sizingData.sizingSpeed2 ? <>&nbsp;/&nbsp;{sizingData.sizingSpeed2}</> : ''}&nbsp;
                  <span aria-label={t('unit.ktsDesc', { count: Number(area.draft) })} role="definition">
                    kts
                  </span>
                </>
              )}
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
            <a href="//www.pilotonline.fi" target="_blank" rel="noreferrer">
              www.pilotonline.fi
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
            {data.name && data.name[lang]}, {t('vhf')} {data.vhf}. <Phonenumber title={t('phone')} showEmpty number={data.phoneNumber} />,{' '}
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
                    {section?.name && section.name + ': '} {t('sweptDepth')} {section?.draft?.toLocaleString()}&nbsp;
                    <span aria-label={t('unit.mDesc', { count: Number(section?.draft) })} role="definition">
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
  data?: Harbor | null;
};

const ContactInfo: React.FC<ContactInfoProps> = ({ data }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  return (
    <>
      {data && (
        <p>
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
  data?: Harbor | null;
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

  const extractPrimaryFairway = () => {
    return data?.fairwayCard?.fairways.find((fairway) => fairway.primary);
  };

  const isN2000HeightSystem = () => {
    const primaryFairway = extractPrimaryFairway();
    const n2000Line = primaryFairway?.navigationLines?.find((line) => line.n2000ReferenceLevel === 'N2000');
    return n2000Line;
  };

  const dvkMap = useMap();
  useEffect(() => {
    if (data) {
      const style = new Style({
        stroke: new Stroke({
          color: '#0000FF',
          width: 2,
        }),
      });
      const features: Feature<Geometry>[] = [];
      const lineLayer = dvkMap.olMap?.getAllLayers().find((layer) => layer.getProperties().id === 'line12');
      const source = lineLayer?.getSource() as VectorSource;
      for (const fairway of data?.fairwayCard?.fairways || []) {
        for (const line of fairway.navigationLines || []) {
          features.push(source.getFeatureById(line.id) as Feature<Geometry>);
        }
      }
      console.log('features: ' + features.length);
      const selectFairwayFeatures = new Select({
        style,
      });
      dvkMap.olMap?.addInteraction(selectFairwayFeatures);
      for (const feature of features) {
        selectFairwayFeatures.getFeatures().push(feature);
      }
    }
  }, [dvkMap, data]);

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
                      {isN2000HeightSystem() ? ' - N2000 (BSCD2000)' : ' - MW'}
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
                >
                  <PrintIcon />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonSegment className="tabs" onIonChange={(e) => setTab(e.detail.value || '1')} value={tab} mode="md">
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
              <LiningInfo data={extractPrimaryFairway()} lineText={data?.fairwayCard?.lineText} />
              <DimensionInfo data={extractPrimaryFairway()} />
              <IonText>
                <Paragraph title={t('attention')} bodyText={data?.fairwayCard?.attention || undefined} />
                <Paragraph title={t('anchorage')} bodyTextList={data?.fairwayCard?.anchorage} />
              </IonText>

              <IonText>
                <h4>
                  <strong>{t('navigation')}</strong>
                </h4>
                <Paragraph title={t('navigationCondition')} bodyText={data?.fairwayCard?.navigationCondition || undefined} />
                <Paragraph title={t('iceCondition')} bodyText={data?.fairwayCard?.iceCondition || undefined} />
              </IonText>

              <IonText>
                <h4>
                  <strong>
                    {t('recommendations')} <span>({t('fairwayAndHarbour')})</span>
                  </strong>
                </h4>
                {/* TODO: VATU:sta nopeusrajoitustiedot */}
                <Paragraph title={t('speedLimit')} bodyTextList={data?.fairwayCard?.speedLimit} />
                <Paragraph title={t('windRecommendation')} bodyText={data?.fairwayCard?.windRecommendation || undefined} />
                <Paragraph title={t('vesselRecommendation')} bodyText={data?.fairwayCard?.vesselRecommendation || undefined} />
                <Paragraph title={t('visibilityRecommendation')} bodyText={data?.fairwayCard?.visibility || undefined} />
                <Paragraph title={t('windGauge')} bodyText={data?.fairwayCard?.windGauge || undefined} />
                <Paragraph title={t('seaLevel')} bodyText={data?.fairwayCard?.seaLevel || undefined} />
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
                <GeneralInfo data={extractPrimaryFairway()} />
              </IonText>
              <IonText>
                <h5>{t('anchorage')}</h5>
                <Paragraph bodyTextList={data?.fairwayCard?.anchorage} />
              </IonText>
              <IonText>
                <h5>{t('fairwayAreas')}</h5>
                <AreaInfo data={extractPrimaryFairway()} />
              </IonText>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default FairwayCard;
