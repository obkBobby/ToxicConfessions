const ageCheck = document.querySelector('#age-check');
const rightsCheck = document.querySelector('#rights-check');
const openButton = document.querySelector('#open-recorder');
const consentGate = document.querySelector('#consent-gate');
const frameWrap = document.querySelector('#podline-frame');
const recorderFrame = frameWrap?.querySelector('iframe');

function updateGate() {
  if (!openButton || !ageCheck || !rightsCheck) return;
  openButton.disabled = !(ageCheck.checked && rightsCheck.checked);
}

function openRecorder() {
  if (openButton.disabled || !recorderFrame || !frameWrap || !consentGate) return;
  recorderFrame.src = recorderFrame.dataset.src;
  consentGate.hidden = true;
  frameWrap.hidden = false;
  frameWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  recorderFrame.focus({ preventScroll: true });
}

ageCheck?.addEventListener('change', updateGate);
rightsCheck?.addEventListener('change', updateGate);
openButton?.addEventListener('click', openRecorder);

document.querySelector('#year').textContent = new Date().getFullYear();
