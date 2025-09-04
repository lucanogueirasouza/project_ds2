// Este arquivo foi atualizado para usar um modal de login + notificações.

const API_URL = "http://localhost:3001";

const postBox = document.getElementById("postBox");
const postInput = document.getElementById("postInput");
const postButton = document.getElementById("postButton");
const feed = document.getElementById("feed");

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
    if (token) {
        const payload = parseJwt(token);
        isAdmin = payload?.isAdmin || false;

        postBox.style.display = "flex";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        isAdmin = false;
        postBox.style.display = "none";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
    loginModal.style.display = "none";
}

// Renderiza um post com um design de card mais elaborado
function renderPost(post) {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    const autorInicial = post.autor ? post.autor.charAt(0).toUpperCase() : '?';
    
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
    if (!confirm("Tem certeza que deseja apagar este post?")) return;

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
    } catch {
        notify("Erro ao conectar com o servidor", "error");
    }
}

postButton.addEventListener("click", async () => {
    const texto = postInput.value.trim();
    if (!texto) {
        notify("Digite algo para publicar!", "warning");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        notify("Você precisa estar logado para publicar", "warning");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ texto }),
        });

        if (res.ok) {
            postInput.value = "";
            carregarPosts();
            notify("Post publicado com sucesso!", "success");
        } else {
            const err = await res.json();
            notify(err.message || "Não foi possível publicar", "error");
        }
    } catch {
        notify("Erro ao conectar com o servidor", "error");
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
            notify("Usuário ou senha incorretos", "error");
        }
    } catch {
        notify("Erro ao conectar com o servidor", "error");
    }
});
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


// Inicialização
carregarPosts();
atualizarInterface();
