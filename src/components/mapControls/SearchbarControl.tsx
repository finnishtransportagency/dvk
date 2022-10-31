import Control from 'ol/control/Control';
import { RouteComponentProps } from 'react-router-dom';
import { FairwayCardPartsFragment } from '../../graphql/generated';

class SearchbarControl extends Control {
  private inputElement = document.createElement('input');

  private setIsOpen: (isOpen: boolean) => void = () => {};

  private isOpen = false;

  private setSearchQuery: (searchQuery: string) => void = () => {};

  private setActiveSelection: (activeSelection: number) => void = () => {};

  private activeSelection = 0;

  private filteredData: FairwayCardPartsFragment[] = [];

  private history!: RouteComponentProps['history'];

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
      //this.setSearchQuery('');
      //this.inputElement.value = '';
    };

    this.inputElement.addEventListener('focus', () => {
      this.setIsOpen(true);
      this.setSearchQuery(this.inputElement.value.toLowerCase());
      this.setActiveSelection(0);
    });
    this.inputElement.addEventListener('input', () => {
      this.setSearchQuery(this.inputElement.value.toLowerCase());
      this.setActiveSelection(0);
    });
    this.inputElement.addEventListener('blur', () => {
      setTimeout(closeDropdown, 200);
    });

    this.inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDropdown();
      if (event.key === 'Tab' && this.isOpen) {
        event.preventDefault();
        this.setIsOpen(false);
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!this.isOpen) {
          this.setIsOpen(true);
        } else if (this.filteredData.length > 0) {
          this.setActiveSelection(this.activeSelection >= this.filteredData.length ? 1 : this.activeSelection + 1);
        }
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.setActiveSelection(this.activeSelection < 2 ? this.filteredData.length : this.activeSelection - 1);
      }
      if (event.key === 'Enter' && this.isOpen && this.activeSelection) {
        closeDropdown();
        this.history.push('/vaylakortit/' + this.filteredData[this.activeSelection - 1].id);
      }
    });
  }

  public setPlaceholder(placeholder: string) {
    this.inputElement.placeholder = placeholder;
    this.inputElement.title = placeholder;
  }

  public setIsSearchbarOpen(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  public onSetIsOpen(setIsOpen: (isOpen: boolean) => void) {
    this.setIsOpen = setIsOpen;
  }

  public onSetSearchQuery(setSearchQuery: (searchQuery: string) => void) {
    this.setSearchQuery = setSearchQuery;
  }

  public setCurrentActiveSelection(activeSelection: number) {
    this.activeSelection = activeSelection;
  }

  public onSetActiveSelection(setActiveSelection: (activeSelection: number) => void) {
    this.setActiveSelection = setActiveSelection;
  }

  public setFilteredData(filteredData: FairwayCardPartsFragment[]) {
    this.filteredData = filteredData;
  }

  public setHistory(history: RouteComponentProps['history']) {
    this.history = history;
  }
}

export default SearchbarControl;
