const API_URL = "http://localhost:3001";

const postBox = document.getElementById("postBox");
const postInput = document.getElementById("postInput");
const postButton = document.getElementById("postButton");
const feed = document.getElementById("feed");

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const confirmLogin = document.getElementById("confirmLogin");

let isAdmin = false; // controla se o usuário é admin

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
    loginForm.style.display = "none";
  } else {
    isAdmin = false;
    postBox.style.display = "none";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    loginForm.style.display = "none";
  }
}

// Renderiza um post com botão apagar se admin
function renderPost(post) {
  const postElement = document.createElement("div");
  postElement.classList.add("post");
  postElement.innerHTML = `
    <p>${post.texto}</p>
    <time>${new Date(post.data).toLocaleString("pt-BR")}</time>
    <span class="usuario-post">${post.autor || "Administrador"}</span>
  `;

  if (isAdmin) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Apagar";
    deleteBtn.classList.add("apagar");
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.fontSize = "0.8em";
    deleteBtn.style.color = "#888";
    deleteBtn.style.background = "transparent";
    deleteBtn.style.border = "none";
    deleteBtn.style.padding = "2px 6px";
    deleteBtn.style.borderRadius = "3px";
    deleteBtn.addEventListener("mouseenter", () => {
      deleteBtn.style.color = "#f00";
    });
    deleteBtn.addEventListener("mouseleave", () => {
      deleteBtn.style.color = "#888";
    });
    deleteBtn.addEventListener("click", () => apagarPost(post._id));
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
    feed.innerHTML = "<p>Erro ao carregar as atualizações.</p>";
  }
}

// Apagar post por ID (só admin)
async function apagarPost(id) {
  if (!confirm("Tem certeza que deseja apagar este post?")) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado para apagar posts.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (res.ok) {
      alert("Post apagado com sucesso!");
      carregarPosts();
    } else {
      const err = await res.json();
      alert("Erro: " + (err.message || "Não foi possível apagar o post."));
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
}

postButton.addEventListener("click", async () => {
  const texto = postInput.value.trim();
  if (!texto) {
    alert("Digite algo para publicar!");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado para publicar.");
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
      alert("Post publicado com sucesso!");
    } else {
      const err = await res.json();
      alert("Erro: " + (err.message || "Não foi possível publicar."));
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
});

loginBtn.addEventListener("click", () => {
  loginForm.style.display = "flex";
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  atualizarInterface();
  carregarPosts();
});

confirmLogin.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Preencha usuário e senha");
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
      loginForm.style.display = "none";
      atualizarInterface();
      carregarPosts();
      alert("Login efetuado com sucesso!");
    } else {
      alert("Usuário ou senha incorretos.");
    }
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
});

// Inicialização
carregarPosts();
atualizarInterface();
