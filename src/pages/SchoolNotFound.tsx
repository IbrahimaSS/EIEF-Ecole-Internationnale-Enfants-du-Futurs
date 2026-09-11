import React from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';

interface SchoolNotFoundProps {
  reason: 'unknown' | 'offline';
}

const CONTENT = {
  unknown: {
    icon: AlertTriangle,
    title: 'École introuvable',
    message:
      "Aucun établissement n'est rattaché à cette adresse, ou son accès a été suspendu. " +
      "Vérifiez le lien fourni par votre école.",
  },
  offline: {
    icon: WifiOff,
    title: 'Service indisponible',
    message:
      "L'application ne parvient pas à joindre le serveur. Réessayez dans un instant.",
  },
} as const;

const SchoolNotFound: React.FC<SchoolNotFoundProps> = ({ reason }) => {
  const { icon: Icon, title, message } = CONTENT[reason];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rouge-500/10">
          <Icon className="h-8 w-8 text-rouge-500" />
        </div>
        <h1 className="mb-3 text-2xl font-black tracking-tight text-white">{title}</h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-400">{message}</p>
        <p className="text-xs font-mono text-gray-600">{window.location.hostname}</p>
      </div>
    </div>
  );
};

export default SchoolNotFound;
