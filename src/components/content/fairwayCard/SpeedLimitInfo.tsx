import React from 'react';
import { useTranslation } from 'react-i18next';
import Paragraph from '../Paragraph';
import { Fairway, Text } from '../../../graphql/generated';

export type SpeedLimitInfoProps = {
  data?: Fairway[] | null;
  speedLimitText?: Text | null;
  inlineLabel?: boolean;
};

export const SpeedLimitInfo: React.FC<SpeedLimitInfoProps> = ({ data, speedLimitText, inlineLabel }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const speedLimits =
    data
      ?.flatMap((fairway) =>
        fairway.restrictionAreas?.filter((area) => (area.types?.filter((type) => type.code === '01') ?? []).length > 0 && area.location && area.value)
      )
      .filter(
        (value, index, self) =>
          self.findIndex((inner) => inner?.id === value?.id || (inner?.location === value?.location && inner?.value === value?.value)) === index
      ) ?? [];

  return (
    <>
      <p style={speedLimitText ? {} : { margin: '0px' }}>
        {inlineLabel && speedLimits.length > 0 && <strong>{t('speedLimit')}: </strong>}
        {speedLimits.map((area, idx) => (
          <span key={'limit-' + area?.id}>
            {(inlineLabel || idx > 0) && <br />}
            {t('speedLimitAt')} {area?.location}: {area?.value} <span aria-label={t('unit.kmhDesc', { count: area?.value ?? 0 })}>km/h</span>
          </span>
        ))}
      </p>
      <Paragraph
        title={inlineLabel && speedLimits.length < 1 ? t('speedLimit') : ''}
        bodyText={speedLimitText ?? undefined}
        showNoData={speedLimits.length < 1}
      />
    </>
  );
};
