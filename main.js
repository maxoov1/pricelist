const pricelistContentsPath =
  'https://api.github.com/repos/maxoov1/pricelist-data/contents/searchable-generated.min.json?ref=main';

const pricelistContents = async (token) => {
  const request = {
    headers: {
      'Accept': 'application/vnd.github.raw+json',
      'Authorization': `Bearer ${token}`,
    }
  };

  const response = await fetch(pricelistContentsPath, request);
  return await response.json();
};

const createSettings = (element) => {
  const storageKey = element.dataset.storageKey;

  element.value = localStorage.getItem(storageKey);
  element.addEventListener('change', () => localStorage.setItem(storageKey, element.value));

  return () => localStorage.getItem(storageKey) ?? '';
};

const createDebounceCallback = (callback, timeout, ...args) => {
  let timeoutId = -1;

  const debounceCallback = () => {
    if (timeoutId > 0) clearTimeout(timeoutId);
    setTimeout(callback, timeout, ...args);
  };

  return debounceCallback;
};

const convertCurrency = (price, currency) => {
  const storageKey = `currency_${currency.toLowerCase()}`;

  const exchangeValue = localStorage.getItem(storageKey);
  if (exchangeValue)
    return price * exchangeValue;

  return price;
};

const createQuerySearchResultElement = (querySearchResult) => {
  const convertedCurrency = convertCurrency(
    querySearchResult.price, querySearchResult.currency);

  const elementTemplate = `
    <p>${querySearchResult.code} — ${querySearchResult.manufacturer}</p>
    <p><i>${querySearchResult.description}</i></p>
    <p>${querySearchResult.price.toFixed(2)} ${querySearchResult.currency} = <b>${convertedCurrency.toFixed(2)} UAH</b></p>
  `;

  const querySearchResultElement = document.createElement('article');
  querySearchResultElement.innerHTML = elementTemplate;

  return querySearchResultElement;
};

const inputGithubToken = document.querySelector('#input-github-token');
const githubTokenStorage = createSettings(inputGithubToken);

const inputCurrencyUSD = document.querySelector('#input-currency-usd');
const currencyUSDStorage = createSettings(inputCurrencyUSD);

const inputCurrencyEUR = document.querySelector('#input-currency-eur');
const currencyEURStorage = createSettings(inputCurrencyEUR);

const inputSearch = document.querySelector('#input-search');
const listSearchResults = document.querySelector('#list-search-results');

let pricelistFileContent = undefined;

const debounceCallback = createDebounceCallback(async () => {
  if (pricelistFileContent == undefined)
    pricelistFileContent = await pricelistContents(githubTokenStorage());

  const searchQuery = new RegExp(inputSearch.value, 'i');
  const querySearchResults = pricelistFileContent.filter((element) =>
    element.code.search(searchQuery) > -1);

  const querySearchResultElements = querySearchResults.map((element) =>
    createQuerySearchResultElement(element));
  listSearchResults.replaceChildren(...querySearchResultElements);
}, 200);

inputSearch.addEventListener('input', () => debounceCallback());
