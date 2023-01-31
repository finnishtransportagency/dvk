import React, { ReactNode } from 'react';

type HeaderProps = {
  level: number;
  text: string;
  embedded: boolean;
  children?: ReactNode;
};

const SquatHeader: React.FC<HeaderProps> = ({ level, text, embedded, children }) => {
  const adjustedLevel = embedded ? level + 1 : level;
  switch (adjustedLevel) {
    case 1:
      return (
        <h1>
          <strong>{text}</strong>
          {children}
        </h1>
      );
    case 2:
      return (
        <h2>
          <strong>{text}</strong>
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 className={embedded ? 'h2' : undefined}>
          <strong>{text}</strong>
          {children}
        </h3>
      );
    case 4:
      return (
        <h4 className={embedded ? 'h3' : undefined}>
          <strong>{text}</strong>
          {children}
        </h4>
      );
    default:
      return <strong>{text}</strong>;
  }
};

export default SquatHeader;
