import Control from 'ol/control/Control';

class InfoTextControl extends Control {
  constructor() {
    const element = document.createElement('div');
    element.className = 'infoTextControl ol-unselectable';

    super({
      element: element,
    });
  }

  public setText(textLabel: string) {
    this.element.innerHTML = textLabel;
  }
}

export default InfoTextControl;
