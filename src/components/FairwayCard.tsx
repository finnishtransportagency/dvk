import React, { useState } from 'react';
import {
  IonBreadcrumb,
  IonBreadcrumbs,
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
import { useFindFairwayCardByIdQuery } from '../graphql/generated';

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

type Text = {
  __typename?: 'Text';
  fi?: string | null;
  sv?: string | null;
  en?: string | null;
};

type ParagraphProps = {
  title: string;
  bodyText?: Text;
  bodyTextList?: (Text | null)[] | null;
};

const Paragraph: React.FC<ParagraphProps> = ({ title, bodyText, bodyTextList }) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      <IonText>
        {bodyTextList &&
          bodyTextList.map((text, idx) => {
            return (
              <p key={idx}>
                {idx === 0 && <strong>{title}: </strong>}
                {text && text[lang]}
              </p>
            );
          })}
        {bodyText && (
          <p>
            <strong>{title}: </strong>
            {bodyText[lang]}
          </p>
        )}
      </IonText>
    </>
  );
};

type Sizing = {
  __typename?: 'Sizing';
  minimumTurningCircle?: number | null;
  minimumWidth?: number | null;
  additionalInformation?: string | null;
};

type SizingVessel = {
  __typename?: 'SizingVessel';
  type?: string | null;
  length?: number | null;
  width?: number | null;
  draft?: number | null;
};

type FairwayProps = {
  data?:
    | ({
        __typename?: 'Fairway';
        name?: Text | null;
        primary?: boolean | null;
        startText?: string | null;
        endText?: string | null;
        lighting?: Text | null;
        sizing?: Sizing | null;
        sizingVessels?: (SizingVessel | null)[] | null;
      } | null)[]
    | null;
  lineText?: Text | null;
};

const LiningInfo: React.FC<FairwayProps> = ({ data, lineText }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('liningAndMarking')}: </strong>
            {data.map((fairway, idx) => {
              if (!fairway?.primary) return null;
              return (
                <span key={idx}>
                  {t('starts')}: {fairway.startText}, {t('ends')}: {fairway.endText}. {lineText && lineText[lang]} {t('length')}: XX{' '}
                  <span aria-label={t('unit.kmDesc', { count: 3 })}>km</span> / YY,Y{' '}
                  <span aria-label={t('unit.nmDesc', { count: 2 })}>{t('unit.nm')}</span>. {t('fairway')}{' '}
                  {fairway.lighting && fairway.lighting[lang]?.toLocaleLowerCase()}. &lt;Lateraalimerkintä/Kardinaalimerkintä&gt;
                </span>
              );
            })}
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
          {data.map((fairway, idx) => {
            if (!fairway?.primary || !fairway.sizingVessels) return null;
            return (
              <div key={idx}>
                <p>
                  <strong>{t('fairwayDesignVessel', { count: fairway.sizingVessels?.length || 1 })}: </strong>
                  {fairway &&
                    fairway.sizingVessels?.map((vessel, jdx) => {
                      return (
                        <span key={jdx}>
                          {vessel && (
                            <>
                              <br />
                              {t('designVessel')} {jdx + 1}: {vessel.type} l = {vessel.length}{' '}
                              <span aria-label={t('unit.mDesc', { count: Number(vessel.length) })}>m</span>, b = {vessel.width}{' '}
                              <span aria-label={t('unit.mDesc', { count: Number(vessel.width) })}>m</span>, t = {vessel.draft}{' '}
                              <span aria-label={t('unit.mDesc', { count: Number(vessel.draft) })}>m</span>.
                            </>
                          )}
                        </span>
                      );
                    })}
                </p>
                <p>
                  <strong>{t('fairwayDimensions')}: </strong>
                  {fairway && fairway.sizing && (
                    <>
                      {fairway.sizing.minimumWidth && t('designDraft')}: X <span aria-label={t('unit.mDesc', { count: 0 })}>m</span>.{' '}
                      {fairway.sizing.minimumWidth && t('sweptDepths')}: Y <span aria-label={t('unit.mDesc', { count: 0 })}>m</span>.{' '}
                      {fairway.sizing.minimumWidth && t('minimumWidth')}: {fairway.sizing.minimumWidth}{' '}
                      <span aria-label={t('unit.mDesc', { count: Number(fairway.sizing.minimumWidth) })}>m</span>
                      {t('and')}
                      {t('minimumTurningCircle')}: {fairway.sizing.minimumTurningCircle}{' '}
                      <span aria-label={t('unit.mDesc', { count: Number(fairway.sizing.minimumTurningCircle) })}>m</span>.{' '}
                      {fairway.sizing.minimumTurningCircle && t('designSpeed')}: Z <span aria-label={t('unit.ktsDesc', { count: 0 })}>kts</span>.
                      <br />
                      {fairway.sizing.additionalInformation}
                    </>
                  )}
                </p>
              </div>
            );
          })}
        </IonText>
      )}
    </>
  );
};

