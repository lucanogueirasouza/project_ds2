require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

// Verificação simples para variáveis obrigatórias
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET não está definido no .env');
  process.exit(1);
}
if (!MONGO_URI) {
  console.error('❌ MONGO_URI não está definido no .env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir arquivos estáticos

// Conexão com o MongoDB (sem opções depreciadas)
mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 Conectado ao MongoDB'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Schema e modelo do post
const postSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  data: { type: Date, default: Date.now },
  autor: { type: String, required: true },
});
const Post = mongoose.model('Post', postSchema);

// Schema e modelo do comentário
const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  movie_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', commentSchema);

// Usuários com senha criptografada (senhas vêm do .env)
const users = [
  { username: process.env.USER1, password: bcrypt.hashSync(process.env.PASS1, 10), isAdmin: true },
  { username: process.env.USER2, password: bcrypt.hashSync(process.env.PASS2, 10), isAdmin: true },
  { username: process.env.USER3, password: bcrypt.hashSync(process.env.PASS3, 10), isAdmin: true },
  { username: process.env.USER4, password: bcrypt.hashSync(process.env.PASS4, 10), isAdmin: true },
];

// Middleware para validar token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Rota de login (gera JWT)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Usuário ou senha inválidos' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Usuário ou senha inválidos' });

  const token = jwt.sign(
    { username: user.username, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Criar novo post (apenas admin)
app.post('/posts', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Apenas administradores podem publicar posts." });
  }

  const { texto } = req.body;
  if (!texto) return res.status(400).json({ message: "Texto é obrigatório" });

  try {
    const novoPost = new Post({
      texto,
      autor: req.user.username || "Administrador",
    });

    await novoPost.save();
    res.status(201).json({ message: "Post criado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao salvar o post." });
  }
});

// Listar posts em ordem reversa (do mais novo para o mais antigo)
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ data: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar posts." });
  }
});

// Apagar post por ID (apenas admin)
app.delete('/posts/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Apenas administradores podem apagar posts." });
  }

  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post apagado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Erro ao apagar post." });
  }
});

// --- Rotas para comentários ---

// Criar comentário (qualquer usuário autenticado pode criar)
app.post('/comments', authenticateToken, async (req, res) => {
  const { name, email, movie_id, text } = req.body;
  if (!name || !email || !movie_id || !text) {
    return res.status(400).json({ message: "Todos os campos (name, email, movie_id, text) são obrigatórios." });
  }

  try {
    const novoComment = new Comment({ name, email, movie_id, text });
    await novoComment.save();
    res.status(201).json({ message: "Comentário criado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao salvar o comentário." });
  }
});

// Listar comentários ordenados por data decrescente
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar comentários." });
  }
});

// Apagar comentário por ID (apenas admin)
app.delete('/comments/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Apenas administradores podem apagar comentários." });
  }

  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comentário apagado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Erro ao apagar comentário." });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
