import React from 'react';
import { useTranslation } from 'react-i18next';
import Paragraph from '../../Paragraph';
import { Fairway, Text } from '../../../../graphql/generated';

type AnchorageInfoProps = {
  data?: Fairway[] | null;
  anchorageText?: Text | null;
  inlineLabel?: boolean;
};

export const AnchorageInfo: React.FC<AnchorageInfoProps> = ({ data, inlineLabel, anchorageText }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });

  const anchorageAreas = data?.flatMap((fairway) => fairway.areas?.filter((area) => area.typeCode === 2)) ?? [];

  return (
    <>
      <Paragraph title={inlineLabel ? t('anchorage') : ''} bodyText={anchorageText ?? undefined} showNoData={anchorageAreas.length > 0} />
      <p>
        {anchorageAreas.map((area) => (
          <span key={'anchorage' + area?.id}>
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
