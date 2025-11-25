import { doc, setDoc, getDoc, updateDoc, arrayUnion, increment, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const progressService = {

  /** Update user's current navigation progress **/
  async updateCurrentProgress(userId, bookId, chapterId, missionId) {
    try {
      const progressRef = doc(db, "users", userId, "progress", bookId);
      await setDoc(progressRef, {
        currentChapter: chapterId,
        currentMission: missionId,
        lastAccess: new Date()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating current progress:", error);
    }
  },


  /** Save mission completion **/
  async saveMissionProgress(userId, bookId, chapterId, missionId, score, mode) {
    try {
      // Save mission progress: users/{userId}/progress/{bookId}/chapters/{chapterId}/missions/{missionId}
      const missionRef = doc(
        db,
        "users", userId,
        "progress", bookId,
        "chapters", chapterId,
        "missions", missionId
      );

      const existingMission = await getDoc(missionRef);
      const attempts = existingMission.exists() ? (existingMission.data().attempts || 0) + 1 : 1;
      const bestScore = existingMission.exists() ? Math.max(existingMission.data().score || 0, score) : score;
      
      // Calculate points based on score
      const points = Math.round(score * 10); // 100% = 1000 points, 80% = 800 points, etc.
      
      const missionData = {
        completed: true,
        score: bestScore, // Keep the best score
        currentScore: score, // Current attempt score
        attempts,
        mode,
        points,
        completedAt: new Date(),
        unlocksNext: bestScore >= 70 // Mission unlocks next if score >= 70%
      };

      await setDoc(missionRef, missionData, { merge: true });

      // Update chapter progress only if this is a qualifying completion
      const chapterRef = doc(
        db,
        "users", userId,
        "progress", bookId,
        "chapters", chapterId
      );

      await setDoc(chapterRef, {
        missionsCompleted: arrayUnion(missionId),
        lastAccess: new Date()
      }, { merge: true });

      // Update book progress
      const bookRef = doc(db, "users", userId, "progress", bookId);
      await setDoc(bookRef, {
        lastAccess: new Date()
      }, { merge: true });

      // Add points to user's total: users/{userId}/totalPoints
      await this.addPoints(userId, points);

      // Check for achievements
      await this.checkAchievements(userId, { score, mode, attempts });

    } catch (error) {
      console.error("Error saving mission progress:", error);
    }
  },


  /** Get general book progress */
  async getUserProgress(userId, bookId) {
    try {
      const progressRef = doc(db, "users", userId, "progress", bookId);
      const progressDoc = await getDoc(progressRef);
      return progressDoc.exists() ? progressDoc.data() : null;
    } catch (error) {
      console.error("Error getting user progress:", error);
      return null;
    }
  },


  /** Check if a mission is completed */
  async isMissionCompleted(userId, bookId, chapterId, missionId) {
    try {
      const missionRef = doc(
        db,
        "users", userId,
        "progress", bookId,
        "chapters", chapterId,
        "missions", missionId
      );
      const missionDoc = await getDoc(missionRef);
      return missionDoc.exists() && missionDoc.data().completed;
    } catch (error) {
      console.error("Error checking mission completion:", error);
      return false;
    }
  },

  /** Add points to user's total: users/{userId}/totalPoints */
  async addPoints(userId, points) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        totalPoints: increment(points)
      });
    } catch (error) {
      // If totalPoints field doesn't exist, create it
      try {
        await setDoc(userRef, {
          totalPoints: points
        }, { merge: true });
      } catch (createError) {
        console.error("Error adding points:", createError);
      }
    }
  },

  /** Save achievement: users/{userId}/achievements/{achievementId} */
  async saveAchievement(userId, achievementId, achievementData) {
    try {
      const achievementRef = doc(db, "users", userId, "achievements", achievementId);
      await setDoc(achievementRef, {
        ...achievementData,
        unlockedAt: new Date()
      });
    } catch (error) {
      console.error("Error saving achievement:", error);
    }
  },

  /** Check and award achievements */
  async checkAchievements(userId, missionData) {
    try {
      const { score, mode, attempts } = missionData;
      
      // Perfect Score Achievement
      if (score === 100 && attempts === 1) {
        await this.saveAchievement(userId, "perfect_first_try", {
          title: "Perfección al Primer Intento",
          description: "Completaste una misión con 100% en el primer intento",
          type: "performance",
          points: 500
        });
        await this.addPoints(userId, 500);
      }
      
      // Mode-specific achievements
      if (mode === "keywords" && score >= 90) {
        await this.saveAchievement(userId, "keyword_master", {
          title: "Maestro de Palabras Clave",
          description: "Obtuviste 90% o más en una misión de palabras clave",
          type: "skill",
          points: 200
        });
        await this.addPoints(userId, 200);
      }
      
      if (mode === "completarFrase" && score >= 90) {
        await this.saveAchievement(userId, "sentence_expert", {
          title: "Experto en Oraciones",
          description: "Obtuviste 90% o más en una misión de completar frases",
          type: "skill",
          points: 200
        });
        await this.addPoints(userId, 200);
      }
      
      if (mode === "ordenar-secuencia" && score >= 90) {
        await this.saveAchievement(userId, "sequence_master", {
          title: "Maestro del Orden",
          description: "Obtuviste 90% o más en una misión de ordenar secuencias",
          type: "skill",
          points: 200
        });
        await this.addPoints(userId, 200);
      }
      
      // Sequence-specific achievements
      if (mode === "ordenar-secuencia" && score === 100) {
        await this.saveAchievement(userId, "perfect_sequencer", {
          title: "Secuenciador Perfecto",
          description: "Ordenaste una secuencia perfectamente",
          type: "performance",
          points: 300
        });
        await this.addPoints(userId, 300);
      }
      
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  },

  /** Get user's total points */
  async getUserPoints(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? (userDoc.data().totalPoints || 0) : 0;
    } catch (error) {
      console.error("Error getting user points:", error);
      return 0;
    }
  },

  /** Get user's achievements */
  async getUserAchievements(userId) {
    try {
      const achievementsRef = collection(db, "users", userId, "achievements");
      const achievementsSnap = await getDocs(achievementsRef);
      return achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting user achievements:", error);
      return [];
    }
  },

  /** Get mission completion data with score */
  async getMissionProgress(userId, bookId, chapterId, missionId) {
    try {
      const missionRef = doc(
        db,
        "users", userId,
        "progress", bookId,
        "chapters", chapterId,
        "missions", missionId
      );
      const missionDoc = await getDoc(missionRef);
      return missionDoc.exists() ? missionDoc.data() : null;
    } catch (error) {
      console.error("Error getting mission progress:", error);
      return null;
    }
  },

  /** Check if mission unlocks the next one (score >= 70%) */
  async canUnlockNext(userId, bookId, chapterId, missionId) {
    try {
      const progress = await this.getMissionProgress(userId, bookId, chapterId, missionId);
      return progress && progress.score >= 70;
    } catch (error) {
      console.error("Error checking unlock status:", error);
      return false;
    }
  }
};
