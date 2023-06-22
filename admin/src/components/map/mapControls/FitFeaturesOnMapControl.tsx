import Control from 'ol/control/Control';
import { fitSelectedFairwayCardOnMap } from '../layers';

class FitFeaturesOnMapControl extends Control {
  private buttonElement = document.createElement('button');

  constructor() {
    const element = document.createElement('div');
    element.className = 'centerToOwnLocationControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.buttonElement.className = 'centerToOwnLocationControl';
    element.appendChild(this.buttonElement);

    this.buttonElement.addEventListener('click', (e) => {
      e.preventDefault();
      this.fitFeaturesOnMap();
    });
  }

  public setTipLabel(label: string) {
    this.buttonElement.title = label;
    this.buttonElement.ariaLabel = label;
  }

  fitFeaturesOnMap = () => {
    fitSelectedFairwayCardOnMap();
  };
}

export default FitFeaturesOnMapControl;
