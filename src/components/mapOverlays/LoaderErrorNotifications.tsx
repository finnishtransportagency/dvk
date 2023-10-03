import React, { useEffect, useState } from 'react';
import { useDvkContext } from '../../hooks/dvkContext';
import { CustomPopup } from './CustomPopup';
import errorIcon from '../../theme/img/safetyequipment/error_icon.svg';
import { debounce } from 'lodash';
import { getMapCanvasWidth, isMobile } from '../../utils/common';
import dvkMap from '../DvkMap';
import { ObjectEvent } from 'ol/Object';

export const LoadErrorNotifications: React.FC = () => {
  const { state } = useDvkContext();
  const [visible, setVisible] = useState(false);
  const [backgroundWidth, setBackgroundWidth] = useState<number>(0);

  const handlePopupClose = () => setVisible(false);

  const debouncedBackgroundWidthRefresh = React.useRef(
    debounce(() => {
      setBackgroundWidth(getMapCanvasWidth());
    }, 20)
  ).current;

  /* Use map canvas size as reference for container width to position container relative to side modal */
  dvkMap.olMap?.on('change:size', (event: ObjectEvent) => {
    const { target, key, oldValue } = event;
    const newValue = target.get(key);
    // Opening side modal triggers map size changes that have undefined or zero values before calculating final size
    // Ignore changes in height
    if (newValue !== undefined && newValue[0] && (!oldValue || oldValue[0] !== newValue[0])) {
      debouncedBackgroundWidthRefresh();
    }
  });

  useEffect(() => {
    if (Number(state.response[0]) !== 200 && state.response.length !== 0) {
      setVisible(true);
    }
  }, [state.response]);

  return (
    <div
      className="marine-warning-container"
      style={!isMobile() ? { width: backgroundWidth + 'px', left: 'calc(100% - ' + backgroundWidth + 'px)' } : undefined}
    >
      <CustomPopup isOpen={visible} closePopup={handlePopupClose} icon={errorIcon}>
        <strong>
          Error: {state.response[0]} {state.response[1]}.
        </strong>
        <p> Karttatiiliä ei voida näyttää</p>
      </CustomPopup>
    </div>
  );
};
