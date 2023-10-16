import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Control from 'ol/control/Control';
import Coordinate from 'ol/coordinate';
import { Point } from 'ol/geom';
import { getMap } from '../DvkMap';

class CenterToOwnLocationControl extends Control {
  private buttonElement = document.createElement('button');

  geolocation = new Geolocation({
    trackingOptions: {
      enableHighAccuracy: true,
    },
  });

  position: Coordinate.Coordinate | undefined = undefined;

  disabled: boolean = false;

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

  public setDisabled(disabled: boolean) {
    this.disabled = disabled;
    this.buttonElement.disabled = disabled;
  }

  centerToOwnLocation = () => {
    if (!this.disabled) {
      this.geolocation.setProjection(this.getMap()?.getView().getProjection());
      this.geolocation.setTracking(true);

      this.geolocation.once('change:position', () => {
        this.geolocation.setTracking(false);
        this.position = this.geolocation.getPosition();
        if (this.position) {
          // Refresh location marker as tracking is not enabled
          const source = getMap()?.getVectorSource('userlocation');
          source.clear();
          source.addFeature(
            new Feature({
              geometry: new Point([this.position[0], this.position[1]]),
            })
          );

          // Center and zoom
          this.getMap()?.getView().setCenter(this.position);
          this.getMap()?.getView().animate({ center: this.position, zoom: 5 });
        }
      });
    }
  };
}

export default CenterToOwnLocationControl;
