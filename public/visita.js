document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica do Menu Hambúrguer ---
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

    // --- Lógica do Formulário ---
    const form = document.getElementById('visitaForm');
    const formStatus = document.getElementById('form-status');
    const telefoneInput = document.getElementById('telefone');
    const outrosCampo = document.getElementById('outros-campo');
    const outrosDescricao = document.getElementById('outros-descricao');

    // 1. LÓGICA PARA MOSTRAR/ESCONDER CAMPO "OUTROS"
    const tipoContatoRadios = document.querySelectorAll('input[name="tipoContato"]');
    tipoContatoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'outros') {
                outrosCampo.classList.remove('campo-oculto');
                outrosCampo.classList.add('campo-visivel');
                outrosDescricao.required = true;
            } else {
                outrosCampo.classList.remove('campo-visivel');
                outrosCampo.classList.add('campo-oculto');
                outrosDescricao.required = false;
            }
        });
    });

    // 2. FUNÇÃO PARA FORMATAR O TELEFONE EM TEMPO REAL
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue = '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            formattedValue += ') ' + value.substring(2, 7);
        }
        if (value.length > 7) {
            formattedValue += '-' + value.substring(7, 11);
        }

        e.target.value = formattedValue;
    });

    // 3. CÓDIGO DE ENVIO DO FORMULÁRIO (Formspree)
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        data.localidade = 'São Paulo, SP, Brasil'; 

        const formAction = 'https://formspree.io/f/xkgvkrjy';

        fetch(formAction, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                formStatus.textContent = 'Sua solicitação foi enviada com sucesso! Em breve, nossa equipe entrará em contato.';
                formStatus.className = 'form-status-message success';
                form.reset();
                outrosCampo.classList.remove('campo-visivel');
                outrosCampo.classList.add('campo-oculto');
            } else {
                formStatus.textContent = 'Ocorreu um erro ao enviar. Por favor, tente novamente mais tarde.';
                formStatus.className = 'form-status-message error';
            }
            formStatus.style.display = 'block';
        })
        .catch(error => {
            console.error('Erro de envio:', error);
            formStatus.textContent = 'Ocorreu um erro ao enviar. Por favor, verifique sua conexão.';
            formStatus.className = 'form-status-message error';
            formStatus.style.display = 'block';
        });
    });
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