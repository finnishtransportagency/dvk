import React from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentDecimalSeparator } from '../../../utils/common';
import { Fairway } from '../../../graphql/generated';

export type GeneralInfoProps = {
  data?: Fairway[] | null;
};

export const GeneralInfo: React.FC<GeneralInfoProps> = ({ data }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const minimumWidths = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.minimumWidth).filter((val) => val)))];
  const minimumTurningCircles = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.minimumTurningCircle).filter((val) => val)))];
  const reserveWaters = [...Array.from(new Set(data?.flatMap((fairway) => fairway.sizing?.reserveWater?.trim()).filter((val) => val)))];

  return (
    <p>
      {t('minimumWidth', { count: minimumWidths.length })}: {minimumWidths.join(' / ') || '-'}&nbsp;
      <span aria-label={t('unit.mDesc', { count: 0 })}>m</span>
      <br />
      {t('minimumTurningCircle', { count: minimumTurningCircles.length })}: {minimumTurningCircles.join(' / ') || '-'}&nbsp;
      <span aria-label={t('unit.mDesc', { count: 0 })}>m</span>
      <br />
      {t('reserveWater', { count: reserveWaters.length })}: {reserveWaters.join(' / ').replaceAll('.', getCurrentDecimalSeparator()) || '-'}&nbsp;
      <span aria-label={t('unit.mDesc', { count: 0 })}>m</span>
    </p>
  );
};
