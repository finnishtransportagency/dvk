import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { metresToNauticalMiles } from '../../../utils/conversions';
import { Lang } from '../../../utils/constants';
import { Fairway, Text } from '../../../graphql/generated';

export type LiningInfoProps = {
  data?: Fairway[] | null;
  lineText?: Text | null;
};

export const LiningInfo: React.FC<LiningInfoProps> = ({ data, lineText }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const primaryFairway = data?.find((fairway) => fairway.primary);
  const secondaryFairway = data?.find((fairway) => fairway.secondary) ?? primaryFairway;

  // Calculate the sum of navigation lines excluding theoretical curves (typeCode '4')
  const extractNavigationLinesLength = () => {
    const totalLength = data?.reduce((sum, card) => {
      return (
        sum +
        (card.navigationLines?.reduce((acc, line) => {
          return acc + ((line.typeCode !== '4' && line.length) || 0);
        }, 0) ?? 0)
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
      if (endSentence) return str.trim() + (str.trim().endsWith('.') ? '' : '.');
      return str.trim().endsWith('.') ? str.trim().slice(0, -1) : str.trim();
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
            {((extractNavigationLinesLength() ?? 0) / 1000).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <dd aria-label={t('unit.kmDesc', { count: 3 })}>km</dd> /{' '}
            {metresToNauticalMiles(extractNavigationLinesLength()).toLocaleString(lang, { maximumFractionDigits: 1 })}&nbsp;
            <dd aria-label={t('unit.nmDesc', { count: 2 })}>{t('unit.nm')}</dd>. {extractLightingInfo()}. {extractNotationInfo()}.
          </p>
        </IonText>
      )}
    </>
  );
};
