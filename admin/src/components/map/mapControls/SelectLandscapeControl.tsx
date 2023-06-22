import Control from 'ol/control/Control';
import { getMap } from '../DvkMap';

class SelectLandscapeControl extends Control {
  private buttonElement = document.createElement('button');

  constructor() {
    const element = document.createElement('div');
    element.className = 'selectLandscapeControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.buttonElement.className = 'selectLandscapeControl';
    element.appendChild(this.buttonElement);

    this.buttonElement.addEventListener('click', (e) => {
      e.preventDefault();
      const dvkMap = getMap();
      if (dvkMap.getOrientationType() !== 'landscape') {
        dvkMap.setOrientationType('landscape');
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

export default SelectLandscapeControl;
