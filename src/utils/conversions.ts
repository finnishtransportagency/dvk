import { TFunction } from 'i18next';

export function metresToNauticalMiles(x?: number | null) {
  return (x ?? 0) / 1852;
}

export function nauticalMilesToMeters(x: number) {
  return x * 1852;
}

type FileSize = {
  size: number;
  unit: string;
  unitDescription: string;
};

export function formatBytes(t: TFunction, bytes: number, decimals: number = 2): FileSize {
  const k = 1024;
  const sizes = ['bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = sizes[i] ?? '';

  return {
    size: parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)),
    unit: unit === 'bytes' ? t('fileSize.bytes') : unit,
    unitDescription: t(`fileSize.${unit}`) ?? '',
  };
}
