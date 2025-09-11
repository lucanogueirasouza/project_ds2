document.addEventListener('DOMContentLoaded', () => {

    // 1. ANIMAÇÃO DE SCROLL SUAVE PARA LINKS DE ÂNCORA
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Ajusta a rolagem para compensar a altura do navbar fixo
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. EFEITO DE SCROLL REVEAL PARA SEÇÕES
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.2 // Ação ocorre quando 20% do elemento está visível
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__active');
                observer.unobserve(entry.target); // Para a animação rodar apenas uma vez
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Seleciona os elementos que terão a animação
    const animatedElements = document.querySelectorAll('.intro, .historia-item, .card, .footer-expandido');
    animatedElements.forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {

    // --- NOVO: Lógica do Menu Hambúrguer ---
    const mobileMenu = document.getElementById('mobile-menu');
    const menu = document.querySelector('.menu');
    const botoes = document.querySelector('.botoes');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            menu.classList.toggle('is-active');
            botoes.classList.toggle('is-active');
        });
    }

    // ... [Seu código de animação de scroll e IntersectionObserver] ...

    // 1. ANIMAÇÃO DE SCROLL SUAVE PARA LINKS DE ÂNCORA
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. EFEITO DE SCROLL REVEAL PARA SEÇÕES
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__active');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const animatedElements = document.querySelectorAll('.intro, .historia-item, .card, .footer-expandido');
    animatedElements.forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', function() {
    // Código do menu hambúrguer, formulários, etc. já existentes.

    // --- Nova Lógica do Chatbot ---
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

});