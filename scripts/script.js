// Initialize the application
async function initApp() {
  try {
    // Load HTML components
    await loadComponent('header-container', 'header.html');
    await loadComponent('sidebar-container', 'sidebar.html');
    await loadComponent('content-container', 'content.html');
    await loadComponent('footer-container', 'footer.html');

    // Wait a bit for DOM to be ready
    setTimeout(() => {
      // Initialize header functionality
      initializeHeader();

      // Initialize sidebar functionality
      initializeSidebar();

      // Initialize content functionality  
      initializeContent();
    }, 100);

  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

async function loadComponent(containerId, file) {
  try {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);