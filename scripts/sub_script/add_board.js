
// Add Board functionality
let boardAppData = null;

// 100 different Font Awesome icons for board selection
const availableIcons = [
  'fas fa-clipboard', 'fas fa-chart-bar', 'fas fa-chart-line', 'fas fa-chart-area', 'fas fa-thumbtack', 'fas fa-map-marker-alt', 'fas fa-paperclip', 'fas fa-ruler', 'fas fa-compass', 'fas fa-file-alt',
  'fas fa-book', 'fas fa-bookmark', 'fas fa-folder', 'fas fa-folder-open', 'fas fa-file', 'fas fa-file-pdf', 'fas fa-sticky-note', 'fas fa-calendar', 'fas fa-calendar-alt', 'fas fa-tag',
  'fas fa-home', 'fas fa-building', 'fas fa-industry', 'fas fa-hospital', 'fas fa-university', 'fas fa-piggy-bank', 'fas fa-store', 'fas fa-warehouse', 'fas fa-place-of-worship', 'fas fa-mosque',
  'fas fa-bullseye', 'fas fa-star', 'fas fa-palette', 'fas fa-theater-masks', 'fas fa-gamepad', 'fas fa-dice', 'fas fa-chess', 'fas fa-puzzle-piece', 'fas fa-trophy', 'fas fa-music',
  'fas fa-briefcase', 'fas fa-laptop', 'fas fa-server', 'fas fa-database', 'fas fa-cloud', 'fas fa-wifi', 'fas fa-mobile-alt', 'fas fa-phone', 'fas fa-envelope', 'fas fa-at',
  'fas fa-bolt', 'fas fa-cog', 'fas fa-balance-scale', 'fas fa-flask', 'fas fa-fire', 'fas fa-leaf', 'fas fa-futbol', 'fas fa-basketball-ball', 'fas fa-football-ball', 'fas fa-baseball-ball',
  'fas fa-search', 'fas fa-search-plus', 'fas fa-lock', 'fas fa-unlock', 'fas fa-key', 'fas fa-shield-alt', 'fas fa-eye', 'fas fa-bell', 'fas fa-bell-slash', 'fas fa-tags',
  'fas fa-flag', 'fas fa-heart', 'fas fa-gem', 'fas fa-crown', 'fas fa-sun', 'fas fa-moon', 'fas fa-cloud-rain', 'fas fa-seedling', 'fas fa-apple-alt', 'fas fa-tree',
  'fas fa-rocket', 'fas fa-plane', 'fas fa-car', 'fas fa-bicycle', 'fas fa-train', 'fas fa-ship', 'fas fa-anchor', 'fas fa-medal', 'fas fa-award', 'fas fa-certificate',
  'fas fa-lightbulb', 'fas fa-thumbs-up', 'fas fa-thumbs-down', 'fas fa-smile', 'fas fa-frown', 'fas fa-meh', 'fas fa-laugh', 'fas fa-grin', 'fas fa-wink', 'fas fa-glass-martini'
];

async function loadAppData() {
  try {
    const response = await fetch('data/data.json');
    boardAppData = await response.json();
  } catch (error) {
    console.error('Error loading app data:', error);
    // Fallback data
    boardAppData = {
      boards: [],
      counters: { cardCounter: 1, columnCounter: 1, boardCounter: 1 }
    };
  }
}

async function saveAppData() {
  try {
    // In a real app, you'd send this to a server
    console.log('App data would be saved:', boardAppData);
  } catch (error) {
    console.error('Error saving app data:', error);
  }
}

function initializeAddBoard() {
  setupAddBoardModal();
}

function setupAddBoardModal() {
  const addBoardBtn = document.getElementById('add-board-btn');
  const addBoardModal = document.getElementById('add-board-modal');
  const modalClose = document.getElementById('add-board-modal-close');
  const cancelBtn = document.getElementById('cancel-add-board');
  const saveBtn = document.getElementById('save-add-board');
  const titleInput = document.getElementById('new-board-title');
  const iconGrid = document.getElementById('icon-grid');
  
  let selectedIcon = availableIcons[0]; // Default to first icon
  
  // Generate icon grid
  function generateIconGrid() {
    if (!iconGrid) return;
    
    iconGrid.innerHTML = '';
    availableIcons.forEach((icon, index) => {
      const iconOption = document.createElement('div');
      iconOption.className = 'icon-option';
      iconOption.innerHTML = `<i class="${icon}"></i>`;
      iconOption.dataset.icon = icon;
      
      if (index === 0) {
        iconOption.classList.add('selected');
      }
      
      iconOption.addEventListener('click', () => {
        // Remove previous selection
        iconGrid.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
        // Add selection to clicked icon
        iconOption.classList.add('selected');
        selectedIcon = icon;
      });
      
      iconGrid.appendChild(iconOption);
    });
  }
  
  // Close modal function
  function closeModal() {
    if (addBoardModal) {
      addBoardModal.classList.remove('active');
    }
  }
  
  // Open modal
  if (addBoardBtn) {
    addBoardBtn.addEventListener('click', async () => {
      await loadAppData(); // Load fresh data
      if (titleInput) titleInput.value = '';
      selectedIcon = availableIcons[0];
      generateIconGrid();
      if (addBoardModal) addBoardModal.classList.add('active');
    });
  }
  
  // Close modal events
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
  
  // Save new board
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const title = titleInput ? titleInput.value.trim() : '';
      if (title) {
        await addBoardWithIcon(title, selectedIcon);
        closeModal();
      }
    });
  }
  
  // Close modal on overlay click
  if (addBoardModal) {
    addBoardModal.addEventListener('click', (e) => {
      if (e.target === addBoardModal) {
        closeModal();
      }
    });
  }
  
  // Initialize icon grid on page load
  generateIconGrid();
}

async function addBoardWithIcon(boardName, icon) {
  if (!boardName) return;
  
  // Ensure we have the latest data
  await loadAppData();

  const newBoard = {
    id: `board-${boardAppData.counters.boardCounter++}`,
    name: boardName,
    icon: icon,
    isActive: false,
    columns: [
      {
        id: `column-${boardAppData.counters.columnCounter++}`,
        name: "To Do",
        cards: []
      }
    ]
  };

  boardAppData.boards.push(newBoard);
  await saveAppData();
  
  // Update sidebar immediately
  await updateSidebarBoardsList();
  
  // Update content.js data if available
  if (typeof window.updateContentData === 'function') {
    window.updateContentData(boardAppData);
  }
  
  console.log('Board added successfully:', boardName, 'with icon:', icon);
}

async function updateSidebarBoardsList() {
  const boardsList = document.getElementById('boards-list');
  if (!boardsList) return;

  boardsList.innerHTML = '';
  
  boardAppData.boards.forEach(board => {
    const boardItem = document.createElement('div');
    boardItem.className = `board-item ${board.isActive ? 'active' : ''}`;
    boardItem.setAttribute('data-board-id', board.id);
    
    // Use board icon if available, otherwise use default
    const icon = board.icon || 'fas fa-clipboard';
    boardItem.innerHTML = `
      <span class="board-icon"><i class="${icon}"></i></span>
      <span class="board-name">${board.name}</span>
    `;
    
    boardItem.addEventListener('click', () => {
      // Switch to this board
      if (typeof switchBoard === 'function') {
        switchBoard(board.id);
      }
    });
    
    boardsList.appendChild(boardItem);
  });
}

// Make functions available globally
window.addBoardWithIcon = addBoardWithIcon;
window.initializeAddBoard = initializeAddBoard;
window.updateSidebarBoardsList = updateSidebarBoardsList;
