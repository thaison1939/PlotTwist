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
  const [started, setStarted] = useState(false);
  const [blinking, setBlinking] = useState(false); // For statement blinking
  const [startButtonBlink, setStartButtonBlink] = useState(false); // For start button blink
  const [correctMessage, setCorrectMessage] = useState<string>(""); // Random encouragement

  // Three random messages for correct answers
  const correctMessages = [
    "Nice one!",
    "You’re a star!",
    "Spot on!",
  ];

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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setCompleted(false);
      } else if (data.completed) {
        setCompleted(data);
        setCelebrity(null);
        setError(null);
      } else {
        setCelebrity(data.celebrity);
        setStatements(data.statements);
        setSelected(null);
        setShowResult(false);
        setIsCorrect(null);
        setError(null);
        setCompleted(false);
        setBlinking(false);
        setCorrectMessage("");
      }
    } catch (err) {
      setError("Failed to fetch data: " + (err as Error).message);
      console.error("Fetch error:", err);
    }
  }

  // Handle Enter key for Start with CSS animation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !started) {
        setStarted(true);
        fetchQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [started]);

  function handleClick(statement: Statement) {
    if (!showResult && !blinking) {
      setSelected(statement);
      setBlinking(true);
      setTimeout(() => {
        setIsCorrect(statement.is_false);
        if (statement.is_false) {
          setCorrectMessage(correctMessages[Math.floor(Math.random() * correctMessages.length)]);
        } else {
          setCorrectMessage("");
        }
        setShowResult(true);
        setBlinking(false);
      }, 2000); // 2s blink
    }
  }

  function goBack() {
    setShowResult(false);
    setSelected(null);
    setIsCorrect(null);
    setBlinking(false);
    setCorrectMessage("");
  }

  return (
    <div className={styles.page}>
      {!started ? (
        <div className={styles.quizContainer}>
          <h2 className={styles.welcomeText}>Welcome to PlotTwist!</h2>
          <button
            className={styles.startButton}
            onClick={() => {
              const startButton = document.querySelector(".startButton") as HTMLButtonElement;
              if (startButton) startButton.classList.add("blink-once");
              setStarted(true);
              fetchQuestion();
            }}
          >
            Start Quiz
          </button>
          <p className={styles.hintText}>Press Enter to begin!</p>
        </div>
      ) : error ? (
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
          {!showResult ? (
            <>
              <h2 className={styles.celebrityTitle}>{celebrity.name}</h2>
              <img
                className={styles.celebrityImage}
                src={celebrity.img_url && celebrity.img_url !== "null" ? celebrity.img_url : "/placeholder-image.jpg"}
                alt={celebrity.name}
                onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
              />
              <ul className={styles.statementList}>
                {statements.map((s, index) => (
                  <li key={index} className={styles.statementItem}>
                    <button
                      className={`${styles.statementButton} ${selected === s ? styles.selected : ""} ${blinking && selected === s ? styles.blinking : ""}`}
                      onClick={() => handleClick(s)}
                      disabled={showResult || blinking}
                    >
                      {s.statement}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              {isCorrect !== null && (
                <>
                  {isCorrect ? (
                    <div className={styles.correctResult}>
                      <p className={styles.correctText}>
                        {correctMessage}
                      </p>
                      <img
                        src="/celebration-image.jpg"
                        alt="Celebration"
                        className={styles.celebrationImage}
                      />
                    </div>
                  ) : (
                    <p className={styles.resultText}>
                      Incorrect! The statement was true.
                    </p>
                  )}
                  <div className={styles.buttonGroup}>
                    <button className={styles.backButton} onClick={goBack}>
                      Go back
                    </button>
                    <button className={styles.resultButton} onClick={fetchQuestion}>
                      Next question
                    </button>
                  </div>
                </>
              )}
            </>
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