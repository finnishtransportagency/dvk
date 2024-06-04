import React from 'react';
import rehypeSanitize from 'rehype-sanitize';
import { PluggableList } from 'unified';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import './MarkdownParagraph.css';

type MarkdownParagraphProps = {
  markdownText?: Text;
};

const MarkdownParagraph: React.FC<MarkdownParagraphProps> = ({ markdownText }) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;
  const rehypePlugins = [[rehypeSanitize, { tagNames: ['p', 'a', 'b', 'strong', 'em', 'br'] }]] as PluggableList;
  const source = markdownText?.[lang] ?? markdownText?.fi ?? undefined;

  return <MarkdownPreview className="markdown-text" source={source} rehypePlugins={rehypePlugins} />;
};

export default MarkdownParagraph;
