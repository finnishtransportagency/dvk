import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import InfoIcon from '../../theme/img/info.svg?react';

type ParagraphProps = {
  title?: string;
  bodyText?: Text;
  showNoData?: boolean;
};

const Paragraph: React.FC<ParagraphProps> = ({ title, bodyText, showNoData }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <>
      {bodyText && (
        <p>
          {title && <strong>{title}: </strong>}
          {bodyText[lang] ?? bodyText.fi}
        </p>
      )}
      {showNoData && !bodyText && (
        <p>
          {title && <strong>{title}: </strong>} {t('noDataSet')}
        </p>
      )}
    </>
  );
};

type InfoParagraphProps = {
  title?: string;
};

export const InfoParagraph: React.FC<InfoParagraphProps> = ({ title }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });

  return (
    <p className="info use-flex ion-align-items-center">
      <InfoIcon aria-label="info" className="no-print" />
      {title ?? t('noDataSet')}
    </p>
  );
};

export default Paragraph;
