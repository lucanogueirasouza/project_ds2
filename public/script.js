// Adicione esta declaração globalmente, antes de qualquer DOMContentLoaded ou função
let galeriaSwiper = null;

// Adicione as frases nas suas fotos (seu objeto galeriaFotos está correto)
const galeriaFotos = {
    patio: [
        { src: 'images/patio escolar.jpg', alt: 'Pátio da Escola.', caption: 'Pátio da Escola.' },
        { src: 'images/patio escolar2.jpg', alt: 'Pátio da Escola', caption: 'Visão panorâmica do pátio.' }
    ],
    frente: [
        { src: 'images/frente escola.jpg', alt: 'Fachada principal da escola', caption: 'A fachada da nossa escola.' },
        { src: 'images/frente escola2.jpg', alt: 'Entrada da escola', caption: 'A entrada principal.' }
    ],
    parquinho: [
        { src: 'images/parquinho.jpg', alt: 'Parquinho com brinquedos', caption: 'Parquinho para crianças.' },
        { src: 'images/parquinho2.jpg', alt: 'Parquinho com brinquedos', caption: 'Parquinho para crianças.' },
        { src: 'images/parquinho3.jpg', alt: 'Parquinho com brinquedos', caption: 'Parquinho para crianças.' }
    ],
    quadra: [
        { src: 'images/quadra.jpg', alt: 'Quadra poliesportiva', caption: 'Nossa quadra poliesportiva.' },
        { src: 'images/quadra2.jpg', alt: 'Jogo de basquete na quadra', caption: 'Jogos e atividades na quadra.' },
        { src: 'images/quadra3.jpg', alt: 'Parquinho com brinquedos', caption: 'Foto externa da quadra.' },
        { src: 'images/quadra4.jpg', alt: 'Parquinho com brinquedos', caption: 'Foto externa da quadra.' }
    ],
    biblioteca: [
        { src: 'images/biblioteca.jpg', alt: 'Alunos estudando na biblioteca', caption: 'Hora de estudar na biblioteca.' },
        { src: 'images/biblioteca2.jpg', alt: 'Estantes de livros da biblioteca', caption: 'Um ambiente de leitura e conhecimento.' },
        { src: 'images/biblioteca3.jpg', alt: 'Parquinho com brinquedos', caption: 'Foto da nossa Biblioteca.' },
    ],
    sala: [
        { src: 'images/sala de aula.jpeg', alt: 'Sala de aula com lousa digital', caption: 'Tecnologia em sala de aula.' },
        { src: 'images/sala de aula2.jpg', alt: 'Alunos em atividade em sala de aula', caption: 'Alunos dedicados ao aprendizado.' },
        { src: 'images/sala de aula3.jpg', alt: 'Parquinho com brinquedos', caption: 'Sala de aula universal.' }
    ],
    informatica: [
        { src: 'images/informatica 2 1.jpg', alt: 'Alunos na sala de informática', caption: 'Aulas práticas no laboratório de informática.' },
        { src: 'images/informatica.jpg', alt: 'Equipamentos da sala de informática', caption: 'Equipamentos modernos à disposição dos alunos.' },
        { src: 'images/informatica 2 2.jpg', alt: 'Parquinho com brinquedos', caption: 'Salas de informática a nossa.' },
    ],
    horta: [
        { src: 'images/plantacao.jpg', alt: 'Horta escolar com vegetais', caption: 'Nossa horta escolar.' },
        { src: 'images/plantacao2.jpg', alt: 'Parquinho com brinquedos', caption: 'Horta Escolar.' },
    ],

    laboratorio: [
        { src: 'images/laboratorio.jpg', alt: 'Horta escolar com vegetais', caption: 'Nosso laboratório de química.' },
    ]
};

