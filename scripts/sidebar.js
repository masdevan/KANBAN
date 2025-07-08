
// Sidebar functionality
async function initializeSidebar() {
  await renderBoardsListFromData();
  setupBackgroundChanger();
  // Add board functionality is now handled by add_board.js
  if (typeof initializeAddBoard === 'function') {
    initializeAddBoard();
  }
}

function setupSidebarEventListeners() {
  // This function is no longer needed as header events are handled in header.js
}

function setupBackgroundChanger() {
  const modal = document.getElementById('background-modal');
  const modalClose = document.getElementById('modal-close');
  const backgroundOptions = document.querySelectorAll('.background-option');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadInput = document.getElementById('background-upload');
  const colorPicker = document.getElementById('color-picker');
  const applyColorBtn = document.getElementById('apply-color-btn');

  // Close modal
  modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close modal on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Background option selection
  backgroundOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove previous selection
      backgroundOptions.forEach(opt => opt.classList.remove('selected'));
      // Add selection to clicked option
      option.classList.add('selected');
      
      // Apply background
      const bgType = option.getAttribute('data-bg');
      applyBackground(bgType, option.style.background);
    });
  });

  // Upload button
  uploadBtn.addEventListener('click', () => {
    uploadInput.click();
  });

  // Handle file upload
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        applyBackground('custom-image', `url(${imageUrl})`);
        modal.classList.remove('active');
      };
      reader.readAsDataURL(file);
    }
  });

  // Apply custom color
  applyColorBtn.addEventListener('click', () => {
    const color = colorPicker.value;
    applyBackground('custom-color', color);
    modal.classList.remove('active');
  });

  // Load saved background
  loadSavedBackground();
}

function applyBackground(type, value) {
  const kanbanBoard = document.querySelector('.kanban-board');
  if (!kanbanBoard) return;

  // Reset previous backgrounds
  kanbanBoard.style.background = '';
  kanbanBoard.style.backgroundImage = '';
  kanbanBoard.style.backgroundSize = '';
  kanbanBoard.style.backgroundPosition = '';
  kanbanBoard.style.backgroundRepeat = '';

  // Apply new background
  if (type.startsWith('gradient')) {
    kanbanBoard.style.background = value;
  } else if (type === 'custom-image') {
    kanbanBoard.style.backgroundImage = value;
    kanbanBoard.style.backgroundSize = 'cover';
    kanbanBoard.style.backgroundPosition = 'center';
    kanbanBoard.style.backgroundRepeat = 'no-repeat';
  } else if (type === 'custom-color') {
    kanbanBoard.style.backgroundColor = value;
  }

  // Save to localStorage
  localStorage.setItem('kanban-background', JSON.stringify({ type, value }));
}

function loadSavedBackground() {
  const saved = localStorage.getItem('kanban-background');
  if (saved) {
    try {
      const { type, value } = JSON.parse(saved);
      applyBackground(type, value);
    } catch (error) {
      console.error('Error loading saved background:', error);
    }
  }
}

async function renderBoardsListFromData() {
  try {
    const response = await fetch('data/data.json');
    const data = await response.json();
    
    const boardsList = document.getElementById('boards-list');
    if (!boardsList) return;

    boardsList.innerHTML = '';
    
    data.boards.forEach(board => {
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
        // This will be handled by content.js switchBoard function
        if (typeof switchBoard === 'function') {
          switchBoard(board.id);
        }
      });
      boardsList.appendChild(boardItem);
    });
  } catch (error) {
    console.error('Error rendering boards list:', error);
  }
}
