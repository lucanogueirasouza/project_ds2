// Este arquivo foi atualizado para usar um modal de login + notificações.

// A URL da API agora é dinâmica. Ela usa a mesma origem do site que está sendo acessado.
const API_URL = window.location.origin;

// O restante do seu código JavaScript vai aqui.
// ... (o restante do seu código atual) ...

const postBox = document.getElementById("postBox");
const postInput = document.getElementById("postInput");
const postButton = document.getElementById("postButton");
const feed = document.getElementById("feed");
const mediaInput = document.getElementById("mediaInput");
const mediaPreviewContainer = document.getElementById("media-preview-container");

// Referências ao novo modal e botões
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const confirmLogin = document.getElementById("confirmLogin");
const closeModalBtn = document.querySelector(".close-btn");

// Contêiner de notificações
let notificationContainer = document.getElementById("notification-container");
if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notification-container";
    document.body.appendChild(notificationContainer);
}

let isAdmin = false; // controla se o usuário é admin
let filesToUpload = []; // Armazena os arquivos para upload

// Função de notificação
function notify(message, type = "info", duration = 3000) {
    const notif = document.createElement("div");
    notif.classList.add("notification", type);
    notif.textContent = message;

    notificationContainer.appendChild(notif);

    // Remove após o tempo definido
    setTimeout(() => {
        notif.classList.add("hide");
        setTimeout(() => notif.remove(), 400);
    }, duration);
}

// Decodifica token JWT para extrair payload
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

// Atualiza interface conforme login e admin
function atualizarInterface() {
    const token = localStorage.getItem("token");
    const tituloAvisos = document.getElementById("avisosTitulo");

    if (token) {
        const payload = parseJwt(token);
        isAdmin = payload?.isAdmin || false;

        postBox.style.display = "flex";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";

        // Se for admin, esconde o título "Avisos"
        if (isAdmin) {
            tituloAvisos.style.display = "none";
        }
    } else {
        isAdmin = false;
        postBox.style.display = "none";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";

        // Usuário comum → mostra o título
        tituloAvisos.style.display = "block";
    }

    loginModal.style.display = "none";
}

