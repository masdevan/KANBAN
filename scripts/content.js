
// Kanban functionality
let appData = null;

async function loadData() {
  try {
    const response = await fetch('data/data.json');
    appData = await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback data
    appData = {
      boards: [],
      counters: { cardCounter: 1, columnCounter: 1, boardCounter: 1 }
    };
  }
}

async function saveData() {
  try {
    // In a real app, you'd send this to a server
    // For now, we'll just update the local data
    console.log('Data would be saved:', appData);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

function getCurrentBoard() {
  return appData.boards.find(board => board.isActive) || appData.boards[0];
}

async function initializeContent() {
  await loadData();
  renderCurrentBoard();
  setupContentEventListeners();
}

function setupContentEventListeners() {
  // Add column button
  const addColumnBtn = document.getElementById('add-column-btn');
  if (addColumnBtn) {
    addColumnBtn.addEventListener('click', addColumn);
  }
  
  // Add board button
  const addBoardBtn = document.getElementById('add-board-btn');
  if (addBoardBtn) {
    addBoardBtn.addEventListener('click', addBoard);
  }
}

function renderCurrentBoard() {
  const currentBoard = getCurrentBoard();
  if (!currentBoard) return;

  // Update board title
  document.getElementById('current-board-title').textContent = currentBoard.name;

  // Render kanban board
  const kanbanBoard = document.getElementById('kanban-board');
  kanbanBoard.innerHTML = '';

  currentBoard.columns.forEach(column => {
    const columnElement = createColumnElement(column);
    kanbanBoard.appendChild(columnElement);
  });

  setupDragAndDrop();
}

function createColumnElement(column) {
  const columnElement = document.createElement('div');
  columnElement.className = 'column';
  columnElement.setAttribute('data-column-id', column.id);
  
  columnElement.innerHTML = `
    <div class="column-header" draggable="true">
      <h3 class="column-title">${column.name}</h3>
      <button class="btn-icon" onclick="deleteColumn('${column.id}')"><i class="fas fa-times"></i></button>
    </div>
    <div class="cards-container" data-column="${column.id}">
      ${column.cards.map(card => createCardHTML(card)).join('')}
    </div>
    <button class="add-card-btn" onclick="addCard('${column.id}')"><i class="fas fa-plus"></i> Add a card</button>
  `;

  return columnElement;
}

function createCardHTML(card) {
  return `
    <div class="card" draggable="true" data-card-id="${card.id}">
      <div class="card-content">${card.content}</div>
      <button class="card-delete" onclick="deleteCard('${card.id}')"><i class="fas fa-times"></i></button>
    </div>
  `;
}

function addCard(columnId) {
  const cardText = prompt('Enter card text:');
  if (!cardText) return;

  const currentBoard = getCurrentBoard();
  const column = currentBoard.columns.find(col => col.id === columnId);
  
  if (column) {
    const newCard = {
      id: `card-${appData.counters.cardCounter++}`,
      content: cardText
    };
    
    column.cards.push(newCard);
    saveData();
    renderCurrentBoard();
  }
}

function deleteCard(cardId) {
  if (!confirm('Delete this card?')) return;

  const currentBoard = getCurrentBoard();
  currentBoard.columns.forEach(column => {
    const cardIndex = column.cards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      column.cards.splice(cardIndex, 1);
      saveData();
      renderCurrentBoard();
    }
  });
}

function addColumn() {
  const columnName = prompt('Enter column name:');
  if (!columnName) return;

  const currentBoard = getCurrentBoard();
  const newColumn = {
    id: `column-${appData.counters.columnCounter++}`,
    name: columnName,
    cards: []
  };
  
  currentBoard.columns.push(newColumn);
  saveData();
  renderCurrentBoard();
}

function deleteColumn(columnId) {
  if (!confirm('Delete this column and all its cards?')) return;

  const currentBoard = getCurrentBoard();
  const columnIndex = currentBoard.columns.findIndex(col => col.id === columnId);
  
  if (columnIndex !== -1) {
    currentBoard.columns.splice(columnIndex, 1);
    saveData();
    renderCurrentBoard();
  }
}

function addBoard() {
  // This function is now handled by add_board.js
  // Open the add board modal
  const addBoardModal = document.getElementById('add-board-modal');
  if (addBoardModal) {
    addBoardModal.classList.add('active');
  }
}

// Function to update content data from external sources
function updateContentData(newData) {
  appData = newData;
  renderCurrentBoard();
  renderBoardsList();
}

// Make updateContentData available globally
window.updateContentData = updateContentData;

function renderBoardsList() {
  const boardsList = document.getElementById('boards-list');
  if (!boardsList) return;

  boardsList.innerHTML = '';
  
  appData.boards.forEach(board => {
    const boardItem = document.createElement('div');
    boardItem.className = `board-item ${board.isActive ? 'active' : ''}`;
    boardItem.setAttribute('data-board-id', board.id);
    
    // Use board icon if available, otherwise use default
    const icon = board.icon || 'fas fa-clipboard';
    boardItem.innerHTML = `
      <span class="board-icon"><i class="${icon}"></i></span>
      <span class="board-name">${board.name}</span>
    `;
    
    boardItem.addEventListener('click', () => switchBoard(board.id));
    boardsList.appendChild(boardItem);
  });
}

function switchBoard(boardId) {
  // Update active board
  appData.boards.forEach(board => {
    board.isActive = board.id === boardId;
  });
  
  saveData();
  renderCurrentBoard();
  renderBoardsList();
}

function moveCard(cardId, targetColumnId) {
  const currentBoard = getCurrentBoard();
  let card = null;
  
  // Find and remove card from current column
  currentBoard.columns.forEach(column => {
    const cardIndex = column.cards.findIndex(c => c.id === cardId);
    if (cardIndex !== -1) {
      card = column.cards.splice(cardIndex, 1)[0];
    }
  });
  
  // Add card to target column
  if (card) {
    const targetColumn = currentBoard.columns.find(col => col.id === targetColumnId);
    if (targetColumn) {
      targetColumn.cards.push(card);
      saveData();
    }
  }
}

// Drag and Drop functionality
function setupDragAndDrop() {
  const cards = document.querySelectorAll('.card');
  const containers = document.querySelectorAll('.cards-container');
  const columnHeaders = document.querySelectorAll('.column-header');
  const kanbanBoard = document.querySelector('.kanban-board');
  
  cards.forEach(setupCardDragEvents);
  containers.forEach(setupColumnDropEvents);
  columnHeaders.forEach(setupColumnHeaderDragEvents);
  
  if (kanbanBoard) {
    setupBoardDropEvents(kanbanBoard);
  }
}

function setupCardDragEvents(card) {
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);
}