type PilotInfoProps = {
  data?: {
    __typename?: 'Pilot';
    email?: string | null;
    pilotJourney?: number | null;
    phoneNumber?: string | null;
    fax?: string | null;
    internet?: string | null;
    extraInfo?: Text | null;
    geometry?: {
      __typename?: 'GeometryPoint';
      coordinates?: (number | null)[] | null;
    } | null;
  } | null;
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
            <Phonenumber title={t('phone')} showEmpty number={data.phoneNumber} />, <Phonenumber title={t('fax')} showEmpty number={data.fax} />
            <br />
            {data.geometry?.coordinates && (
              <>
                {t('pilotPlace')}: {data.geometry?.coordinates[1]} / {data.geometry?.coordinates[0]}.{' '}
              </>
            )}
            {data.pilotJourney && (
              <>
                {t('pilotageDistance')}: {data.pilotJourney.toLocaleString()}{' '}
                <span aria-label={t('unit.nmDesc', { count: data.pilotJourney })} role="definition">
                  {t('unit.nm')}
                </span>
                .
              </>
            )}
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
  data?: {
    __typename?: 'VTS';
    vhf?: number | null;
    phoneNumber?: string | null;
    email?: (string | null)[] | null;
    name?: Text | null;
  } | null;
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
  data?:
    | ({
        __typename?: 'Tug';
        email?: string | null;
        phoneNumber?: (string | null)[] | null;
        fax?: string | null;
        name?: Text | null;
      } | null)[]
    | null;
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

  return (
    <>
      {loading && (
        <>
          <IonBreadcrumbs>
            <IonSkeletonText animated={true} style={{ width: '100%', height: '20px' }}></IonSkeletonText>
          </IonBreadcrumbs>
          <IonText>
            <h2>
              <IonSkeletonText animated={true} style={{ width: '100%', height: '30px' }}></IonSkeletonText>
            </h2>
            <IonSkeletonText animated={true} style={{ width: '110px', height: '14px' }}></IonSkeletonText>
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
              </em>
            </small>
          </IonText>

          <IonSegment className="tabs" onIonChange={(e) => setTab(e.detail.value || '1')} value={tab} mode="md">
            <IonSegmentButton value="1">
              <IonLabel>{t('title', { count: 0 })}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="2">
              <IonLabel>{t('harboursTitle')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="3">
              <IonLabel>{t('areasTitle')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {tab === '1' && (
            <IonGrid className="ion-no-padding">
              <IonRow>
                <IonCol size={widePane ? '6' : '12'} className={widePane ? 'wide' : ''}>
                  <IonText>
                    <h4>
                      <strong>{t('information')}</strong>
                    </h4>
                  </IonText>
                  <LiningInfo data={data?.fairwayCard?.fairways} lineText={data?.fairwayCard?.lineText} />
                  <DimensionInfo data={data?.fairwayCard?.fairways} />
                  <Paragraph title={t('attention')} bodyText={data?.fairwayCard?.attention || undefined} />
                  <Paragraph title={t('anchorage')} bodyTextList={data?.fairwayCard?.anchorage} />

                  <IonText>
                    <h4>
                      <strong>{t('navigation')}</strong>
                    </h4>
                  </IonText>
                  <Paragraph title={t('navigationCondition')} bodyText={data?.fairwayCard?.navigationCondition || undefined} />
                  <Paragraph title={t('iceCondition')} bodyText={data?.fairwayCard?.iceCondition || undefined} />
                </IonCol>

                <IonCol size={widePane ? '6' : '12'} className={widePane ? 'wide' : ''}>
                  <IonText>
                    <h4>
                      <strong>
                        {t('recommendations')} <span>({t('fairwayAndHarbour')})</span>
                      </strong>
                    </h4>
                  </IonText>
                  {/* TODO: VATU:sta nopeusrajoitustiedot */}
                  <Paragraph title={t('speedLimit')} bodyTextList={data?.fairwayCard?.speedLimit} />
                  <Paragraph title={t('windRecommendation')} bodyText={data?.fairwayCard?.windRecommendation || undefined} />
                  <Paragraph title={t('vesselRecommendation')} bodyText={data?.fairwayCard?.vesselRecommendation || undefined} />
                  <Paragraph title={t('visibilityRecommendation')} bodyText={data?.fairwayCard?.visibility || undefined} />
                  <Paragraph title={t('windGauge')} bodyText={data?.fairwayCard?.windGauge || undefined} />
                  <Paragraph title={t('seaLevel')} bodyText={data?.fairwayCard?.seaLevel || undefined} />

                  <IonText>
                    <h4>
                      <strong>{t('trafficServices')}</strong>
                    </h4>
                  </IonText>
                  <PilotInfo data={data?.fairwayCard?.trafficService?.pilot} />
                  <VTSInfo data={data?.fairwayCard?.trafficService?.vts} />
                  <TugInfo data={data?.fairwayCard?.trafficService?.tugs} />
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          {tab === '2' && (
            <>
              <IonText>
                <h4>
                  <strong>{t('harbours')}</strong>
                </h4>
              </IonText>
            </>
          )}

          {tab === '3' && (
            <>
              <IonText>
                <h4>
                  <strong>{t('commonInformation')}</strong>
                </h4>
              </IonText>
            </>
          )}
        </>
      )}
    </>
  );
};

export default FairwayCard;
