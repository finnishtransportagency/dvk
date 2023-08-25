import Geolocation from 'ol/Geolocation';
import Control from 'ol/control/Control';
import Coordinate from 'ol/coordinate';
import { getMap } from '../DvkMap';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

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

  //searches right layer and places marker to current position
  public placeOwnLocationMarker(coordinates: Coordinate.Coordinate) {
    const source = this.getOwnLocationFeatureLayer().getSource() as VectorSource;
    source?.clear();
    source?.addFeature(
      new Feature({
        geometry: new Point([coordinates[0], coordinates[1]]),
      })
    );
  }

  private getOwnLocationFeatureLayer() {
    return getMap()?.getFeatureLayer('ownlocation');
  }

  centerToOwnLocation = () => {
    this.geolocation.setProjection(this.getMap()?.getView().getProjection());
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        this.position = this.geolocation.getPosition();
        if (this.position) {
          this.getMap()?.getView().setCenter(this.position);
        }
      }
      if (result.state === 'denied') {
        const source = this.getOwnLocationFeatureLayer().getSource() as VectorSource;
        source?.clear();
      }
    });

    this.geolocation.setTracking(true);
    this.geolocation.once('change:position', () => {
      this.geolocation.setTracking(false);
      this.position = this.geolocation.getPosition();
      if (this.position) {
        this.placeOwnLocationMarker(this.position);
        this.getMap()?.getView().animate({ center: this.position, zoom: 5 });
      }
    });
  };
}

export default CenterToOwnLocationControl;
