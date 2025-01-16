import Control from 'ol/control/Control';

class LayerPopupControl extends Control {
  private readonly buttonElement = document.createElement('button');

  private setIsOpen: ((isOpen: boolean) => void) | undefined = undefined;

  constructor() {
    const element = document.createElement('div');
    element.className = 'layerControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.buttonElement.className = 'layerControl';
    element.appendChild(this.buttonElement);

    this.buttonElement.addEventListener('click', () => {
      if (this.setIsOpen) {
        this.setIsOpen(true);
      }
      this.buttonElement.className = 'layerControlOpen';
    });
  }

  public setTipLabel(label: string) {
    this.buttonElement.title = label;
    this.buttonElement.ariaLabel = label;
  }

  public modalClosed() {
    this.buttonElement.className = 'layerControl';
  }

  public onSetIsOpen(setIsOpen: (isOpen: boolean) => void) {
    this.setIsOpen = setIsOpen;
  }
}

export default LayerPopupControl;
