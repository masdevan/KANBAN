
// Header functionality
function initializeHeader() {
  setupHeaderEventListeners();
  setupEditBoardModal();
}

function setupHeaderEventListeners() {
  // Sidebar toggle
  document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
  
  // Header background changer button
  const headerBackgroundBtn = document.getElementById('header-background-changer-btn');
  if (headerBackgroundBtn) {
    headerBackgroundBtn.addEventListener('click', () => {
      const modal = document.getElementById('background-modal');
      modal.classList.add('active');
    });
  }
}

function setupEditBoardModal() {
  const boardTitleEditable = document.getElementById('board-title-editable');
  const boardLogo = document.getElementById('board-logo');
  const editBoardModal = document.getElementById('edit-board-modal');
  const modalClose = document.getElementById('edit-board-modal-close');
  const cancelBtn = document.getElementById('cancel-edit-board');
  const saveBtn = document.getElementById('save-edit-board');
  const titleInput = document.getElementById('board-title-input');
  const imageInput = document.getElementById('board-image-input');
  const imagePreview = document.getElementById('board-image-preview');
  
  let currentBoardImage = localStorage.getItem('board-logo') || '';
  
  // Open modal when title is clicked
  boardTitleEditable.addEventListener('click', () => {
    titleInput.value = boardTitleEditable.textContent;
    imagePreview.innerHTML = currentBoardImage ? `<img src="${currentBoardImage}" alt="Board image">` : 'No image selected';
    editBoardModal.classList.add('active');
  });
  
  // Load existing logo on page load
  loadBoardLogo();
  
  // Close modal
  function closeModal() {
    editBoardModal.classList.remove('active');
    imageInput.value = '';
  }
  
  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  // Image preview
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        imagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Save changes
  saveBtn.addEventListener('click', () => {
    const newTitle = titleInput.value.trim();
    if (newTitle) {
      boardTitleEditable.textContent = newTitle;
      
      // Handle image if uploaded
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          currentBoardImage = e.target.result;
          // Save logo to localStorage
          localStorage.setItem('board-logo', currentBoardImage);
          // Update board logo
          updateBoardLogo(currentBoardImage);
          console.log('Board image updated');
        };
        reader.readAsDataURL(file);
      }
      
      // Save title to localStorage
      localStorage.setItem('board-title', newTitle);
      console.log('Board title updated:', newTitle);
      
      closeModal();
    }
  });
  
  // Close modal when clicking outside
  editBoardModal.addEventListener('click', (e) => {
    if (e.target === editBoardModal) {
      closeModal();
    }
  });
}

function updateBoardLogo(imageUrl) {
  const boardLogo = document.getElementById('board-logo');
  if (imageUrl) {
    boardLogo.innerHTML = `<img src="${imageUrl}" alt="Board logo">`;
    boardLogo.classList.add('has-image');
  } else {
    boardLogo.innerHTML = '';
    boardLogo.classList.remove('has-image');
  }
}

function loadBoardLogo() {
  const savedLogo = localStorage.getItem('board-logo');
  const savedTitle = localStorage.getItem('board-title');
  
  if (savedLogo) {
    updateBoardLogo(savedLogo);
    currentBoardImage = savedLogo;
  }
  
  if (savedTitle) {
    const boardTitleEditable = document.getElementById('board-title-editable');
    if (boardTitleEditable) {
      boardTitleEditable.textContent = savedTitle;
    }
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  sidebar.classList.toggle('hidden');
  mainContent.classList.toggle('sidebar-hidden');
}
