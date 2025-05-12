// Seleção dos elementos do DOM
const board = document.getElementById('board');
const addListBtn = document.getElementById('addListBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const modalSave = document.getElementById('modal-save');
const modalCancel = document.getElementById('modal-cancel');

// Recuperação dos dados do localStorage ou inicialização de um array vazio
let data = JSON.parse(localStorage.getItem('trelloData')) || [];

// Função para salvar os dados no localStorage
function saveData() {
    localStorage.setItem('trelloData', JSON.stringify(data));
}

// Função para renderizar o quadro com as listas e cards
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
                    <div class="card ${card.done ? 'done' : ''}">
                        <div class="card-text">${card.text}</div>
                        <div class="card-actions">
                            <button class="toggle-done-btn" data-type="toggleDone" data-list="${listIndex}" data-card="${cardIndex}">${card.done ? '✅' : '☐'}</button>
                            <button class="edit-btn" data-type="editCard" data-list="${listIndex}" data-card="${cardIndex}">✏️</button>
                            <button class="delete-btn" data-type="deleteCard" data-list="${listIndex}" data-card="${cardIndex}">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="add-card-btn" data-type="addCard" data-list="${listIndex}">+ Adicionar Card</button>
        `;
        board.appendChild(listEl);

        // Adição de event listeners para os botões de ação
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
                    case 'toggleDone':
                        toggleCardDone(listIdx, cardIdx);
                        break;
                }
            });
        });

        // Ativação do recurso de arrastar e soltar usando SortableJS
        new Sortable(document.getElementById(`list-${listIndex}`), {
            group: 'shared',
            animation: 150,
            onEnd: updateDataFromDOM
        });
    });

    // Ativação do recurso de arrastar e soltar para as listas
    new Sortable(board, {
        animation: 150,
        handle: 'h3',
        onEnd: updateDataFromDOM
    });
}

// Função para abrir o modal com base no tipo de ação
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
        modalInput.value = data[listIndex].cards[cardIndex].text;
        modalSave.onclick = () => editCard(listIndex, cardIndex);
    }
}

// Função para fechar o modal
function closeModal() {
    modal.classList.add('hidden');
}

// Event listener para o botão de cancelar no modal
modalCancel.addEventListener('click', closeModal);

// Função para adicionar uma nova lista
function addList() {
    const title = modalInput.value.trim();
    if (title) {
        data.push({ title, cards: [] });
        saveData();
        renderBoard();
        closeModal();
    }
}

// Função para editar o título de uma lista existente
function editList(listIndex) {
    const newTitle = modalInput.value.trim();
    if (newTitle) {
        data[listIndex].title = newTitle;
        saveData();
        renderBoard();
        closeModal();
    }
}

// Função para excluir uma lista
function deleteList(listIndex) {
    if (confirm('Tem certeza de que deseja excluir esta lista?')) {
        data.splice(listIndex, 1);
        saveData();
        renderBoard();
    }
}

// Função para adicionar um novo card a uma lista
function addCard(listIndex) {
    const text = modalInput.value.trim();
    if (text) {
        data[listIndex].cards.push({ text, done: false });
        saveData();
        renderBoard();
        closeModal();
    }
}

// Função para editar o texto de um card existente
function editCard(listIndex, cardIndex) {
    const newText = modalInput.value.trim();
    if (newText) {
        data[listIndex].cards[cardIndex].text = newText;
        saveData();
        renderBoard();
        closeModal();
    }
}

// Função para excluir um card de uma lista
function deleteCard(listIndex, cardIndex) {
    if (confirm('Tem certeza de que deseja excluir este card?')) {
        data[listIndex].cards.splice(cardIndex, 1);
        saveData();
        renderBoard();
    }
}

// Função para alternar o estado de conclusão de um card
function toggleCardDone(listIndex, cardIndex) {
    const card = data[listIndex].cards[cardIndex];
    card.done = !card.done;
    saveData();
    renderBoard();
}

// Função para atualizar os dados com base na estrutura atual do DOM após arrastar e soltar
function updateDataFromDOM() {
    const newData = [];
    document.querySelectorAll('.list').forEach(listEl => {
        const title = listEl.querySelector('h3 span').innerText;
        const cards = [];
        listEl.querySelectorAll('.card').forEach(cardEl => {
            const text = cardEl.querySelector('.card-text').innerText;
            const done = cardEl.classList.contains('done');
            cards.push({ text, done });
        });
        newData.push({ title, cards });
    });
    data = newData;
    saveData();
}

// Inicialização do aplicativo
addListBtn.addEventListener('click', () => openModal('addList'));
renderBoard();
