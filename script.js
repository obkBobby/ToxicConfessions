const ageCheck = document.querySelector('#age-check');
const rightsCheck = document.querySelector('#rights-check');
const openButton = document.querySelector('#open-recorder');
const primaryCta = document.querySelector('.primary-cta');

const params = new URLSearchParams(window.location.search);
const knownSources = ['instagram', 'tiktok', 'facebook', 'youtube', 'email', 'podcast', 'friend', 'obkstart'];

function getSource() {
  const tagged = (params.get('utm_source') || params.get('source') || '').toLowerCase();
  if (tagged) return tagged;

  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    return knownSources.find(source => host.includes(source)) || (host ? 'referral' : 'direct');
  } catch {
    return 'direct';
  }
}

const attribution = {
  source: getSource(),
  medium: params.get('utm_medium') || 'unknown',
  campaign: params.get('utm_campaign') || 'toxic_confessions',
  content: params.get('utm_content') || 'unspecified',
  landingUrl: window.location.href,
  firstSeenAt: new Date().toISOString()
};

function track(event, details = {}) {
  const payload = { event, ...attribution, ...details, timestamp: new Date().toISOString() };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  localStorage.setItem('tc_attribution', JSON.stringify(attribution));
  localStorage.setItem('tc_last_event', JSON.stringify(payload));
  try {
    const history = JSON.parse(localStorage.getItem('tc_event_history')) || [];
    history.push(payload);
    localStorage.setItem('tc_event_history', JSON.stringify(history.slice(-50)));
  } catch {
    localStorage.setItem('tc_event_history', JSON.stringify([payload]));
  }
}

function updateGate() {
  if (!openButton || !ageCheck || !rightsCheck) return;
  openButton.disabled = !(ageCheck.checked && rightsCheck.checked);
  if (!openButton.disabled && openButton.dataset.readyTracked !== 'true') {
    openButton.dataset.readyTracked = 'true';
    track('tc_consent_ready');
  }
}

function openRecorder() {
  if (openButton.disabled || !openButton.dataset.destination) return;
  track('tc_recorder_open');
  window.location.assign(openButton.dataset.destination);
}

ageCheck?.addEventListener('change', updateGate);
rightsCheck?.addEventListener('change', updateGate);
openButton?.addEventListener('click', openRecorder);
primaryCta?.addEventListener('click', () => track('tc_primary_cta_click'));

track('tc_landing_view');
window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.data?.type !== 'tc_submission_complete') return;
  track('tc_submission_complete', event.data.payload || {});
});

document.querySelector('#year').textContent = new Date().getFullYear();
