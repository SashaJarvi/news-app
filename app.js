const newsService = (function () {
  const API_KEY = '9ef210caa5c54a349285000aa253dbd9',
    API_URL = 'https://newsapi.org/v2';

  return {
    async topHeadlines(country = 'ru', category = 'general') {
      const req = new Request(`${API_URL}/top-headlines?country=${country}&category=${category}&apiKey=${API_KEY}`);

      try {
        return await fetch(req)
          .then(response => response.json())
          .then(response => onGetResponse(response));
      } catch (e) {
        showAlert(e, 'error-msg');
      }
    },
    async everything(query) {
      const req = new Request(`${API_URL}/everything?q=${query}&apiKey=${API_KEY}`);

      try {
        return await fetch(req)
          .then(response => response.json())
          .then(response => onGetResponse(response));
      } catch (e) {
        showAlert(e);
      }
    }
  }
})();

// elements
const form = document.forms['newsControls'],
  countrySelect = form.elements['country'],
  categorySelect = form.elements['category'],
  searchInput = form.elements['search'];

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews();
});

// init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews()
});

// load news
function loadNews() {
  showPreloader();

  const country = countrySelect.value,
    category = categorySelect.value,
    searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, category);
  } else {
    newsService.everything(searchText);
  }
}

// function on get response
function onGetResponse(res) {
  removePreloader();

  if (res.status === 'error') {
    showAlert(res.message);
    return false
  }

  if (!res.articles.length) {
    showAlert('There are no results');
    return false
  }

  renderNews(res.articles)
}

// function for news item rendering
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');

  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  let fragment = '';

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// news item template function
function newsTemplate({urlToImage, title, url, description}) {

  return `
    <div class="card-wrapper col s12 m6">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage || './images/news-dummy.jpg'}" alt="">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}" target="_blank">Read More</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = 'error-msg') {
  M.toast({html: msg, classes: type, displayLength: 2500})
}

// clear container before adding new news items
function clearContainer(container) {
  let child = container.lastElementChild;

  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

function showPreloader() {
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="progress">
        <div class="indeterminate"></div>
    </div>
  `)
}

function removePreloader() {
  const loader = document.querySelector('.progress');

  if (loader) {
    loader.remove();
  }
}
