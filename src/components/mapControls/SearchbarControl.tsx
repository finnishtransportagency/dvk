import Control from 'ol/control/Control';

class SearchbarControl extends Control {
  private inputElement = document.createElement('input');

  private setIsOpen: (isOpen: boolean) => void = () => {};

  private setSearchQuery: (searchQuery: string) => void = () => {};

  constructor() {
    const element = document.createElement('div');
    element.className = 'searchbarControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.inputElement.className = 'searchbarControl';
    element.appendChild(this.inputElement);

    const closeDropdown = () => {
      this.setIsOpen(false);
      this.setSearchQuery('');
      this.inputElement.value = '';
    };

    this.inputElement.addEventListener('focus', () => {
      this.setIsOpen(true);
      this.setSearchQuery(this.inputElement.value.toLowerCase());
    });
    this.inputElement.addEventListener('input', () => {
      this.setSearchQuery(this.inputElement.value.toLowerCase());
    });
    this.inputElement.addEventListener('blur', () => {
      setTimeout(closeDropdown, 200);
    });
  }

  public setPlaceholder(placeholder: string) {
    this.inputElement.placeholder = placeholder;
    this.inputElement.title = placeholder;
  }

  public onSetIsOpen(setIsOpen: (isOpen: boolean) => void) {
    this.setIsOpen = setIsOpen;
  }

  public onSetSearchQuery(setSearchQuery: (searchQuery: string) => void) {
    this.setSearchQuery = setSearchQuery;
  }
}

export default SearchbarControl;
