/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-else-return */
/* eslint-disable max-len */

class CountriesTable {
  tableBody: HTMLElement;
  currentPage: number;
  countriesPerPage: number;
  countriesData: { name: string, capital: string, currency: { name: string, symbol: string}, language: { name: string } }[];
  currentSortColumn: string | null;
  currentSortOrder: 'asc' | 'desc';
  countryInput: HTMLInputElement;
  capitalInput: HTMLInputElement;
  currencyInput: HTMLInputElement;
  languageInput: HTMLInputElement;
  searchButton: HTMLButtonElement;
  clearButton: HTMLButtonElement;

  constructor(tableBodyClass: string, countriesPerPage = 20) {
    this.tableBody = document.querySelector(tableBodyClass);
    this.currentPage = 1;
    this.countriesPerPage = countriesPerPage;
    this.countriesData = [];
    this.currentSortColumn = null;
    this.currentSortOrder = 'asc';
    this.countryInput = document.querySelector('.js-country-input');
    this.capitalInput = document.querySelector('.js-capital-input');
    this.currencyInput = document.querySelector('.js-currency-input');
    this.languageInput = document.querySelector('.js-language-input');
    this.searchButton = document.querySelector('.js-search-button');
    this.clearButton = document.querySelector('.js-clear-button');
    this.clearButton.addEventListener('click', () => this.clearSearch());
  }

  fetchCountriesData = (): Promise<{ name: string, capital: string, currency: { name: string, symbol: string}, language: { name: string } }[]> => fetch('http://localhost:3004/countries').then((response) => response.json());

  fetchTotalCountries = (): Promise<number> => this.fetchCountriesData().then((data) => data.length);

  populateTable = (data: { name: string, capital: string, currency: { name: string, symbol: string}, language: { name: string } }[]): void => {
    const startIndex = (this.currentPage - 1) * this.countriesPerPage;
    const endIndex = startIndex + this.countriesPerPage;
    const countriesToShow = data.slice(startIndex, endIndex);

    this.tableBody.innerHTML = '';

    countriesToShow.forEach((countries) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${countries.name}</td><td>${countries.capital}</td><td>${countries.currency.name}, ${countries.currency.symbol}</td><td>${countries.language.name}`;
      this.tableBody.appendChild(row);
    });

    this.updatePagination();
  };

  updatePagination = (): void => {
    const previousBtn = document.querySelector('.js-previous-button');
    const nextBtn = document.querySelector('.js-next-button');

    if (this.currentPage === 1) {
      previousBtn.classList.add('is-hidden');
    } else {
      previousBtn.classList.remove('is-hidden');
    }

    const totalSearchResults = this.countriesData.length;
    const totalPages = Math.ceil(totalSearchResults / this.countriesPerPage);

    if (this.currentPage === totalPages || totalSearchResults <= this.countriesPerPage) {
      nextBtn.classList.add('is-hidden');
    } else {
      nextBtn.classList.remove('is-hidden');
    }
  };

  sortTable = (column: string): void => {
    if (this.currentSortColumn === column) {
      this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.currentSortOrder = 'asc';
    }

    this.countriesData.sort((a, b) => {
      const valueA = this.getColumnValue(a, column).toLowerCase();
      const valueB = this.getColumnValue(b, column).toLowerCase();

      if (this.currentSortOrder === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });

    this.populateTable(this.countriesData);
  };

  getColumnValue = (data: any, column: string): string => {
    if (column === 'name' || column === 'capital') {
      return data[column];
    } else if (column === 'currency') {
      return `${data.currency.name}, ${data.currency.symbol}`;
    } else if (column === 'language') {
      return data.language.name;
    }

    return '';
  };

  search = (): void => {
    const countryText = this.countryInput.value.toLowerCase();
    const capitalText = this.capitalInput.value.toLowerCase();
    const currencyText = this.currencyInput.value.toLowerCase();
    const languageText = this.languageInput.value.toLowerCase();

    const hasInput = countryText || capitalText || currencyText || languageText;

    if (hasInput) {
      this.countriesData = this.countriesData.filter((country) => (
        country.name.toLowerCase().includes(countryText)
            && country.capital.toLowerCase().includes(capitalText)
            && (`${country.currency.name} ${country.currency.symbol}`).toLowerCase().includes(currencyText)
            && country.language.name.toLowerCase().includes(languageText)
      ));

      this.currentPage = 1;
      this.populateTable(this.countriesData);
      this.clearButton.classList.remove('is-hidden');
    } else {
      this.currentPage = 1;
      this.populateTable(this.countriesData);
      this.clearButton.classList.add('is-hidden');
    }
  };

  clearSearch = (): void => {
    this.countryInput.value = '';
    this.capitalInput.value = '';
    this.currencyInput.value = '';
    this.languageInput.value = '';

    this.clearButton.classList.add('is-hidden');

    this.fetchCountriesData().then((data) => {
      this.countriesData = data;
      this.currentPage = 1;
      this.populateTable(this.countriesData);
    });
  };

  init = (): Promise<void> => this.fetchCountriesData().then((data) => {
    this.countriesData = data;
    this.populateTable(this.countriesData);
    this.updatePagination();

    this.searchButton.addEventListener('click', () => {
      this.search();
    });
  });

  nextPage(): void {
    const totalSearchResults = this.countriesData.length;
    const totalPages = Math.ceil(totalSearchResults / this.countriesPerPage);

    if (this.currentPage < totalPages) {
      this.currentPage += 1;
      this.populateTable(this.countriesData);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.populateTable(this.countriesData);
    }
  }
}

const countriesTable = new CountriesTable('.js-table-body');
countriesTable.init();

document.querySelector('.js-previous-button').addEventListener('click', () => {
  countriesTable.prevPage();
});

document.querySelector('.js-next-button').addEventListener('click', () => {
  countriesTable.nextPage();
});

const sortButtons = document.querySelectorAll('.js-sort-button');

sortButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const column = button.getAttribute('data-column');
    countriesTable.sortTable(column);
  });
});