// Função para renderizar a galeria com o novo estilo
function renderizarGaleria(categoria) {
    // Destrói a instância anterior do Swiper, se existir
    if (galeriaSwiper) {
        galeriaSwiper.destroy(true, true);
    }
    
    const galeriaWrapper = document.getElementById('galeria-wrapper');
    galeriaWrapper.innerHTML = ''; // Limpa o wrapper antes de adicionar novos slides
    
    const fotos = galeriaFotos[categoria];
    
    fotos.forEach(foto => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        const img = document.createElement('img');
        img.src = foto.src;
        img.alt = foto.alt;
        slide.appendChild(img);
        
        const caption = document.createElement('div');
        caption.className = 'slide-caption';
        caption.textContent = foto.caption;
        slide.appendChild(caption);
        
        galeriaWrapper.appendChild(slide);
    });

    // Re-inicializa o Swiper para a galeria
    galeriaSwiper = new Swiper('.galeria-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.galeria-swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.galeria-swiper-button-next',
            prevEl: '.galeria-swiper-button-prev',
        },
        // Adicione estes callbacks para controlar as classes de animação
        on: {
            slideChangeTransitionEnd: function () {
                // Remove a classe 'swiper-slide-active' de todos os slides
                document.querySelectorAll('.galeria-swiper .swiper-slide').forEach(slide => {
                    slide.classList.remove('swiper-slide-active');
                });
                // Adiciona a classe 'swiper-slide-active' ao slide ativo atual
                this.slides[this.activeIndex].classList.add('swiper-slide-active');
            },
            init: function() {
                // Garante que o primeiro slide tenha a classe ativa na inicialização
                this.slides[this.activeIndex].classList.add('swiper-slide-active');
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o Swiper para o carrossel de destaques
    const swiper = new Swiper('.swiper', { // Atenção: este seletor '.swiper' pode conflitar se houver múltiplos Swipers sem classes específicas. Considere usar '.destaques-swiper' se for o caso.
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
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
        },
    });

    // --- Lógica do Menu Hambúrguer ---
    const mobileMenu = document.getElementById('mobile-menu');
    const menu = document.querySelector('.menu');
    const botoes = document.querySelector('.botoes');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-active');
        menu.classList.toggle('is-active');
        botoes.classList.toggle('is-active');
    });

    // --- Lógica da Barra de Cookies ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
    const cookieName = 'cookiesAccepted';

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/; Secure; SameSite=Lax`;
    }

    function showCookieBanner() {
        if (!getCookie(cookieName)) {
            cookieBanner.style.display = 'block';
        }
    }

    acceptCookiesBtn.addEventListener('click', () => {
        setCookie(cookieName, 'true', 365);
        cookieBanner.style.display = 'none';
    });

    showCookieBanner();

    // --- Lógica do Chatbot ---
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseBtn = document.getElementById('close-chat');
    const chatbotBody = document.getElementById('chatbot-body');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Função para mostrar/esconder o chat
    chatbotToggleBtn.addEventListener('click', () => {
        chatbotContainer.classList.toggle('is-visible');
    });

    chatbotCloseBtn.addEventListener('click', () => {
        chatbotContainer.classList.remove('is-visible');
    });

    // Função para adicionar mensagem ao chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        chatbotBody.appendChild(messageDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight; // Rola para o final
    }

    // Lógica das respostas do bot
    function getBotResponse(message) {
    message = message.toLowerCase(); // Converte a mensagem para minúsculas

    // Respostas para horários de atendimento
    if (message.includes('horário') || message.includes('atendimento') || message.includes('funciona')) {
        return 'Nosso horário de atendimento é de segunda a sexta-feira, das 7h às 17h.';
    }
    
    // Respostas para matrículas
    if (message.includes('matrícula') || message.includes('matriculas') || message.includes('inscrição')) {
        return 'As matrículas para o próximo ano letivo estão abertas. Por favor, acesse a página "Agende sua Visita" para mais informações.';
    }

    // Respostas para localização e endereço
    if (message.includes('localização') || message.includes('endereço') || message.includes('onde fica')) {
        return 'Estamos localizados na R. Cachoeira Vida Nova, 378 - Conj. Promorar Raposo Tavares, São Paulo - SP, 05574-460. Você pode ver o mapa na nossa página de Localização.';
    }

    // Respostas para cursos
    if (message.includes('curso') || message.includes('cursos') || message.includes('técnico') || message.includes('estudar')) {
        return 'Atualmente, oferecemos o curso técnico de Desenvolvimento de Sistemas. Acesse a página "Curso Técnico" para saber mais!';
    }

    // Resposta para o telefone da escola
    if (message.includes('telefone') || message.includes('contato') || message.includes('ligar')) {
        return 'Você pode entrar em contato conosco pelo telefone (11) 3784-3772.';
    }
    
    // --- NOVAS RESPOSTAS BÁSICAS ---

    // Saudações
    if (message.includes('olá') || message.includes('oi') || message.includes('ola') || message.includes('bom dia') || message.includes('boa tarde')) {
        return 'Olá! Como posso te ajudar hoje?';
    }

    // Perguntas sobre a equipe
    if (message.includes('equipe') || message.includes('direção') || message.includes('professores')) {
        return 'Nossa equipe é formada por profissionais dedicados e apaixonados pela educação. Você pode conhecer mais sobre a direção e os professores na nossa página "Sobre Nós".';
    }

    // Despedidas
    if (message.includes('tchau') || message.includes('obrigado') || message.includes('valeu') || message.includes('agradeço')) {
        return 'De nada! Fico feliz em ajudar. Tenha um ótimo dia!';
    }
    
    // Resposta para perguntas sobre o bot
    if (message.includes('quem é você') || message.includes('o que você faz')) {
        return 'Eu sou o assistente virtual da E.E. Odair Mandela, criado para responder às suas perguntas mais frequentes de forma rápida e eficiente.';
    }

    // Resposta padrão (quando não entende a pergunta)
    return 'Desculpe, não entendi sua pergunta. Por favor, reformule ou entre em contato conosco diretamente pelo telefone (11) 3784-3772';
}

    // Função para enviar mensagem do usuário
    function sendMessage() {
        const userMessage = userInput.value.trim();
        if (userMessage !== '') {
            addMessage(userMessage, 'user');
            userInput.value = '';

            setTimeout(() => {
                const botResponse = getBotResponse(userMessage);
                addMessage(botResponse, 'bot');
            }, 800); // Resposta do bot depois de um pequeno delay
        }
    }

    // Evento de clique no botão de enviar
    sendBtn.addEventListener('click', sendMessage);

    // Evento de tecla Enter no input
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- Lógica da Galeria ---
    const galeriaBotoes = document.querySelectorAll('.btn-categoria');
    galeriaBotoes.forEach(btn => {
        btn.addEventListener('click', () => {
            galeriaBotoes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const categoria = btn.getAttribute('data-categoria');
            renderizarGaleria(categoria);
        });
    });
    
    // Renderiza a galeria 'patio' ao carregar a página pela primeira vez
    renderizarGaleria('patio');
});