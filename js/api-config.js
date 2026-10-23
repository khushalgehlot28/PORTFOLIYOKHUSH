const configuredApiBaseUrl = window.API_BASE_URL
  || document.querySelector('meta[name="api-base-url"]')?.content
  || '';

window.API_BASE_URL = configuredApiBaseUrl.trim().replace(/\/+$/, '');
window.apiUrl = (path) => `${window.API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;