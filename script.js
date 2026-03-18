// Cached DOM elements
const ui = {
  dot:          document.getElementById('statusDot'),
  text:         document.getElementById('statusText'),
  badge:        document.getElementById('statusBadge'),
  responseText: document.getElementById('responseText'),
};

function getCredentials() {
  const id    = document.getElementById('idInstance').value.trim();
  const token = document.getElementById('apiToken').value.trim();
  if (!id || !token) {
    showError('Заполните поля idInstance и ApiTokenInstance.');
    return null;
  }
  return { id, token };
}

function buildUrl(method, id, token) {
  return `https://api.green-api.com/waInstance${id}/${method}/${token}`;
}

function setLoading(label) {
  ui.dot.className      = 'response-header-dot';
  ui.badge.className    = 'status-badge loading';
  ui.badge.textContent  = 'Loading...';
  ui.text.textContent   = `Выполняется: ${label}`;
  ui.responseText.value = '';
}

function showResult(data, label) {
  ui.dot.className      = 'response-header-dot active';
  ui.badge.className    = 'status-badge ok';
  ui.badge.textContent  = '200 OK';
  ui.text.textContent   = label;
  ui.responseText.value = JSON.stringify(data, null, 2);
}

function showError(message, statusCode) {
  ui.dot.className      = 'response-header-dot error';
  ui.badge.className    = 'status-badge error';
  ui.badge.textContent  = statusCode ? `${statusCode} Error` : 'Error';
  ui.text.textContent   = 'Ошибка запроса';
  ui.responseText.value = message;
}

function clearResponse() {
  ui.dot.className      = 'response-header-dot';
  ui.badge.className    = 'status-badge';
  ui.text.textContent   = 'Ожидание запроса...';
  ui.responseText.value = '';
}

async function handleResponse(res, label) {
  const data = await res.json();
  if (!res.ok) {
    showError(JSON.stringify(data, null, 2), res.status);
  } else {
    showResult(data, label);
  }
}


async function apiGet(method) {
  const creds = getCredentials();
  if (!creds) return;
  setLoading(method);
  try {
    const res = await fetch(buildUrl(method, creds.id, creds.token));
    await handleResponse(res, method);
  } catch (err) {
    showError(`Не удалось выполнить запрос:\n${err.message}`);
  }
}

async function apiPost(method, body) {
  const creds = getCredentials();
  if (!creds) return;
  setLoading(method);
  try {
    const res = await fetch(buildUrl(method, creds.id, creds.token), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await handleResponse(res, method);
  } catch (err) {
    showError(`Не удалось выполнить запрос:\n${err.message}`);
  }
}


function callGetSettings()      { apiGet('getSettings'); }
function callGetStateInstance() { apiGet('getStateInstance'); }

function callSendMessage() {
  const phone = document.getElementById('sendMsgPhone').value.trim();
  const text  = document.getElementById('sendMsgText').value.trim();
  if (!phone) { showError('Введите номер телефона для sendMessage.'); return; }
  if (!text)  { showError('Введите текст сообщения для sendMessage.'); return; }
  apiPost('sendMessage', { chatId: `${phone}@c.us`, message: text });
}

function callSendFileByUrl() {
  const phone = document.getElementById('sendFilePhone').value.trim();
  const url   = document.getElementById('sendFileUrl').value.trim();
  if (!phone) { showError('Введите номер телефона для sendFileByUrl.'); return; }
  if (!url)   { showError('Введите URL файла для sendFileByUrl.'); return; }
  apiPost('sendFileByUrl', { chatId: `${phone}@c.us`, urlFile: url, fileName: 'file' });
}
