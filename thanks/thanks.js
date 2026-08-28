function readAttribution() {
  try {
    return JSON.parse(localStorage.getItem('tc_attribution')) || { source: 'unknown' };
  } catch {
    return { source: 'unknown' };
  }
}

const attribution = readAttribution();
const payload = {
  event: 'tc_submission_complete',
  ...attribution,
  completedAt: new Date().toISOString()
};

window.dataLayer = window.dataLayer || [];
window.dataLayer.push(payload);
localStorage.setItem('tc_last_event', JSON.stringify(payload));

if (window.parent !== window) {
  window.parent.postMessage({ type: 'tc_submission_complete', payload }, window.location.origin);
}
