"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface Statement {
  statement: string;
  is_false: boolean;
}

export default function Home() {
  const [celebrity, setCelebrity] = useState<any>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [selected, setSelected] = useState<Statement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState<any>(false);

  useEffect(() => {
    fetchQuestion();
  }, []);

  async function fetchQuestion() {
    try {
      const res = await fetch("https://plottwist-backend-4gr0.onrender.com/api/questions", {
        method: "GET",
        headers: {
          Authorization: `Token ${process.env.NEXT_PUBLIC_API_KEY}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCelebrity(data.celebrity);
        setStatements(data.statements);
        setSelected(null);
        setShowResult(false);
        setIsCorrect(null);
      }
    } catch (err) {
      setError("Failed to fetch data: " + (err as Error).message);
      console.error("Fetch error:", err);
    }
  }

  function handleSelect(statement: Statement) {
    setSelected(statement);
  }

  function checkAnswer() {
    if (selected) {
      setIsCorrect(selected.is_false); 
      setShowResult(true);
    }
  }

  return (
    <div className={styles.page}>
      {error ? (
        <div className={styles.quizContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      ) : completed ? (
          <div className={styles.quizContainer}>
            <h2 className={styles.celebrityTitle}>Quiz Completed!</h2>
            <p className={styles.resultText}>{completed.message}</p>
          </div>
      ) : celebrity ? (
        <div className={styles.quizContainer}>
          <h2 className={styles.celebrityTitle}>{celebrity.name}</h2>
          <img
            className={styles.celebrityImage}
            src={celebrity.img_url !== "null" ? celebrity.img_url : null}
            alt={celebrity.name}
          />
          <ul className={styles.statementList}>
            {statements.map((s, index) => (
              <li key={index} className={styles.statementItem}>
                <button
                  className={`${styles.statementButton} ${
                    selected === s ? styles.selected : ""
                  }`}
                  onClick={() => handleSelect(s)}
                  disabled={showResult}
                >
                  {s.statement}
                </button>
              </li>
            ))}
          </ul>
          <button
            className={styles.submitButton}
            onClick={checkAnswer}
            disabled={!selected || showResult}
          >
            Submit
          </button>
          {showResult && (
            <div className={styles.resultBox}>
              {isCorrect !== null && (
                <p className={styles.resultText}>
                  {isCorrect
                    ? "Correct! The statement was false."
                    : "Incorrect! The statement was true."}
                </p>
              )}
              <button className={styles.resultButton} onClick={fetchQuestion}>
                Next Question
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.quizContainer}>
          <p className={styles.loading}>Loading...</p>
        </div>
      )}
    </div>
  );
}

