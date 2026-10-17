// UI code: connects the quiz logic (quiz.js) to the page (index.html).

const QUESTION_TIME_SECONDS = 15;
const state = {
  questions: [],
  current: 0,
  score: 0,
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

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function startQuiz() {
  stopTimer();
  state.questions = shuffle(QUESTIONS);
  state.current = 0;
  state.score = 0;
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  stopTimer();
  const question = state.questions[state.current];
  progressText.textContent = `Question ${state.current + 1} of ${state.questions.length}`;
  questionText.textContent = question.question;
  feedbackText.textContent = "";
  nextButton.hidden = true;
  optionsList.innerHTML = "";
  state.remainingSeconds = QUESTION_TIME_SECONDS;
  state.questionResolved = false;
  state.timerDeadline = Date.now() + QUESTION_TIME_SECONDS * 1000;
  timerText.textContent = formatTimeLeft(state.remainingSeconds);
  timerText.classList.remove("timer-warning");
  updateTimer();
  state.timerId = setInterval(updateTimer, 250);

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
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimer() {
  const secondsLeft = Math.max(0, Math.ceil((state.timerDeadline - Date.now()) / 1000));
  if (secondsLeft !== state.remainingSeconds) {
    state.remainingSeconds = secondsLeft;
    timerText.textContent = formatTimeLeft(secondsLeft);
    timerText.classList.toggle("timer-warning", secondsLeft <= 5);
  }

  if (secondsLeft === 0) {
    handleTimeExpired();
  }
}

function lockQuestion() {
  if (state.questionResolved) return false;
  state.questionResolved = true;
  stopTimer();
  optionsList.querySelectorAll("button").forEach((button) => (button.disabled = true));
  nextButton.hidden = false;
  nextButton.focus();
  return true;
}

function handleTimeExpired() {
  if (!lockQuestion()) return;
  const question = state.questions[state.current];
  const buttons = optionsList.querySelectorAll("button");
  buttons[question.answer].classList.add("correct");
  feedbackText.textContent = "Time's up!";
}

function selectAnswer(selectedIndex, selectedButton) {
  updateTimer();
  if (!lockQuestion()) return;

  const question = state.questions[state.current];
  const buttons = optionsList.querySelectorAll("button");

  if (isCorrect(question, selectedIndex)) {
    state.score++;
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
  state.current++;
  if (state.current < state.questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  stopTimer();
  const total = state.questions.length;
  const percentage = calculatePercentage(state.score, total);
  scoreText.textContent = `You scored ${state.score} out of ${total} (${percentage}%)`;
  gradeText.textContent = `Grade: ${getGrade(percentage)}`;
  showScreen(resultScreen);
}

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
