const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title')
const genresList = document.querySelector('.genres-list')
const rating = document.querySelector('.rating')
const description = document.querySelector('.description')
const modalLink = document.querySelector('.modal__link')
const serchFrom = document.querySelector('.search__form')
const serchFromInput = document.querySelector('.search__form-input')
const preloader = document.querySelector('.preloader')
const dropdown = document.querySelectorAll('.dropdown')
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper')
const modalContent = document.querySelector('.modal__content')
const pagination = document.querySelector('.pagination')
const loading = document.createElement('div');
loading.className = 'loading';

const DBServices = class {

    constructor() {
        this.SERVER = '​https://api.themoviedb.org/3';
        this.API_KEY = 'e0a0ffb990156c2792cb4a3790289388';
    }

    getData = async (url) => {
        const response = await fetch(url);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error (`не удалось получить данные по адресу ${url}`)
        }
    }
    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = query => {
        this.temp = `https://api.themoviedb.org/3/search/tv?api_key=${this.API_KEY}&language=ru-RU&query=${query}`;
        return this.getData(this.temp);
    }

    getNextPage = page => {
        return this.getData(this.temp + '&page=' + page)
    }

    getTvShow = id => this.getData(`https://api.themoviedb.org/3/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);

    getTopRated = () => this.getData(`https://api.themoviedb.org/3/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`)

    getPopular = () => this.getData(`https://api.themoviedb.org/3/tv/popular?api_key=${this.API_KEY}&language=ru-RU`)

    getToday = () => this.getData(`https://api.themoviedb.org/3/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`)

    getWeek = () => this.getData(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`)

};

const dbServices = new DBServices();

const renderCard = (response, target)  => {

    tvShowList.textContent = '';

    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'К сожелению по вашему запросу ничего не найдено...';
        tvShowsHead.style.color = 'red';
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска: ';
    tvShowsHead.style.color = 'black';

    response.results.forEach(item => {

        const {
                backdrop_path: backdrop,
                name: title,
                poster_path: poster,
                vote_average: vote,
                id
                } =  item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card  = document.createElement('li');
        card.idTV = id;
        card.className = 'tv-shows__item';
        card.innerHTML = `
            <a href="#" id="${id} "class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${backdropIMG}"
                    alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
        loading.remove();
        tvShowList.append(card);
    });

    pagination.textContent = '';

    if (!target && response.total_pages > 1) {
        for (let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
        }
    }
};

serchFrom.addEventListener('submit', event => {
    event.preventDefault();
    const value = serchFromInput.value.trim();
    if (value) {
        dbServices.getSearchResult(value).then(renderCard);
    }
    serchFromInput.value = '';
})

const closeDropdown = () => {
    dropdown.forEach((item) => {
        item.classList.remove('active');
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', event => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});


leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown  = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }

    if (target.closest('#top-rated')) {
        dbServices.getTopRated().then((response) => renderCard(response, target))
        tvShows.append(loading);
    }
    if (target.closest('#popular')) {
        dbServices.getToday().then((response) => renderCard(response, target))
        tvShows.append(loading);
    }
    if (target.closest('#week')) {
        dbServices.getWeek().then((response) => renderCard(response, target))
        tvShows.append(loading);
    }
    if (target.closest('#today')) {
        dbServices.getPopular().then((response) => renderCard(response, target))
        tvShows.append(loading);
    }
    if (target.closest('#search')) {
        tvShowList.textContent = '';
        tvShowsHead.textContent = '';
    }
});


tvShowList.addEventListener('click', event => {
    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {

        preloader.style.display = 'block';

        dbServices.getTvShow(card.id)
            .then(({
                poster_path: posterPath,
                name: title,
                genres,
                vote_average: voteAverage,
                overview,
                homepage
            }) => {

                if (posterPath) {
                    tvCardImg.src = IMG_URL + posterPath;
                    tvCardImg.alt = title;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = ''
                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '25px'
                }

                modalTitle.textContent = title;
                genresList.textContent = '';
                genres.forEach(item => {
                    genresList.innerHTML += `<li>${item.name}</li>`
                })

                rating.textContent = voteAverage;
                description.textContent = overview;
                modalLink.href = homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = '';
            })
    }
});

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');
    if (card)  {
        const img = card.querySelector('.tv-card__img');
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
        }
    }
};

tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains('pages')) {
        tvShowsHead.append(loading);
        dbServices.getNextPage(target.textContent).then(renderCard);
    }
})
