const board = document.getElementById('board');
const addListBtn = document.getElementById('addListBtn');

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
                    <button class="edit-btn" onclick="editList(${listIndex})">✏️</button>
                    <button class="delete-btn" onclick="deleteList(${listIndex})">🗑️</button>
                </div>
            </h3>
            <div class="cards" id="list-${listIndex}">
                ${list.cards.map((card, cardIndex) => `
                    <div class="card">
                        <div class="card-text">${card}</div>
                        <div class="card-actions">
                            <button class="edit-btn" onclick="editCard(${listIndex}, ${cardIndex})">✏️</button>
                            <button class="delete-btn" onclick="deleteCard(${listIndex}, ${cardIndex})">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="add-card-btn" onclick="addCard(${listIndex})">+ Adicionar Card</button>
        `;
        board.appendChild(listEl);

        // Ativar drag & drop usando SortableJS
        new Sortable(document.getElementById(`list-${listIndex}`), {
            group: 'shared',
            animation: 150,
            onEnd: function() {
                updateDataFromDOM();
            }
        });
    });
}

//Atualizar a estrutura (data) depois do drag & drop

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

//Adicionar nova Lista
addListBtn.addEventListener('click', () => {
    const title = prompt('nome da lista:')
    if (title) {
        data.push({ title, cards: [] })
        saveData()
        renderBoard()
    }
})


//editar lista
function editList(listIndex) {
    const newTitle = prompt('novo nome da lista', data[listIndex].title)
    if (newTitle) {
        data[listIndex].title = newTitle
        saveData()
        renderBoard()

    }
}

//excluir lista
function deleteList(listIndex) {
if(confirm('Tem certeza de deseja excluir esss Lista? ')) {
    data.splice(listIndex, 1)
    saveData()
    renderBoard()
    }
}


//Editar card

window.addCard = function(listIndex) {
    const text = prompt('Nome do novo card:');
    if (text) {
        data[listIndex].cards.push(text);
        saveData();
        renderBoard();
    }
}


//Excluir card

function deleteCard(listIndex,cardIndex) {
    if (confirm('Tem certeza de que deseja excluir este card?')) {
        data[listIndex].cards.splice(cardIndex, 1)
        saveData()
        renderBoard()
    }
}

// inicializa 
renderBoard()