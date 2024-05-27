import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang, N2000_URLS } from '../../../utils/constants';
import { useDvkContext } from '../../../hooks/dvkContext';
import uniqueId from 'lodash/uniqueId';
import { Fairway, SizingVessel, Text } from '../../../graphql/generated';
import { metresToNauticalMiles } from '../../../utils/conversions';
import { TFunction } from 'i18next';

export type DimensionInfoProps = {
  data?: Fairway[] | null;
  designSpeedText?: Text | null;
  isN2000HeightSystem?: boolean;
};

function getSizingVesselsText(sizingVessels: SizingVessel[], t: TFunction) {
  return (
    <>
      {sizingVessels.map((vessel) => {
        const uuid = uniqueId('vessel_');
        return (
          <span key={uuid}>
            {t('designVessel')}:&nbsp;
            {t('vesselType' + vessel.typeCode)}, l = {vessel.length}&nbsp;
            <dd aria-label={t('unit.mDesc', { count: Number(vessel.length) })}>m</dd>, b = {vessel.width}&nbsp;
            <dd aria-label={t('unit.mDesc', { count: Number(vessel.width) })}>m</dd>, t = {vessel.draft}&nbsp;
            <dd aria-label={t('unit.mDesc', { count: Number(vessel.draft) })}>m</dd>.&nbsp;
          </span>
        );
      })}
      ;
    </>
  );
}

export const DimensionInfo: React.FC<DimensionInfoProps> = ({ data, designSpeedText, isN2000HeightSystem }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const numberOfFairways = data ? data.length : 0;

  function getFairwayName(fairway: Fairway, lang: Lang): string {
    if (fairway.name) {
      return fairway.name[lang] ?? fairway.name.fi ?? '';
    }
    return '';
  }

  function getFairwaySizingVessels(fairway: Fairway): SizingVessel[] {
    return fairway.sizingVessels ?? [];
  }

  function getFairwayDesignDraftValues(fairway: Fairway): string[] {
    const designDraftValues: Array<string> = [];
    if (fairway.areas) {
      for (const area of fairway.areas) {
        const str = (isN2000HeightSystem ? area.n2000draft : area.draft)?.toLocaleString();
        if (str !== undefined && str !== '0' && !designDraftValues.includes(str)) {
          designDraftValues.push(str);
        }
      }
    }
    return designDraftValues;
  }

  function getFairwaySweptDepthValues(fairway: Fairway): string[] {
    const sweptDepthValues: Array<string> = [];
    if (fairway.areas) {
      for (const area of fairway.areas) {
        const str = (isN2000HeightSystem ? area.n2000depth : area.depth)?.toLocaleString();
        if (str !== undefined && str !== '0' && !sweptDepthValues.includes(str)) {
          sweptDepthValues.push(str);
        }
      }
    }
    return sweptDepthValues;
  }

  // Calculate the sum of navigation lines excluding theoretical curves (typeCode '4')
  function getFairwayTotalLength(fairway: Fairway): number {
    let length = 0;
    if (fairway.navigationLines) {
      for (const line of fairway.navigationLines) {
        if (line.typeCode !== '4' && line.length) {
          length += line.length;
        }
      }
    }
    return length;
  }

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('fairwayDimensions')}:</strong>
            <br />
            {designSpeedText && (
              <>
                {t('designSpeed')}:&nbsp;
                {designSpeedText[lang]}
                <br />
                <br />
              </>
            )}
            {data.map((fairway, idx) => {
              const uuid = uniqueId('fairway_');
              const designDraftValues2 = getFairwayDesignDraftValues(fairway);
              const sweptDepthValues2 = getFairwaySweptDepthValues(fairway);
              const minimumWidth = fairway.sizing?.minimumWidth;
              const minimumTurningCircle = fairway.sizing?.minimumTurningCircle;
              const additionalText = fairway.sizing?.additionalInformation;
              const totalLength = getFairwayTotalLength(fairway);
              const sizingVessels = getFairwaySizingVessels(fairway);
              return (
                <span key={uuid}>
                  {numberOfFairways > 1 && (
                    <>
                      {idx > 0 && <br />}
                      {getFairwayName(fairway, lang)}:
                      <br />
                    </>
                  )}
                  {t('designDraft', { count: designDraftValues2.length })}: {designDraftValues2.join(' / ')}&nbsp;
                  <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>. {t('sweptDepth', { count: sweptDepthValues2.length })}:{' '}
                  {sweptDepthValues2.join(' / ')}&nbsp;
                  <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>.&nbsp;
                  {minimumWidth && (
                    <>
                      {t('minimumWidth', { count: 1 })}: {minimumWidth}&nbsp;
                      <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>
                    </>
                  )}
                  {minimumTurningCircle && (
                    <>
                      {minimumWidth ? (
                        <>
                          {t('and')}
                          {t('minimumTurningCircle', { count: 1 }).toLocaleLowerCase()}
                        </>
                      ) : (
                        <>{t('minimumTurningCircle', { count: 1 })}</>
                      )}
                      : {minimumTurningCircle}&nbsp;
                      <dd aria-label={t('unit.mDesc', { count: 0 })}>m</dd>
                    </>
                  )}
                  {minimumWidth && minimumTurningCircle && <>.&nbsp;</>}
                  {t('length')}: {((totalLength ?? 0) / 1000).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
                  <dd aria-label={t('unit.kmDesc', { count: 3 })}>km</dd> /{' '}
                  {metresToNauticalMiles(totalLength).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
                  <dd aria-label={t('unit.nmDesc', { count: 2 })}>{t('unit.nm')}</dd>
                  .&nbsp;
                  {sizingVessels.length > 0 && getSizingVesselsText(sizingVessels, t)}
                  <br />
                  {additionalText && (
                    <>
                      {additionalText}
                      <br />
                    </>
                  )}
                </span>
              );
            })}
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
          </p>
        </IonText>
      )}
    </>
  );
};
