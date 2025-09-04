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
