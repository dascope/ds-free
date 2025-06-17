const portalId = '2868499';
const formId = '84801971-906e-44ef-b711-7ed8f5b814ee';
const region = 'eu1';

function getHubSpotEndpoint() {
  const host = region.toLowerCase() === 'eu1'
    ? 'api.hsforms.com'
    : 'api.hsforms.com';
  return `https://${host}/submissions/v3/integration/submit/${portalId}/${formId}`;
}

function showMessage(msg) {
  document.getElementById('result').textContent = msg;
}

if (window.location.protocol === 'file:') {
  showMessage('Run this page from a local web server to avoid CORS issues.');
}

document.getElementById('submit').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const resultEl = document.getElementById('result');
  const endpoint = getHubSpotEndpoint();

  const payload = {
    submittedAt: Date.now(),
    fields: [{ name: 'email', value: email }],
    context: {
      pageUri: window.location.href,
      pageName: document.title,
    },
  };

  resultEl.textContent = 'Submitting...';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    resultEl.textContent = `${res.status} ${res.statusText}\n${text}`;
  } catch (err) {
    resultEl.textContent = `Request failed: ${err.message}`;
  }
});
