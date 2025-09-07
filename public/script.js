// Garante que o botão "Saiba Mais" funcione normalmente
const btn = document.querySelector('.btn');
if (btn) {
  btn.addEventListener('click', function () {
    // não usamos e.preventDefault()
    // assim o link abre normalmente para historia.html
  });
}

// Inicializa Swiper para o carrossel de destaques
const swiper = new Swiper('.swiper', {
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  autoplay: {
    delay: 6000,
    disableOnInteraction: false,
  },
});

document.addEventListener('DOMContentLoaded', () => {
    // Código do Swiper (seus códigos existentes)
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // --- Lógica de cookies ---
    
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
    const cookieName = 'cookiesAccepted';

    // Função para verificar se o cookie de consentimento já existe
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Função para criar o cookie de consentimento
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/; Secure; SameSite=Lax`;
    }

    // Função para exibir ou esconder a barra de cookies
    function showCookieBanner() {
        if (!getCookie(cookieName)) {
            cookieBanner.style.display = 'block';
        }
    }

    // Evento de clique no botão "Aceitar"
    acceptCookiesBtn.addEventListener('click', () => {
        setCookie(cookieName, 'true', 365); // Define o cookie por 365 dias
        cookieBanner.style.display = 'none';
    });

    // Chama a função para exibir a barra de cookies quando a página carregar
    showCookieBanner();
});
