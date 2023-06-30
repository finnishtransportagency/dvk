import Control from 'ol/control/Control';
import { getMap } from '../DvkMap';

class TakeScreenshotControl extends Control {
  private buttonElement = document.createElement('button');

  constructor() {
    const element = document.createElement('div');
    element.className = 'takeScreenshotControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.buttonElement.className = 'takeScreenshotControl';
    this.buttonElement.disabled = true;
    element.appendChild(this.buttonElement);

    this.buttonElement.addEventListener('click', (e) => {
      e.preventDefault();
      getMap().printCurrentMapView();
    });
  }

  public setTipLabel(label: string) {
    this.buttonElement.title = label;
    this.buttonElement.ariaLabel = label;
  }

  public setDisabled(value: boolean) {
    this.buttonElement.disabled = value;
  }
}

export default TakeScreenshotControl;