function setupColumnDropEvents(container) {
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('drop', handleDrop);
  container.addEventListener('dragenter', handleDragEnter);
  container.addEventListener('dragleave', handleDragLeave);
}

let draggedCard = null;
let draggedColumn = null;

function handleDragStart(e) {
  if (this.classList.contains('card')) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.getAttribute('data-card-id'));
    e.dataTransfer.setData('type', 'card');
  }
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  if (this.classList.contains('card')) {
    draggedCard = null;
  }
  
  // Remove drag-over classes
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  if (!this.contains(e.relatedTarget)) {
    this.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  this.classList.remove('drag-over');
  
  if (draggedCard && this.classList.contains('cards-container')) {
    const cardId = draggedCard.getAttribute('data-card-id');
    const targetColumnId = this.getAttribute('data-column');
    
    moveCard(cardId, targetColumnId);
    renderCurrentBoard();
  }
  
  return false;
}

// Column drag and drop functions
function setupColumnHeaderDragEvents(header) {
  header.addEventListener('dragstart', handleColumnDragStart);
  header.addEventListener('dragend', handleColumnDragEnd);
}

function setupBoardDropEvents(board) {
  board.addEventListener('dragover', handleBoardDragOver);
  board.addEventListener('drop', handleBoardDrop);
}

function handleColumnDragStart(e) {
  // Don't drag if clicking on delete button
  if (e.target.classList.contains('btn-icon')) {
    e.preventDefault();
    return;
  }
  
  const column = this.closest('.column');
  if (!column) return;
  
  draggedColumn = column;
  column.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', column.getAttribute('data-column-id'));
  e.dataTransfer.setData('type', 'column');
}

function handleColumnDragEnd(e) {
  const column = this.closest('.column');
  if (column) {
    column.classList.remove('dragging');
  }
  draggedColumn = null;
  
  // Remove drag-over classes
  document.querySelectorAll('.column-drag-over').forEach(el => {
    el.classList.remove('column-drag-over');
  });
}

function handleBoardDragOver(e) {
  if (draggedColumn) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Get the element we're hovering over
    const afterElement = getDragAfterElement(this, e.clientX);
    const column = draggedColumn;
    
    if (afterElement == null) {
      this.appendChild(column);
    } else {
      this.insertBefore(column, afterElement);
    }
  }
}

function handleBoardDrop(e) {
  if (draggedColumn) {
    e.preventDefault();
    e.stopPropagation();
    
    // Update the column order in data
    updateColumnOrder();
    saveData();
  }
}

function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.column:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateColumnOrder() {
  const currentBoard = getCurrentBoard();
  const columnElements = document.querySelectorAll('.column');
  const newOrder = [];
  
  columnElements.forEach(element => {
    const columnId = element.getAttribute('data-column-id');
    const column = currentBoard.columns.find(col => col.id === columnId);
    if (column) {
      newOrder.push(column);
    }
  });
  
  currentBoard.columns = newOrder;
}
