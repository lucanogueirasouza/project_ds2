require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Verificação simples para variáveis obrigatórias
if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET não está definido no .env');
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// NOVO: Cria a pasta de uploads se ela não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// NOVO: Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Salva os arquivos na pasta 'uploads'
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // Limite de 100 MB por arquivo
        files: 5 // Limite de 5 arquivos por vez
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Apenas JPG, PNG, GIF, MP4 e WEBM são permitidos.'), false);
        }
    }
});

app.use(express.static('public')); // Servir arquivos estáticos da pasta 'public'
app.use('/uploads', express.static('uploads')); // NOVO: Servir arquivos da pasta 'uploads'

// ROTA ADICIONADA: Responde com uma mensagem simples para confirmar que o servidor está funcionando.
app.get('/', (req, res) => {
  res.send('Servidor Node.js está funcionando!');
});

// CORREÇÃO E ATUALIZAÇÃO: Lógica para escolher e conectar ao banco de dados com autenticação
const MONGO_TARGET = process.env.MONGO_TARGET;
let MONGO_URI;

if (MONGO_TARGET === 'cloud') {
    MONGO_URI = process.env.MONGO_URI_CLOUD;
} else if (MONGO_TARGET === 'local') {
    const DB_USER = process.env.DB_USER;
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_NAME = 'escola-odair-mandela'; // Usando o nome do banco de dados do seu log
    if (!DB_USER || !DB_PASSWORD) {
        console.error('❌ DB_USER ou DB_PASSWORD não estão definidos para o banco de dados local.');
        process.exit(1);
    }
    // CORREÇÃO: A URI agora usa o usuário e a senha para autenticação
    MONGO_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@meu-banco-de-dados:27017/${DB_NAME}?authSource=admin`;
} else {
    console.error('❌ MONGO_TARGET não está configurado corretamente no .env (deve ser "cloud" ou "local").');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('🟢 Conectado ao MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    });

// Schema e modelo do post
const postSchema = new mongoose.Schema({
    texto: { type: String, required: false },
    media: { type: [String], default: [] },
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
    { username: process.env.USER5, password: bcrypt.hashSync(process.env.PASS5, 10), isAdmin: true },
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

// Criar novo post (apenas admin, AGORA COM UPLOAD)
app.post('/posts', authenticateToken, upload.array('media', 5), async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Apenas administradores podem publicar posts." });
    }
    const { texto } = req.body;
    const mediaPaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];
    if (!texto && mediaPaths.length === 0) {
        return res.status(400).json({ message: "Texto ou arquivo de mídia é obrigatório" });
    }
    try {
        const novoPost = new Post({
            texto,
            media: mediaPaths,
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
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post não encontrado." });
        }
        
        // NOVO: Apaga os arquivos do post
        post.media.forEach(filePath => {
            const fullPath = path.join(__dirname, filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        
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
        return res.status(400).json({ message: 'Nome, email, ID do filme e texto são obrigatórios' });
    }
    
    try {
        const novoComentario = new Comment({
            name,
            email,
            movie_id,
            text
        });
        await novoComentario.save();
        res.status(201).json({ message: "Comentário adicionado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao salvar o comentário." });
    }
});
