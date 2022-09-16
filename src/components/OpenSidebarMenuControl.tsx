import Control from 'ol/control/Control';
import { menuController } from '@ionic/core/components';

class OpenSidebarMenuControl extends Control {
  constructor(opt_options: { label: string; tipLabel: string }) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.className = 'openSidebarMenuControl';
    button.innerHTML = options.label || '';
    button.title = options.tipLabel || '';

    const element = document.createElement('div');
    element.className = 'openSidebarMenuControlContainer ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
    });

    button.addEventListener('click', () => {
      menuController.open();
    });
  }
}

export default OpenSidebarMenuControl;
