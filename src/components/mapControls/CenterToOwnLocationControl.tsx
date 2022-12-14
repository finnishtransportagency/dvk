import Geolocation from 'ol/Geolocation';
import Control from 'ol/control/Control';
import Coordinate from 'ol/coordinate';

class CenterToOwnLocationControl extends Control {
  private buttonElement = document.createElement('button');

  geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
  });

  position: Coordinate.Coordinate | undefined = undefined;

  constructor() {
    const element = document.createElement('div');
    element.className = 'centerToOwnLocationControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.buttonElement.className = 'centerToOwnLocationControl';
    element.appendChild(this.buttonElement);

    this.buttonElement.addEventListener('click', () => {
      this.centerToOwnLocation();
    });
  }

  public setTipLabel(label: string) {
    this.buttonElement.title = label;
    this.buttonElement.ariaLabel = label;
  }

  centerToOwnLocation = () => {
    this.geolocation.setProjection(this.getMap()?.getView().getProjection());
    this.position = this.geolocation.getPosition();
    if (this.position) {
      this.getMap()?.getView().setCenter(this.position);
    }
    this.geolocation.setTracking(true);
    this.geolocation.once('change:position', () => {
      this.geolocation.setTracking(false);
      this.position = this.geolocation.getPosition();
      if (this.position) {
        this.getMap()?.getView().setCenter(this.position);
      }
    });
  };
}

export default CenterToOwnLocationControl;
