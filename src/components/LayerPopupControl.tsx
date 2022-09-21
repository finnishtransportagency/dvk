import Control from 'ol/control/Control';

type LayerPopupControlOptions = {
  label: string;
  tipLabel: string;
  setIsOpen: (isOpen: boolean) => void;
};

class LayerPopupControl extends Control {
  button: HTMLButtonElement;

  constructor(options: LayerPopupControlOptions) {
    const button = document.createElement('button');
    button.className = 'layerControl';
    button.innerHTML = options.label || '';
    button.title = options.tipLabel || '';

    const element = document.createElement('div');
    element.className = 'layerControlContainer ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
    });
    this.button = button;
    button.addEventListener('click', () => {
      options.setIsOpen(true);
      button.className = 'layerControlOpen';
    });
  }

  modalClosed() {
    this.button.className = 'layerControl';
  }
}

export default LayerPopupControl;
