import React from 'react';
import { IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../../utils/constants';
import { Fairway, Text } from '../../../graphql/generated';
import { TFunction } from 'i18next';
import { uniqueId } from 'lodash';
import { getFairwayName } from './DimensionInfo';

export type LiningInfoProps = {
  data?: Fairway[] | null;
  lineText?: Text | null;
};

function extractLightingInfo(fairway: Fairway, t: TFunction) {
  switch (fairway?.lightingCode) {
    case '1':
      return t('fairwayLit');
    case '2':
      return t('fairwayUnlit');
    default:
      return t('lightingUnknown');
  }
}

// Extract notation information from fairway areas
function extractNotationInfo(fairway: Fairway, t: TFunction) {
  const lateralMarking = fairway.areas?.some((area) => area.notationCode === 1);
  const cardinalMarking = fairway.areas?.some((area) => area.notationCode === 2);

  if (lateralMarking) return t('lateralMarking') + (cardinalMarking ? ' / ' + t('cardinalMarking') : '');
  if (cardinalMarking) return t('cardinalMarking');
  return '';
}

function formatSentence(str?: string | null, endSentence?: boolean) {
  if (str) {
    if (endSentence) return str.trim() + (str.trim().endsWith('.') ? '' : '.');
    return str.trim().endsWith('.') ? str.trim().slice(0, -1) : str.trim();
  } else {
    return '';
  }
}

export const LiningInfo: React.FC<LiningInfoProps> = ({ data, lineText }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;

  const primaryFairways = data
    ?.filter((fairway) => fairway.primary)
    .sort((a, b) => (a.primarySequenceNumber as number) - (b.primarySequenceNumber as number));
  const secondaryFairways = data
    ?.filter((fairway) => fairway.secondary)
    .sort((a, b) => (a.secondarySequenceNumber as number) - (b.secondarySequenceNumber as number));

  const numberOfFairways = data ? data.length : 0;

  return (
    <>
      {data && (
        <IonText>
          <p>
            <strong>{t('liningAndMarking')}: </strong>
            <br />
            {t('starts')}:&nbsp;
            {primaryFairways?.map((pf, idx) => {
              const startText = formatSentence(pf.startText);
              if (!startText) return '';
              return startText + (idx !== primaryFairways.length - 1 ? ', ' : ' ');
            })}
            <br />
            {t('ends').charAt(0).toLocaleUpperCase() + t('ends').slice(1)}:&nbsp;
            {secondaryFairways?.map((sf, idx) => {
              const endText = formatSentence(sf.endText);
              if (!endText) return '';
              return endText + (idx !== secondaryFairways.length - 1 ? ', ' : ' ');
            })}
            <br />
            <br />
            {data.map((fairway, idx) => {
              const uuid = uniqueId('fairway_');
              return (
                <span key={uuid}>
                  {numberOfFairways > 1 && (
                    <>
                      {idx > 0 && <br />}
                      {getFairwayName(fairway, lang)}&nbsp;{fairway.id}:
                      <br />
                    </>
                  )}
                  {extractLightingInfo(fairway, t)}.&nbsp;{extractNotationInfo(fairway, t)}.
                  <br />
                </span>
              );
            })}
            {lineText && (
              <span>
                <>
                  <br />
                  {formatSentence(lineText[lang], true)}
                </>
              </span>
            )}
          </p>
        </IonText>
      )}
    </>
  );
};
