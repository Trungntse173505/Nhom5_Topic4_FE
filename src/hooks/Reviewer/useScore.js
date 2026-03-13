import { useState, useEffect } from "react";
// TỪ hooks/useScore.js LÙI 1 BƯỚC LÀ VÀO ĐƯỢC api/scoreApi.js
import scoreApi from "../../api/scoreApi";

export const useScore = () => {
  const [scoresList, setScoresList] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  useEffect(() => {
    const fetchScore = async () => {
      setIsLoadingScore(true);
      try {
        const response = await scoreApi.getAllScores();
        const data = response.data || response;

        setScoresList(data);

        // Lấy điểm của Reviewer
        const reviewerData = data.find((user) => user.role === "Reviewer");
        if (reviewerData) {
          setMyScore(reviewerData.currentScore);
        }
      } catch (error) {
        console.error("Lỗi khi lấy điểm tín nhiệm:", error);
      } finally {
        setIsLoadingScore(false);
      }
    };

    fetchScore();
  }, []);

  return { scoresList, myScore, isLoadingScore };
};
