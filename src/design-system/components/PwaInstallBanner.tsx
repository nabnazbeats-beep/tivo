import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { TivoButton } from './TivoButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà en mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Ne pas afficher si l'utilisateur l'a fermé récemment
      const dismissedTime = localStorage.getItem('tivo_pwa_dismissed');
      if (!dismissedTime || Date.now() - Number(dismissedTime) > 86400000) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsVisible(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert("Pour installer Tivo sur votre écran d'accueil : appuyez sur le menu de votre navigateur (les 3 points ou Partager) puis 'Ajouter à l'écran d'accueil'.");
      return;
    }
    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsVisible(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('tivo_pwa_dismissed', Date.now().toString());
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="mx-4 my-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-cyan-500/10 border border-blue-500/30 flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 flex items-center justify-center">
          <img
            src="/logo-tivo.png"
            alt="Logo Tivo"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Installer l'application Tivo</span>
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded-full uppercase font-extrabold tracking-wider">
              PWA
            </span>
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Accès instantané et fonctionnement hors-ligne
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <TivoButton
          size="sm"
          variant="primary"
          onClick={handleInstallClick}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Installer
        </TivoButton>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
