import Control from 'ol/control/Control';
import { RouteComponentProps } from 'react-router-dom';
import { FairwayCardPartsFragment } from '../../graphql/generated';
import { MINIMUM_QUERYLENGTH } from '../../utils/constants';

class SearchbarControl extends Control {
  private readonly inputElement = document.createElement('input');

  private readonly clearBtn = document.createElement('button');

  private setIsOpen: (isOpen: boolean) => void = () => {};

  private isOpen = false;

  private setSearchQuery: (searchQuery: string) => void = () => {};

  private setActiveSelection: (activeSelection: number) => void = () => {};

  private activeSelection = 0;

  private filteredData: FairwayCardPartsFragment[] = [];

  private history!: RouteComponentProps['history'];

  private curPath = '';

  constructor() {
    const element = document.createElement('div');
    element.className = 'searchbarControlContainer ol-unselectable ol-control';

    super({
      element: element,
    });

    this.clearBtn.type = 'button';
    this.clearBtn.className = 'clear';

    element.appendChild(this.inputElement);
    element.appendChild(this.clearBtn);

    const closeDropdown = () => {
      this.setIsOpen(false);
      const pathAfterClosing = this.history.location.pathname;
      if (this.curPath !== pathAfterClosing) {
        this.setSearchQuery('');
        this.inputElement.value = '';
        this.clearBtn.className = 'clear';
      }
    };

    this.inputElement.addEventListener('focus', () => {
      this.setIsOpen(true);
      this.setSearchQuery(this.inputElement.value.trim().toLowerCase());
      this.setActiveSelection(0);
      this.element.classList.add('focused');
    });
    this.inputElement.addEventListener('input', () => {
      this.setIsOpen(true);
      this.setSearchQuery(this.inputElement.value.trim().toLowerCase());
      this.setActiveSelection(0);
      if (this.inputElement.value.length > 0) {
        this.inputElement.className = 'has-value';
        this.clearBtn.className = 'clear show';
      } else {
        this.inputElement.className = '';
        this.clearBtn.className = 'clear';
      }
    });
    this.inputElement.addEventListener('blur', () => {
      this.element.classList.remove('focused');
      setTimeout(closeDropdown, 200);
    });

    const handleEscape = () => {
      closeDropdown();
    };

    const handleTab = () => {
      this.setIsOpen(false);
    };

    const handleArrowDown = () => {
      if (!this.isOpen) {
        this.setIsOpen(true);
      } else if (this.filteredData.length > 0) {
        this.setActiveSelection(this.activeSelection >= this.filteredData.length ? 1 : this.activeSelection + 1);
      }
    };

    const handleArrowUp = () => {
      this.setActiveSelection(this.activeSelection < 2 ? this.filteredData.length : this.activeSelection - 1);
    };

    const handleEnter = () => {
      closeDropdown();

      if (this.activeSelection) {
        this.history.push('/kortit/' + this.filteredData[this.activeSelection - 1].id);
      } else if (this.filteredData.length === 1) {
        this.history.push('/kortit/' + this.filteredData[0].id);
      } else {
        const searchTerm = this.inputElement.value.trim().toLowerCase();
        const card = this.filteredData
          .filter(
            (data) =>
              data.name.fi?.toLowerCase() === searchTerm || data.name.sv?.toLowerCase() === searchTerm || data.name.en?.toLowerCase() === searchTerm
          )
          .pop();
        if (card) {
          this.history.push('/kortit/' + card.id);
        }
      }
    };

    this.inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') handleEscape();
      if (event.key === 'Tab' && this.isOpen && this.inputElement.value.trim().length >= MINIMUM_QUERYLENGTH) {
        event.preventDefault();
        handleTab();
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleArrowDown();
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleArrowUp();
      }
      if (event.key === 'Enter' && this.isOpen) {
        handleEnter();
      }
    });

    this.clearBtn.addEventListener('click', () => {
      this.setSearchQuery('');
      this.inputElement.value = '';
      this.inputElement.className = '';
      this.clearBtn.className = 'clear';
      this.inputElement.focus();
    });
  }

  public setPlaceholder(placeholder: string) {
    this.inputElement.placeholder = placeholder;
  }

  public setTitle(title: string) {
    this.inputElement.title = title;
    this.inputElement.ariaLabel = title;
  }

  public setClearTitle(title: string) {
    this.clearBtn.title = title;
    this.clearBtn.ariaLabel = title;
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
    this.curPath = history.location.pathname;
  }

  public disable() {
    this.inputElement.disabled = true;
    this.element.style.opacity = '0.5';
  }
}

export default SearchbarControl;
