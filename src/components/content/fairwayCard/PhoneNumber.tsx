import React from 'react';

type PhoneNumberProps = {
  number?: string | null;
  title?: string;
  showEmpty?: boolean;
};

const PhoneNumber: React.FC<PhoneNumberProps> = ({ number, title, showEmpty }) => {
  return (
    <>
      {number && (
        <>
          {title && title + ': '}
          <a href={'tel:' + number} aria-label={number?.split('').join(' ')}>
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