// Renderiza um post com um design de card mais elaborado
function renderPost(post) {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    const autorInicial = post.autor ? post.autor.charAt(0).toUpperCase() : '?';

    let mediaHTML = ''; // NOVO: HTML para exibir a mídia
    if (post.media && post.media.length > 0) {
        mediaHTML = `<div class="post-media-container">`;
        post.media.forEach(mediaPath => {
            const extension = mediaPath.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                mediaHTML += `<img src="${API_URL}/${mediaPath}" alt="Imagem do post" class="post-media">`;
            } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
                mediaHTML += `<video src="${API_URL}/${mediaPath}" controls class="post-media"></video>`;
            }
        });
        mediaHTML += `</div>`;
    }

    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${autorInicial}</div>
            <div class="post-info">
                <span class="post-author">${post.autor || "Administrador"}</span>
                <span class="post-time"><i class="far fa-clock"></i> ${new Date(post.data).toLocaleString("pt-BR", {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })}</span>
            </div>
        </div>
        <div class="post-content">
            ${post.texto}
        </div>
        ${mediaHTML}
    `;

    if (isAdmin) {
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.classList.add("apagar");
        deleteBtn.setAttribute("title", "Apagar post");
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            apagarPost(post._id);
        });
        postElement.appendChild(deleteBtn);
    }

    feed.appendChild(postElement);
}

// Carrega posts e chama renderPost
async function carregarPosts() {
    try {
        const res = await fetch(`${API_URL}/posts`);
        if (!res.ok) throw new Error("Erro ao carregar posts");
        const posts = await res.json();

        feed.innerHTML = "";
        posts.forEach(post => renderPost(post));
    } catch (error) {
        console.error(error);
        feed.innerHTML = "<p style='text-align: center; color: #777; padding: 20px;'>Erro ao carregar as atualizações.</p>";
        notify("Erro ao carregar atualizações", "error");
    }
}

// Apagar post por ID
async function apagarPost(id) {
    // CORREÇÃO: Removido o `confirm()` porque ele não funciona neste ambiente.
    // A ação de apagar agora acontece diretamente, com a notificação.
    const token = localStorage.getItem("token");
    if (!token) {
        notify("Você precisa estar logado para apagar posts", "warning");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
        });

        if (res.ok) {
            notify("Post apagado com sucesso!", "success");
            carregarPosts();
        } else {
            const err = await res.json();
            notify(err.message || "Não foi possível apagar o post", "error");
        }
    } catch (err) {
        // Adicionado log para ajudar a depurar erros de conexão.
        console.error("Erro na requisição DELETE:", err);
        notify("Erro ao conectar com o servidor.", "error");
    }
}

// Pré-visualiza os arquivos selecionados
mediaInput.addEventListener("change", (e) => {
    filesToUpload = Array.from(e.target.files);
    renderPreviews(); // Chamar a função para renderizar as pré-visualizações
});

function renderPreviews() {
    mediaPreviewContainer.innerHTML = '';
    filesToUpload.forEach((file, index) => {
        const previewDiv = document.createElement('div');
        previewDiv.classList.add('media-preview');

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            previewDiv.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.autoplay = false;
            video.controls = false; // Removido controls para deixar mais clean na prévia
            previewDiv.appendChild(video);
        }

        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-media');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => {
            filesToUpload.splice(index, 1);
            // IMPORTANTE: Se todos os arquivos forem removidos, o input.value deve ser limpo
            if (filesToUpload.length === 0) {
                mediaInput.value = ''; // Limpa o valor do input file
            }
            renderPreviews(); // Renderiza novamente após remover
        });
        previewDiv.appendChild(removeBtn);
        mediaPreviewContainer.appendChild(previewDiv);
    });
}

postButton.addEventListener("click", async () => {
    const texto = postInput.value.trim();

    if (!texto && filesToUpload.length === 0) {
        notify("Digite algo ou anexe um arquivo para publicar!", "warning");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        notify("Você precisa estar logado para publicar", "warning");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("texto", texto);

        filesToUpload.forEach(file => {
            formData.append("media", file);
        });

        // Adicionado log para depuração.
        console.log("Tentando enviar o post. Conteúdo do FormData:", formData);

        const res = await fetch(`${API_URL}/posts`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
            },
            body: formData,
        });

        if (res.ok) {
            postInput.value = "";
            filesToUpload = []; // Limpa os arquivos
            mediaInput.value = ''; // Limpa o input
            mediaPreviewContainer.innerHTML = ''; // Limpa a pré-visualização
            carregarPosts();
            notify("Post publicado com sucesso!", "success");
        } else {
            const err = await res.json();
            // Adicionado log para ajudar a depurar erros da API.
            console.error("Erro ao publicar post:", err);
            notify(err.message || "Não foi possível publicar", "error");
        }
    } catch (err) {
        // Adicionado log para ajudar a depurar erros de conexão.
        console.error("Erro na requisição POST:", err);
        notify("Erro ao conectar com o servidor.", "error");
    }
});

// Abrir modal
loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
});

// Fechar modal
closeModalBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
});
window.addEventListener("click", (e) => {
    if (e.target == loginModal) {
        loginModal.style.display = "none";
    }
});

// Logout
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    atualizarInterface();
    carregarPosts();
    notify("Você saiu da conta", "info");
});

// Login
confirmLogin.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        notify("Preencha usuário e senha", "warning");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            loginModal.style.display = "none";
            atualizarInterface();
            carregarPosts();
            notify("Login efetuado com sucesso!", "success");
        } else {
            const err = await res.json();
            notify(err.message || "Usuário ou senha incorretos", "error");
        }
    } catch {
        notify("Erro ao conectar com o servidor", "error");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const menu = document.querySelector('.menu');
    const navbarActions = document.querySelector('.navbar-actions');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            menu.classList.toggle('is-active');
            navbarActions.classList.toggle('is-active');
        });
    }
    
    // --- Restante do seu código `atualizacoes.js` ---
    // Chame as funções para carregar o conteúdo e atualizar a interface
    atualizarInterface();
    carregarPosts();
});

// A sua função `atualizarInterface` e todas as outras
// que estavam no início do seu arquivo .js devem continuar lá.
// Apenas garanta que o código do menu hambúrguer foi adicionado.

// Inicialização
carregarPosts();
atualizarInterface();

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
