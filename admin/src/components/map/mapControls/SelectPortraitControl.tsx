import Control from 'ol/control/Control';
import { getMap } from '../DvkMap';

class SelectPortraitControl extends Control {
  private buttonElement = document.createElement('button');

  constructor() {
    const element = document.createElement('div');
    element.className = 'selectPortraitControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.buttonElement.className = 'selectPortraitControl';
    element.appendChild(this.buttonElement);

    this.buttonElement.addEventListener('click', (e) => {
      e.preventDefault();
      const dvkMap = getMap();
      if (dvkMap.getOrientationType() !== 'portrait') {
        dvkMap.setOrientationType('portrait');
      } else {
        dvkMap.setOrientationType('');
      }
    });
  }

  public setTipLabel(label: string) {
    this.buttonElement.title = label;
    this.buttonElement.ariaLabel = label;
  }
}

export default SelectPortraitControl;
