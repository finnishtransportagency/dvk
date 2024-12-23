import Control from 'ol/control/Control';
import { isMobile } from '../../utils/common';

class MapDetailsControl extends Control {
  private readonly mousePositionLabelElement: HTMLDivElement = document.createElement('div');

  private readonly mousePositionElement: HTMLDivElement = document.createElement('div');

  private readonly scaleLineElement: HTMLDivElement = document.createElement('div');

  constructor() {
    const element = document.createElement('div');
    element.style.display = 'table';
    element.className = 'mapDetailsControl ol-unselectable ol-control';

    const rowElem = document.createElement('div');
    rowElem.style.display = 'table-row';
    element.appendChild(rowElem);

    super({
      element: element,
    });
    // workaround for vitest mocking to avoid isMobile is not a function error
    if (import.meta.env.NODE_ENV === 'test' || !isMobile()) {
      this.mousePositionLabelElement.style.display = 'table-cell';
      this.mousePositionLabelElement.className = 'mousePositionLabelElem';
      rowElem.appendChild(this.mousePositionLabelElement);

      this.mousePositionElement.style.display = 'table-cell';
      rowElem.appendChild(this.mousePositionElement);
    }

    this.scaleLineElement.style.display = 'table-cell';
    rowElem.appendChild(this.scaleLineElement);
  }

  public getScaleLineElement() {
    return this.scaleLineElement;
  }

  public getMousePositionElement() {
    return this.mousePositionElement;
  }

  public setMousePositionLabel(label: string) {
    this.mousePositionLabelElement.innerHTML = label;
  }
}

export default MapDetailsControl;
