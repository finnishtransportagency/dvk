import React from 'react';

type HeaderProps = {
  level: number;
  text: string;
  embedded: boolean;
};

const SquatHeader: React.FC<HeaderProps> = ({ level, text, embedded }) => {
  const adjustedLevel = embedded ? level + 1 : level;
  switch (adjustedLevel) {
    case 1:
      return (
        <h1>
          <strong>{text}</strong>
        </h1>
      );
    case 2:
      return (
        <h2>
          <strong>{text}</strong>
        </h2>
      );
    case 3:
      return (
        <h3 className={embedded ? 'h2' : undefined}>
          <strong>{text}</strong>
        </h3>
      );
    case 4:
      return (
        <h4 className={embedded ? 'h3' : undefined}>
          <strong>{text}</strong>
        </h4>
      );
    default:
      return <strong>{text}</strong>;
  }
};

export default SquatHeader;
