import Control from 'ol/control/Control';
import { menuController } from '@ionic/core/components';

class OpenSidebarMenuControl extends Control {
  private readonly buttonElement = document.createElement('button');

  constructor() {
    const element = document.createElement('div');
    element.className = 'openSidebarMenuControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.buttonElement.className = 'openSidebarMenuControl';
    element.appendChild(this.buttonElement);

    this.buttonElement.addEventListener('click', () => {
      menuController.open();
    });
  }

  public setTipLabel(label: string) {
    this.buttonElement.title = label;
    this.buttonElement.ariaLabel = label;
  }

  public disable() {
    this.buttonElement.disabled = true;
    this.buttonElement.style.opacity = '0.5';
  }
}

export default OpenSidebarMenuControl;
