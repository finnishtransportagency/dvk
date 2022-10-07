import Control from 'ol/control/Control';

type SearchbarControlOptions = {
  placeholder: string;
  setIsOpen: (isOpen: boolean) => void;
  setSearchQuery: (searchQuery: string) => void;
};

class SearchbarControl extends Control {
  constructor(options: SearchbarControlOptions) {
    const input = document.createElement('input');
    input.className = 'searchbarControl';
    input.placeholder = options.placeholder || '';
    input.title = options.placeholder || '';

    const element = document.createElement('div');
    element.className = 'searchbarControlContainer ol-unselectable ol-control';
    element.appendChild(input);

    super({
      element: element,
    });

    const closeDropdown = () => {
      options.setIsOpen(false);
      options.setSearchQuery('');
    };

    input.addEventListener('focus', () => {
      options.setIsOpen(true);
      options.setSearchQuery(input.value.toLowerCase());
    });
    input.addEventListener('input', () => {
      options.setSearchQuery(input.value.toLowerCase());
    });
    input.addEventListener('blur', () => {
      setTimeout(closeDropdown, 200);
    });
  }
}

export default SearchbarControl;
