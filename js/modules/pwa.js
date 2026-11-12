// ========================================================
// DBO Basketball Academy - PWA Installation Controller
// (Android Web App Install Banner & iOS Add-to-Home Modal)
// ========================================================

let deferredPWAInstallPrompt = null;
const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function isRunningStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
         (window.navigator.standalone === true) ||
         document.referrer.includes('android-app://');
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPWAInstallPrompt = e;
  updateInstallButtonVisibility();
});

window.addEventListener('appinstalled', () => {
  deferredPWAInstallPrompt = null;
  updateInstallButtonVisibility();
  showToast('🎉 ติดตั้งแอป DBO Academy เรียบร้อยแล้ว!');
});

function updateInstallButtonVisibility() {
  const btn = document.getElementById('btnInstallAppHeader');
  if (!btn) return;
  if (isRunningStandalone()) {
    btn.classList.add('hidden');
  } else {
    btn.classList.remove('hidden');
  }
}

function handlePWAInstallClick() {
  if (deferredPWAInstallPrompt) {
    deferredPWAInstallPrompt.prompt();
    deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('กำลังติดตั้งแอป DBO Academy ลงในเครื่องของคุณ...');
      }
      deferredPWAInstallPrompt = null;
      updateInstallButtonVisibility();
    });
  } else {
    openIOSInstallModal();
  }
}

function openIOSInstallModal() {
  const modal = document.getElementById('iosInstallModal');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeIOSInstallModal() {
  const modal = document.getElementById('iosInstallModal');
  if (modal) modal.classList.add('hidden');
}
