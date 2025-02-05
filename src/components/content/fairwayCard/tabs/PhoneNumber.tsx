import React from 'react';

type PhoneNumberProps = {
  number?: string | null;
  title?: string;
  showEmpty?: boolean;
  primaryColorLink?: boolean;
};

const PhoneNumber: React.FC<PhoneNumberProps> = ({ number, title, showEmpty, primaryColorLink }) => {
  return (
    <>
      {number && (
        <>
          {title && title + ': '}
          <a href={'tel:' + number} className={primaryColorLink ? 'primaryColorLink' : ''} aria-label={number?.split('').join(' ')}>
            {number}
          </a>
        </>
      )}
      {!number && showEmpty && (
        <>
          {title && title + ': '}
          {'-'}
        </>
      )}
    </>
  );
};

export default PhoneNumber;
