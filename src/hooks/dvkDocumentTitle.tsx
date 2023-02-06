import { useEffect, useState } from 'react';

const useDocumentTitle = (title: string) => {
  const [documentTitle, setDoucmentTitle] = useState(title);
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle, title]);

  return [documentTitle, setDoucmentTitle] as const;
};

export { useDocumentTitle };
