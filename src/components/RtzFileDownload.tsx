import React, { useEffect, useMemo, useState } from 'react';

interface RtzFileDownloadProperties {
  name: string;
  rtz: string;
}

export const RtzFileDownload: React.FC<RtzFileDownloadProperties> = ({ name, rtz }) => {
  const [fileUrl, setFileUrl] = useState('');

  const file = useMemo(() => {
    const fileName = `${name}.rtz`;
    return new File([rtz], fileName, { type: 'text/xml' });
  }, [rtz, name]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <a className="fileDownload" href={fileUrl} download={file.name} target="_blank" rel="noreferrer">
      {file.name}
    </a>
  );
};
