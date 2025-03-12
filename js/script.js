document.querySelector('.search-btn').addEventListener('click', function () {
    if (document.querySelector('.mobile-search')) return;

    const searchForm = document.createElement('div');
    searchForm.className = 'mobile-search fade';
    searchForm.innerHTML = `
        <div class="mobile-search-inner">
            <div class="search-container">
                <input type="text" placeholder="SEARCH GAMES & FLASH">
            </div>
            <i class="fas fa-times close-search"></i>
        </div>
    `;

    document.querySelector('.header').after(searchForm);

    searchForm.offsetHeight;

    searchForm.classList.add('show');

    const input = searchForm.querySelector('input');
    setTimeout(() => input.focus(), 150);

    searchForm.querySelector('.close-search').addEventListener('click', closeSearch);

    searchForm.addEventListener('click', function (e) {
        if (e.target === searchForm) {
            closeSearch();
        }
    });

    function closeSearch() {
        searchForm.classList.remove('show');
        setTimeout(() => {
            searchForm.remove();
        }, 150);
    }
});

document.querySelector('.menu').addEventListener('click', function () {
    document.querySelector('.side-menu').classList.add('active');
});

document.querySelector('.close-menu').addEventListener('click', function () {
    document.querySelector('.side-menu').classList.remove('active');
});

document.addEventListener('click', function(e) {
    const sideMenu = document.querySelector('.side-menu');
    const menuButton = document.querySelector('.menu');
    
    if (sideMenu.classList.contains('active') && 
        !sideMenu.contains(e.target) && 
        !menuButton.contains(e.target)) {
        sideMenu.classList.remove('active');
    }
});

let lastScrollTop = 0;
const header = document.querySelector('.header');
const headerHeight = header.offsetHeight;

header.style.transition = 'transform 0.3s ease-in-out';

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});