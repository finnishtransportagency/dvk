import Geolocation from 'ol/Geolocation';
import Control from 'ol/control/Control';
import Coordinate from 'ol/coordinate';

class CenterToOwnLocationControl extends Control {
  geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
  });

  position: Coordinate.Coordinate | undefined = undefined;

  constructor(opt_options: { label: string; tipLabel: string }) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.className = 'centerToOwnLocationControl';
    button.innerHTML = options.label || '';
    button.title = options.tipLabel || '';

    const element = document.createElement('div');
    element.className = 'centerToOwnLocationControlContainer ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
    });

    button.addEventListener('click', () => {
      this.centerToOwnLocation();
    });
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
