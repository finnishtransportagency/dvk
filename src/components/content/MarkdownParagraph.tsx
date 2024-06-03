import React from 'react';
import rehypeSanitize from 'rehype-sanitize';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import { Lang } from '../../utils/constants';

type MarkdownParagraphProps = {
  markdownText?: Text;
};

const MarkdownParagraph: React.FC<MarkdownParagraphProps> = ({ markdownText }) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;
  const rehypePlugins = [rehypeSanitize];
  const source = markdownText?.[lang] ?? markdownText?.fi ?? undefined;

  return <MarkdownPreview source={source} rehypePlugins={rehypePlugins} style={{ padding: 16 }} />;
};

export default MarkdownParagraph;
