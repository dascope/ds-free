const portalId = '2868499';
const formId = '84801971-906e-44ef-b711-7ed8f5b814ee';
const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

function showMessage(msg) {
  document.getElementById('result').textContent = msg;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return undefined;
}

if (window.location.protocol === 'file:') {
  showMessage('Run this page from a local web server to avoid CORS issues.');
}

document.getElementById('submit').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const resultEl = document.getElementById('result');
  const hutk = getCookie('hubspotutk');

  const payload = {
    submittedAt: Date.now(),
    fields: [{ name: 'email', value: email }],
    context: {
      pageUri: window.location.href,
      pageName: document.title,
      hutk,
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: 'I agree to allow Digital Samba to store and process my personal data.',
        communications: [
          {
            value: true,
            subscriptionTypeId: 999,
            text: 'I agree to receive marketing communications from Digital Samba.',
          },
        ],
      },
      legitimateInterest: {
        value: true,
        text: 'The contact has a legitimate interest in Digital Samba products.',
      },
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
    console.log('HubSpot response:', res.status, text);
  } catch (err) {
    resultEl.textContent = `Request failed: ${err.message}`;
    console.error('HubSpot request failed:', err);
  }
});
