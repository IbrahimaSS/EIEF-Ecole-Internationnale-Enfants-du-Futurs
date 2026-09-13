import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Input } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

const MIN_PASSWORD_LENGTH = 8;

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user, changePassword, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validationError = (): string | null => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    }
    if (newPassword !== confirmation) {
      return 'La confirmation ne correspond pas au nouveau mot de passe.';
    }
    if (newPassword === currentPassword) {
      return "Le nouveau mot de passe doit être différent de l'actuel.";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validationError();
    setError(invalid);
    if (invalid || !user) return;

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Mot de passe modifié.');
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le changement de mot de passe a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bleu-500/10">
              <KeyRound className="h-6 w-6 text-bleu-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">Choisissez votre mot de passe</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user ? `${user.firstName} ${user.lastName}, votre` : 'Votre'} mot de passe actuel est temporaire.
              </p>
            </div>
          </div>

          <Input
            label="Mot de passe temporaire"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            helper={`Au moins ${MIN_PASSWORD_LENGTH} caractères.`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Confirmation"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
          />

          {error && <p className="text-sm font-medium text-rouge-600">{error}</p>}

          <Button type="submit" className="w-full" loading={submitting}>
            Enregistrer et continuer
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={handleLogout}>
            <LogOut size={16} /> Se déconnecter
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
