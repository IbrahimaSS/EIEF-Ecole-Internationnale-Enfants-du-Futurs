import { apiRequest } from "./api";

export interface GameScoreRequest {
  gameId: string;
  score: number;
  difficulty: string;
  classLevel: string;
  metadata?: string;
}

export interface GameScore {
  id: string;
  gameId: string;
  score: number;
  difficulty: string;
  classLevel: string;
  createdAt: string;
}

const LOCAL_SCORES_KEY = "eief_game_scores";

export const gameService = {
  saveScore: async (data: GameScoreRequest) => {
    // 1. Essayer de sauvegarder sur le serveur (au cas où)
    try {
      await apiRequest<GameScore>("/gamification/scores", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn("Serveur non disponible pour les scores, sauvegarde locale uniquement.");
    }

    // 2. Sauvegarde Locale (Fallback Robuste)
    const scoresRaw = localStorage.getItem(LOCAL_SCORES_KEY);
    const scores: GameScore[] = scoresRaw ? JSON.parse(scoresRaw) : [];
    
    const newScore: GameScore = {
      id: Math.random().toString(36).substr(2, 9),
      gameId: data.gameId,
      score: data.score,
      difficulty: data.difficulty,
      classLevel: data.classLevel,
      createdAt: new Date().toISOString()
    };

    scores.push(newScore);
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(scores));
    
    return newScore;
  },

  getMyScores: async () => {
    // 1. Essayer de récupérer depuis le serveur
    try {
      const serverScores = await apiRequest<GameScore[]>("/gamification/scores/my-scores");
      if (serverScores && Array.isArray(serverScores)) return serverScores;
    } catch (e) {
      // Silencieux
    }

    // 2. Fallback sur le LocalStorage
    const scoresRaw = localStorage.getItem(LOCAL_SCORES_KEY);
    return scoresRaw ? JSON.parse(scoresRaw) : [];
  },

  getGameScores: (gameId: string) =>
    apiRequest<GameScore[]>(`/gamification/scores/game/${gameId}`),
};
