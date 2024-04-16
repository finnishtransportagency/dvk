import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang, N2000_URLS } from '../../../utils/constants';
import { useDvkContext } from '../../../hooks/dvkContext';
import uniqueId from 'lodash/uniqueId';
import { Fairway, SizingVessel, Text } from '../../../graphql/generated';

export type DimensionInfoProps = {
  data?: Fairway[] | null;
  designSpeedText?: Text | null;
  isN2000HeightSystem?: boolean;
};

export const DimensionInfo: React.FC<DimensionInfoProps> = ({ data, designSpeedText, isN2000HeightSystem }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  function getFairwayName(fairway: Fairway, lang: Lang): string {
    if (fairway.name) {
      return fairway.name[lang] ?? fairway.name.fi ?? '';
    }
    return '';
  }

  function getFairwaySizingVessels(fairway: Fairway): SizingVessel[] {
    return fairway.sizingVessels ?? [];
  }

  const sizingVessels =
    data
      ?.flatMap((fairway) => (fairway.sizingVessels ? fairway.sizingVessels : []))
      .filter((value, index, self) => self.findIndex((inner) => inner.type === value.type) === index) ?? [];
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
            {data.map((fairway) => {
              const uuid = uniqueId('fairway_');
              const sizingVessels = getFairwaySizingVessels(fairway);
              return (
                <span key={uuid}>
                  <br />
                  {getFairwayName(fairway, lang)}:
                  {sizingVessels.map((vessel) => {
                    const uuid = uniqueId('vessel_');
                    return (
                      <span key={uuid}>
                        <br />
                        {t('vesselType' + vessel.typeCode)}, l = {vessel.length}&nbsp;
                        <dd aria-label={t('unit.mDesc', { count: Number(vessel.length) })}>m</dd>, b = {vessel.width}&nbsp;
                        <dd aria-label={t('unit.mDesc', { count: Number(vessel.width) })}>m</dd>, t = {vessel.draft}&nbsp;
                        <dd aria-label={t('unit.mDesc', { count: Number(vessel.draft) })}>m</dd>.
                      </span>
                    );
                  })}
                  {sizingVessels.length < 1 && (
                    <>
                      <br />
                      {t('noDataSet')}
                    </>
                  )}
                </span>
              );
            })}
          </p>
          <p>
            <strong>{t('fairwayDimensions')}: </strong>
            {t('designDraft', { count: designDraftValues.length })}: {designDraftValues.join(' / ')}&nbsp;
            <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>. {t('sweptDepth', { count: sweptDepthValues.length })}:{' '}
            {sweptDepthValues.join(' / ')}&nbsp;
            <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>
            {minimumWidths.length > 0 && (
              <>
                . {t('minimumWidth', { count: minimumWidths.length })}: {minimumWidths.join(' / ')}&nbsp;
                <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>
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
                <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>
              </>
            )}
            . {designSpeedText?.[lang]}
            {isN2000HeightSystem && (
              <>
                <br />
                <strong>{t('attention')}</strong> {t('n2000Info')}
                <br />
                <a href={'//' + N2000_URLS[lang]} target="_blank" rel="noreferrer" tabIndex={state.isOffline ? -1 : undefined}>
                  {N2000_URLS[lang]}
                  <span className="screen-reader-only">{t('opens-in-a-new-tab')}</span>
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
