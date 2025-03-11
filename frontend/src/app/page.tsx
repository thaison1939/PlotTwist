"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface Statement {
  statement: string;
  is_false: boolean;
  celeb_id?: number;
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
  const [blinking, setBlinking] = useState(false);
  const [correctMessage, setCorrectMessage] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  
  const correctMessages = ["Nice one!", "You’re a star!", "Spot on!"];
  const API_URL = process.env.AWS_LAMBDA;

  async function fetchQuestion() {
    try {
      const res = await fetch(`${API_URL}/api/questions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        credentials: "include"
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setCompleted(false);
      } else if (data.completed) {
        setCompleted(data);
        setCelebrity(null);
        setStatements([]);
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

  async function fetchImage(celebId: number) {
    try {
      const res = await fetch(`${API_URL}/api/image?celeb_id=${celebId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setImageUrl(data.imageUrl || null);
    } catch (err) {
      console.error("Image fetch error:", err);
      setImageUrl(null);
    }
  }

  function handleClick(statement: Statement) {
    if (!showResult && !blinking) {
      setSelected(statement);
      setBlinking(true);
      setTimeout(() => {
        setIsCorrect(statement.is_false);
        if (statement.is_false && celebrity?.id) {
          setCorrectMessage(correctMessages[Math.floor(Math.random() * correctMessages.length)]);
        } else {
          setCorrectMessage("");
        }
        setShowResult(true);
        setBlinking(false);
      }, 2000);
    }
  }

  function goBack() {
    setShowResult(false);
    setSelected(null);
    setIsCorrect(null);
    setBlinking(false);
    setCorrectMessage("");
  }

  useEffect(() => {
    if (celebrity?.id) {
      fetchImage(celebrity.id);
    }
  }, [celebrity]);

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

  return (
    <div className={styles.page}>
      {!started ? (
        <div className={styles.quizContainer}>
          <h3 className={styles.welcomeText}>You'll see <b>three truths and one lie</b> about famous celebrities.</h3>
          <h3 className={styles.questionText}><strong>Can you spot the lie?</strong></h3>
          <div className={styles.buttonRow}>
          <button
            className={styles.startButton}
            onClick={() => {
              const startButton = document.querySelector(".startButton") as HTMLButtonElement;
              if (startButton) startButton.classList.add("blink-once");
              setStarted(true);
              fetchQuestion();
            }}
          >
            I'll try
          </button>
            <p className={styles.hintText}>
              press <b>Enter</b> ↵ 
            </p>
          </div>
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
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={celebrity.name}
                  width={300} // Adjust width as needed
                  height={400} // Adjust height as needed
                  className={styles.celebrityImage}
                />
              ) : (
                <div className={styles.noImage}>No image available</div>
              )}
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
                      <p className={styles.correctText}>{correctMessage}</p>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Celebration"
                          width={400} // Adjust width as needed
                          height={300} // Adjust height as needed
                          className={styles.celebrationImage}
                        />
                      ) : (
                        <div className={styles.noImage}>No celebration image available</div>
                      )}
                    </div>
                  ) : (
                    <p className={styles.resultText}>Incorrect! The statement was true.</p>
                  )}
                  <div className={styles.buttonGroup}>
                    <button className={styles.backButton} onClick={goBack}>Go back</button>
                    <button className={styles.resultButton} onClick={fetchQuestion}>Next question</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div className={styles.quizContainer}>
          <p className={styles.loading}>Loading</p>
        </div>
      )}
    </div>
  );
}