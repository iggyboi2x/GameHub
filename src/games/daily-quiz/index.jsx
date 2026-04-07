import { useState } from 'react';
import styles from './DailyQuiz.module.css';

const QUESTIONS = [
  {
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Jupiter', 'Mars', 'Saturn'],
    answer: 1,
  },
  {
    question: 'Which language is used for styling web pages?',
    options: ['HTML', 'CSS', 'JavaScript', 'Python'],
    answer: 1,
  },
  {
    question: 'What is 7 × 8?',
    options: ['54', '56', '58', '60'],
    answer: 1,
  },
  {
    question: 'How many continents are there on Earth?',
    options: ['5', '6', '7', '8'],
    answer: 2,
  },
  {
    question: 'Which animal is known as the king of the jungle?',
    options: ['Tiger', 'Lion', 'Elephant', 'Giraffe'],
    answer: 1,
  },
  {
    question: 'Which gas do plants use for photosynthesis?',
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
    answer: 1,
  },
  {
    question: 'What color do you get by mixing red and blue?',
    options: ['Purple', 'Orange', 'Green', 'Brown'],
    answer: 0,
  },
  {
    question: 'Which continent is also a country?',
    options: ['Australia', 'Europe', 'Asia', 'Antarctica'],
    answer: 0,
  },
  {
    question: 'What is the freezing point of water in Celsius?',
    options: ['0°C', '32°C', '100°C', '-10°C'],
    answer: 0,
  },
  {
    question: 'Who painted the Mona Lisa?',
    options: ['Picasso', 'Van Gogh', 'Da Vinci', 'Rembrandt'],
    answer: 2,
  },
];

export default function DailyQuizGame() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState('Answer each question to build your score.');

  const question = QUESTIONS[current];

  const handleOptionClick = (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
  };

  const handleSubmit = () => {
    if (selected === null) {
      setFeedback('Select an answer before continuing.');
      return;
    }

    if (selected === question.answer) {
      setScore((prev) => prev + 1);
      setFeedback('Correct!');
    } else {
      setFeedback(`Incorrect. The right answer is ${question.options[question.answer]}.`);
    }

    if (current + 1 >= QUESTIONS.length) {
      setCompleted(true);
      return;
    }

    setTimeout(() => {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setFeedback('Keep going — next question is ready.');
    }, 800);
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setCompleted(false);
    setFeedback('Answer each question to build your score.');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Daily Quiz</h2>
          <p className={styles.subtitle}>10 questions, one shot per game.</p>
        </div>
        <div className={styles.statusCard}>
          <span>{completed ? 'Completed' : `Question ${current + 1} / ${QUESTIONS.length}`}</span>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.message}>{feedback}</div>

        {completed ? (
          <div className={styles.resultCard}>
            <h3>Quiz complete!</h3>
            <p>Your score: {score} / {QUESTIONS.length}</p>
            <button type="button" className={styles.button} onClick={restart}>
              Play Again
            </button>
          </div>
        ) : (
          <>
            <div className={styles.questionCard}>
              <h3>{question.question}</h3>
              <div className={styles.options}>
                {question.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.option} ${selected === index ? styles.selected : ''}`}
                    onClick={() => handleOptionClick(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controls}>
              <button type="button" className={styles.button} onClick={handleSubmit}>
                {current + 1 === QUESTIONS.length ? 'Finish Quiz' : 'Next Question'}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={restart}>
                Restart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
