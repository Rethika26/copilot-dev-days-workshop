// UI code: connects the quiz logic (quiz.js) to the page (index.html).

const QUESTION_TIME_SECONDS = 15;
const BEST_SCORE_STORAGE_KEY = "devDaysQuizBestScore";
let quizState = createQuiz([]);
let bestScore = readBestScore();
const uiState = {
  remainingSeconds: QUESTION_TIME_SECONDS,
  timerDeadline: 0,
  timerId: null,
  questionResolved: false,
};



const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const progressText = document.getElementById("progress");
const timerText = document.getElementById("timer");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options");
const feedbackText = document.getElementById("feedback");
const nextButton = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const gradeText = document.getElementById("grade-text");
const feedbackMessageText = document.getElementById("feedback-message");
const bestScoreStartText = document.getElementById("best-score-start");
const bestScoreResultText = document.getElementById("best-score-result");

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function readBestScore() {
  try {
    const storedScore = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (storedScore === null || storedScore.trim() === "") return null;

    const parsedScore = Number(storedScore);
    if (!Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 100) return null;
    return parsedScore;
  } catch (error) {
    console.warn("Unable to read the best score from localStorage.", error);
    return null;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
  } catch (error) {
    console.warn("Unable to save the best score to localStorage.", error);
  }
}

function renderStartBestScore() {
  bestScoreStartText.textContent = bestScore === null
    ? "Best score: Not set yet"
    : `Best score: ${bestScore}%`;
}

function startQuiz() {
  stopTimer();
  quizState = createQuiz(shuffle(QUESTIONS));
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  stopTimer();
  const question = quizState.questions[quizState.current];
  progressText.textContent = `Question ${quizState.current + 1} of ${quizState.questions.length}`;
  questionText.textContent = question.question;
  feedbackText.textContent = "";
  nextButton.hidden = true;
  optionsList.innerHTML = "";
  uiState.remainingSeconds = QUESTION_TIME_SECONDS;
  uiState.questionResolved = false;
  uiState.timerDeadline = Date.now() + QUESTION_TIME_SECONDS * 1000;
  timerText.textContent = formatTimeLeft(uiState.remainingSeconds);
  timerText.classList.remove("timer-warning");
  updateTimer();
  uiState.timerId = setInterval(updateTimer, 250);

  question.options.forEach((option, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(index, button));
    item.appendChild(button);
    optionsList.appendChild(item);
  });
}

function stopTimer() {
  if (uiState.timerId !== null) {
    clearInterval(uiState.timerId);
    uiState.timerId = null;
  }
}

function updateTimer() {
  const secondsLeft = Math.max(0, Math.ceil((uiState.timerDeadline - Date.now()) / 1000));
  if (secondsLeft !== uiState.remainingSeconds) {
    uiState.remainingSeconds = secondsLeft;
    timerText.textContent = formatTimeLeft(secondsLeft);
    timerText.classList.toggle("timer-warning", secondsLeft <= 5);
  }

  if (secondsLeft === 0) {
    handleTimeExpired();
  }
}

function lockQuestion() {
  if (uiState.questionResolved) return false;
  uiState.questionResolved = true;
  stopTimer();
  optionsList.querySelectorAll("button").forEach((button) => (button.disabled = true));
  nextButton.hidden = false;
  nextButton.focus();
  return true;
}

function handleTimeExpired() {
  if (!lockQuestion()) return;
  const question = quizState.questions[quizState.current];
  const buttons = optionsList.querySelectorAll("button");
  buttons[question.answer].classList.add("correct");
  feedbackText.textContent = "Time's up!";
}

function selectAnswer(selectedIndex, selectedButton) {
  updateTimer();
  if (!lockQuestion()) return;

  const question = quizState.questions[quizState.current];
  const buttons = optionsList.querySelectorAll("button");
  const result = answerQuestion(quizState, selectedIndex);
  quizState = result.state;

  if (result.correct) {
    selectedButton.classList.add("correct");
    feedbackText.textContent = "Correct!";
  } else {
    selectedButton.classList.add("wrong");
    buttons[question.answer].classList.add("correct");
    feedbackText.textContent = "Not quite. The correct answer is highlighted.";
  }

  nextButton.hidden = false;
  nextButton.focus();
}

function nextQuestion() {
  quizState = advanceQuestion(quizState);
  if (!isQuizFinished(quizState)) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  stopTimer();
  const total = quizState.questions.length;
  const percentage = calculatePercentage(quizState.score, total);
  const newBest = isNewBestScore(percentage, bestScore);
  if (newBest) {
    bestScore = percentage;
    saveBestScore(bestScore);
  }

  const grade = getGrade(percentage);
  scoreText.textContent = `You scored ${quizState.score} out of ${total} (${percentage}%)`;
  bestScoreResultText.textContent = newBest
    ? `Best score: ${bestScore}% — 🏆 New best!`
    : `Best score: ${bestScore}%`;
  gradeText.textContent = `Grade: ${grade}`;
  feedbackMessageText.textContent = getFeedbackMessage(grade);
  renderStartBestScore();
  showScreen(resultScreen);
}

function handleKeydown(event) {
  if (quizScreen.hidden || uiState.questionResolved || isQuizFinished(quizState)) return;

  const selectedIndex = Number(event.key) - 1;
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= 4) return;

  const selectedButton = optionsList.querySelectorAll("button")[selectedIndex];
  if (!selectedButton || selectedButton.disabled) return;
  selectAnswer(selectedIndex, selectedButton);
}

renderStartBestScore();
document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
window.addEventListener("keydown", handleKeydown);
