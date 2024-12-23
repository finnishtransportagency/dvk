import Control from 'ol/control/Control';

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
