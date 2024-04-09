import React, { useEffect, useMemo, useState } from 'react';
import { formatBytes } from '../utils/conversions';
import { useTranslation } from 'react-i18next';

interface RtzFileDownloadProperties {
  name: string;
  rtz: string;
}

export const RtzFileDownload: React.FC<RtzFileDownloadProperties> = ({ name, rtz }) => {
  const { t } = useTranslation();
  const [fileUrl, setFileUrl] = useState('');

  const file = useMemo(() => {
    const fileName = `${name}.rtz`;
    return new File([rtz], fileName, { type: 'text/xml' });
  }, [rtz, name]);

  const fileSize = formatBytes(t, file.size);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <a className="fileDownload" href={fileUrl} download={file.name} type="text/xml">
      {name} (<abbr title="Route plan exchange format">RTZ</abbr>, {fileSize.size} <abbr title={fileSize.unitDescription}>{fileSize.unit}</abbr>)
    </a>
  );
};
