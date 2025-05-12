const board = document.getElementById('board');
const addListBtn = document.getElementById('addListBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const modalSave = document.getElementById('modal-save');
const modalCancel = document.getElementById('modal-cancel');

let data = JSON.parse(localStorage.getItem('trelloData')) || [];

// Função para salvar no localStorage
function saveData() {
    localStorage.setItem('trelloData', JSON.stringify(data));
}

// Renderizar as listas
function renderBoard() {
    board.innerHTML = '';
    data.forEach((list, listIndex) => {
        const listEl = document.createElement('div');
        listEl.className = 'list';
        listEl.innerHTML = `
            <h3>
                <span>${list.title}</span>
                <div class="list-actions">
                    <button class="edit-btn" data-type="editList" data-list="${listIndex}">✏️</button>
                    <button class="delete-btn" data-type="deleteList" data-list="${listIndex}">🗑️</button>
                </div>
            </h3>
            <div class="cards" id="list-${listIndex}">
                ${list.cards.map((card, cardIndex) => `
                    <div class="card">
                        <div class="card-text">${card}</div>
                        <div class="card-actions">
                            <button class="edit-btn" data-type="editCard" data-list="${listIndex}" data-card="${cardIndex}">✏️</button>
                            <button class="delete-btn" data-type="deleteCard" data-list="${listIndex}" data-card="${cardIndex}">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="add-card-btn" data-type="addCard" data-list="${listIndex}">+ Adicionar Card</button>
        `;
        board.appendChild(listEl);

        listEl.querySelectorAll('button').forEach(button => {
            const type = button.dataset.type;
            const listIdx = parseInt(button.dataset.list);
            const cardIdx = parseInt(button.dataset.card);

            button.addEventListener('click', () => {
                switch (type) {
                    case 'editList':
                        openModal('editList', listIdx);
                        break;
                    case 'deleteList':
                        deleteList(listIdx);
                        break;
                    case 'addCard':
                        openModal('addCard', listIdx);
                        break;
                    case 'editCard':
                        openModal('editCard', listIdx, cardIdx);
                        break;
                    case 'deleteCard':
                        deleteCard(listIdx, cardIdx);
                        break;
                }
            });
        });

        // Ativar drag & drop usando SortableJS
        new Sortable(document.getElementById(`list-${listIndex}`), {
            group: 'shared',
            animation: 150,
            onEnd: updateDataFromDOM
        });
    });
}

// Funções para abrir modais
function openModal(type, listIndex = null, cardIndex = null) {
    modal.classList.remove('hidden');
    modalInput.value = '';

    if (type === 'addList') {
        modalTitle.innerText = 'Adicionar nova lista';
        modalSave.onclick = () => addList();
    } else if (type === 'editList') {
        modalTitle.innerText = 'Editar lista';
        modalInput.value = data[listIndex].title;
        modalSave.onclick = () => editList(listIndex);
    } else if (type === 'addCard') {
        modalTitle.innerText = 'Adicionar novo card';
        modalSave.onclick = () => addCard(listIndex);
    } else if (type === 'editCard') {
        modalTitle.innerText = 'Editar card';
        modalInput.value = data[listIndex].cards[cardIndex];
        modalSave.onclick = () => editCard(listIndex, cardIndex);
    }
}

function closeModal() {
    modal.classList.add('hidden');
}

modalCancel.addEventListener('click', closeModal);

// Funções de manipulação de listas e cards
function addList() {
    const title = modalInput.value.trim();
    if (title) {
        data.push({ title, cards: [] });
        saveData();
        renderBoard();
        closeModal();
    }
}

function editList(listIndex) {
    const newTitle = modalInput.value.trim();
    if (newTitle) {
        data[listIndex].title = newTitle;
        saveData();
        renderBoard();
        closeModal();
    }
}

function deleteList(listIndex) {
    if (confirm('Tem certeza de que deseja excluir esta lista?')) {
        data.splice(listIndex, 1);
        saveData();
        renderBoard();
    }
}

function addCard(listIndex) {
    const text = modalInput.value.trim();
    if (text) {
        data[listIndex].cards.push(text);
        saveData();
        renderBoard();
        closeModal();
    }
}

function editCard(listIndex, cardIndex) {
    const newText = modalInput.value.trim();
    if (newText) {
        data[listIndex].cards[cardIndex] = newText;
        saveData();
        renderBoard();
        closeModal();
    }
}

function deleteCard(listIndex, cardIndex) {
    if (confirm('Tem certeza de que deseja excluir este card?')) {
        data[listIndex].cards.splice(cardIndex, 1);
        saveData();
        renderBoard();
    }
}

// Atualizar a estrutura (data) depois do drag & drop
function updateDataFromDOM() {
    const newData = [];
    document.querySelectorAll('.list').forEach(listEl => {
        const title = listEl.querySelector('h3 span').innerText;
        const cards = [];
        listEl.querySelectorAll('.card .card-text').forEach(cardEl => {
            cards.push(cardEl.innerText);
        });
        newData.push({ title, cards });
    });
    data = newData;
    saveData();
}

// Inicializar o app
addListBtn.addEventListener('click', () => openModal('addList'));
renderBoard();
