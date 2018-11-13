const sourcesNameToId = new Map();
const sourcesNames = [];
const settingOfRequest = {
    category: '',
    sources: '',
    pageSize: '',
    q: '',
};

fetch('https://newsapi.org/v2/sources?apiKey=2a878fc593044fdba0c5153f9a2a46e7')
    .then(res => res.json())
    .then(data => data.sources)
    .then(sources => sources.forEach(source => {
        sourcesNameToId.set(source.name, source.id);
        sourcesNames.push(source.name);
    }));

const searchInput = document.querySelector('.search-input');
const searchSubmit = document.querySelector('.search-submit');
const searchForm = document.querySelector('.src-form');
const searchButton = document.querySelector('.src-btn');
const srcIcn = document.querySelector('.src-icn');
const closeIcn = document.querySelector('.close-icn');
const menuIcon = document.querySelector('.menu-nav-icon');

searchButton.addEventListener('click', () => {
    srcIcn.classList.toggle('active');
    closeIcn.classList.toggle('active');
    searchForm.classList.toggle('active');
});

menuIcon.addEventListener('click', () => {
    const mainMenu = menuIcon.dataset.menu;
    document.querySelector(mainMenu).classList.toggle('visible-menu');
})

searchInput.addEventListener('input', (event) => {
    const searchedSourcesNames = sourcesNames
        .filter(sourceName => sourceName.toLowerCase()
            .indexOf(event.target.value.toLowerCase()) === 0);
    createAutosuggest(searchedSourcesNames);
});

const onSearchInputSubmit = (event) => {
    if (!event.keyCode  || event.keyCode && event.keyCode === 13) {
        searchButton.click();
        autosuggest.classList.add("hidden");
        const q = searchInput.value;
        settingOfRequest.q = q;
        requestData({q, numberOfRecords: settingOfRequest.numberOfRecords})
    }
};

searchSubmit.addEventListener('click', onSearchInputSubmit);

const autosuggest = document.querySelector('.autosuggest');
autosuggest.addEventListener('click', (event) => {
    if (event.target.dataset.source) {
        searchButton.click();
    autosuggest.classList.add("hidden");
    const sourceId = sourcesNameToId.get(event.target.dataset.source);
    settingOfRequest.publisher = sourceId;
    requestData({ publisher: sourceId, numberOfRecords: settingOfRequest.numberOfRecords });
    }   
});
const createAutosuggest = (sourceNames) => {
    while (autosuggest.firstChild) {
        autosuggest.removeChild(autosuggest.firstChild);
    }

    if (sourceNames.length === 0) {
        const newSourceName = document.createElement('div');
        newSourceName.classList.add("autosuggest-item-noclick");
        newSourceName.innerHTML = `Not found publisher, press enter or search button to search by this keyword(s)`;
        autosuggest.appendChild(newSourceName);      
    } else {
        sourceNames.forEach(sourceName => {
        const newSourceName = document.createElement('div');
        newSourceName.setAttribute('data-source', sourceName);
        newSourceName.classList.add("autosuggest-item");
        newSourceName.innerHTML = `${sourceName}`;

        autosuggest.appendChild(newSourceName);  
    });
    }
    autosuggest.style.bottom = `-${autosuggest.clientHeight}px`;
    autosuggest.classList.remove("hidden");
}

const topHeadlinesFilter = document.querySelector('.center');
const showTopHeadlinesFilter = isShown => {
    isShown ? topHeadlinesFilter.classList.remove("hidden"): topHeadlinesFilter.classList.add("hidden");   
}

function requestData({
    top = true, category, country = 'us', numberOfRecords, publisher, q
}) {
    showTopHeadlinesFilter(Boolean(q));
    const search = top ? `top-headlines` : `everything`;
    const queryMap = {
        apiKey: '2a878fc593044fdba0c5153f9a2a46e7', 
        category: category && !publisher ? category : '',
        country: top && !publisher ? country : '',
        sources: publisher || '',
        pageSize: numberOfRecords || '',
        q: q || ''
    }
    const query = Object.keys(queryMap)
                    .filter(key => queryMap[key])
                    .map(key => `${key}=${queryMap[key]}`)
                    .join('&');

    const url = `https://newsapi.org/v2/${search}?${query}`;
    const req = new Request(url);
    fetch(req)
        .then( response => response.json())
        .then(result => createArticles(result.articles))
};
requestData({});

const categories = document.querySelector('#main-menu');
const mainContent = document.querySelector('#main-content');

categories.onclick = (event) => {
    const category = event.target.dataset.name;
    settingOfRequest.category = category;
    requestData({category, numberOfRecords: settingOfRequest.numberOfRecords});
};

const settings = document.querySelector('.settings');
settings.addEventListener('submit', (event) => {
    event.preventDefault();
});

const cbx = document.querySelector('#cbx');
const toggle = document.querySelector('.toggle');
toggle.onclick = () => {
    settingOfRequest.top = !cbx.checked;
    requestData(settingOfRequest);
}

const numberInput = document.querySelector('#number');
const onNumberInputChange = (event) => {
    if (!event.keyCode  || event.keyCode && event.keyCode === 13) {
        settingOfRequest.numberOfRecords = event.target.value;
        requestData(settingOfRequest);
    }
};
numberInput.addEventListener('blur', onNumberInputChange);
numberInput.addEventListener('keypress', onNumberInputChange);

const createArticles = (articles) => {
    while (mainContent.firstChild) {
        mainContent.removeChild(mainContent.firstChild);
    }

    numberInput.value = articles.length;
    settingOfRequest.numberOfRecords = articles.length;

    articles.forEach(element => {
        const newArticle = document.createElement('div');
        newArticle.classList.add('article');
        newArticle.innerHTML = `<div class="title-post post pr-5 pr-sm-0 pt-5 float-left float-sm-none pos-relative w-1-3 w-sm-100 h-sm-300x"><a class="pos-relative h-100 dplay-block" target="_blank" href = "${element.url}">
                <div class="img-bg bg-4 bg-grad-layer-6" style="background-image: url(${element.urlToImage})"></div>
                <div class="abs-blr color-white p-20 bg-sm-color-7">
                    <h4 class="mb-10 mb-sm-5"><b>${element.title}</b></h4>
                    <ul class="list-li-mr-20">
                        <li>${new Date(element.publishedAt).toDateString()}</li>
                        <li><i class="color-primary mr-5 font-12 ion-ios-bolt"></i>${element.source.name}</li>
                    </ul>
                </div>
                    </a>
                    </div>`;
    mainContent.appendChild(newArticle);  
    });
    const clearfix = document.createElement('div');
    clearfix.classList.add("clearfix");
    mainContent.appendChild(clearfix); 
};