import Control from 'ol/control/Control';

class MapMaskControl extends Control {
  constructor() {
    const element = document.createElement('div');
    element.className = 'mapMaskControlContainer';

    super({
      element: element,
    });

    const maskTopLeft = document.createElement('div');
    maskTopLeft.className = 'maskTopLeft';
    const maskTop = document.createElement('div');
    maskTop.className = 'maskTop';
    const maskTopRight = document.createElement('div');
    maskTopRight.className = 'maskTopRight';
    const maskBottomLeft = document.createElement('div');
    maskBottomLeft.className = 'maskBottomLeft';
    const maskBottom = document.createElement('div');
    maskBottom.className = 'maskBottom';
    const maskBottomRight = document.createElement('div');
    maskBottomRight.className = 'maskBottomRight';
    const maskLeft = document.createElement('div');
    maskLeft.className = 'maskLeft';
    const maskRight = document.createElement('div');
    maskRight.className = 'maskRight';
    element.appendChild(maskTopLeft);
    element.appendChild(maskTop);
    element.appendChild(maskTopRight);
    element.appendChild(maskBottomLeft);
    element.appendChild(maskBottom);
    element.appendChild(maskBottomRight);
    element.appendChild(maskLeft);
    element.appendChild(maskRight);
  }
}

export default MapMaskControl;
