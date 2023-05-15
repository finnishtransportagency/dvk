import { useEffect, useState } from 'react';

const useDocumentTitle = (title: string) => {
  const [documentTitle, setDocumentTitle] = useState(title);
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle, title]);

  return [documentTitle, setDocumentTitle] as const;
};

export { useDocumentTitle };
