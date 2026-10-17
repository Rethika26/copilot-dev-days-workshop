// Tests use Node's built-in test runner, so nothing needs to be installed.
// Run them with:  npm test
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  createQuiz,
  answerQuestion,
  advanceQuestion,
  isQuizFinished,
  shuffle,
  isCorrect,
  isNewBestScore,
  calculatePercentage,
  getGrade,
  getFeedbackMessage,
  formatTimeLeft,
} = require("../src/quiz.js");

test("createQuiz initializes a new state from the given questions", () => {
  const questions = [{ answer: 0 }];
  const state = createQuiz(questions);

  assert.deepEqual(state, { questions, current: 0, score: 0 });
  assert.notEqual(state.questions, questions);
});

test("createQuiz initializes an empty quiz", () => {
  assert.deepEqual(createQuiz([]), { questions: [], current: 0, score: 0 });
});

test("answerQuestion increments the score for a correct answer without mutating state", () => {
  const state = createQuiz([{ answer: 1 }]);
  const result = answerQuestion(state, 1);

  assert.equal(result.correct, true);
  assert.deepEqual(result.state, { questions: state.questions, current: 0, score: 1 });
  assert.equal(state.score, 0);
});

test("answerQuestion leaves the score unchanged for an incorrect answer", () => {
  const state = createQuiz([{ answer: 1 }]);
  const result = answerQuestion(state, 0);

  assert.equal(result.correct, false);
  assert.equal(result.state.score, 0);
  assert.equal(state.score, 0);
});

test("answerQuestion returns incorrect when the quiz has no current question", () => {
  const state = createQuiz([]);
  const result = answerQuestion(state, 0);

  assert.equal(result.correct, false);
  assert.deepEqual(result.state, state);
});

test("advanceQuestion increments the current question without mutating state", () => {
  const state = createQuiz([{ answer: 0 }]);
  const nextState = advanceQuestion(state);

  assert.equal(nextState.current, 1);
  assert.equal(state.current, 0);
});

test("isQuizFinished returns false while a question remains", () => {
  assert.equal(isQuizFinished(createQuiz([{ answer: 0 }])), false);
});

test("isQuizFinished returns true when all questions are complete", () => {
  assert.equal(isQuizFinished(advanceQuestion(createQuiz([{ answer: 0 }]))), true);
});

test("isQuizFinished returns true for an empty quiz", () => {
  assert.equal(isQuizFinished(createQuiz([])), true);
});

test("isCorrect returns true for the right answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 2), true);
});

test("isCorrect returns false for a wrong answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 0), false);
});

test("isNewBestScore returns true when there is no previous best", () => {
  assert.equal(isNewBestScore(0, null), true);
});

test("isNewBestScore returns true when the current score is higher", () => {
  assert.equal(isNewBestScore(81, 80), true);
});

test("isNewBestScore returns false when the current score ties the best", () => {
  assert.equal(isNewBestScore(80, 80), false);
});

test("isNewBestScore returns false when the current score is lower", () => {
  assert.equal(isNewBestScore(79, 80), false);
});

test("isNewBestScore recognizes a perfect percentage", () => {
  assert.equal(isNewBestScore(100, 99), true);
});

test("isNewBestScore does not treat a zero-score tie as a new best", () => {
  assert.equal(isNewBestScore(0, 0), false);
});

test("calculatePercentage rounds to a whole number", () => {
  assert.equal(calculatePercentage(2, 3), 67);
});

test("calculatePercentage returns 0 when there are no questions", () => {
  assert.equal(calculatePercentage(0, 0), 0);
});

test("shuffle keeps every item and does not change the original array", () => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(original, [1, 2, 3, 4, 5]);
});

test("getGrade returns an A at the 90% boundary", () => {
  assert.equal(getGrade(90), "A");
});

test("getGrade returns a B just below the 90% boundary", () => {
  assert.equal(getGrade(89), "B");
});

test("getGrade returns a B at the 75% boundary", () => {
  assert.equal(getGrade(75), "B");
});

test("getGrade returns a C just below the 75% boundary", () => {
  assert.equal(getGrade(74), "C");
});

test("getGrade returns a C at the 50% boundary", () => {
  assert.equal(getGrade(50), "C");
});

test("getGrade returns Keep practicing just below the 50% boundary", () => {
  assert.equal(getGrade(49), "Keep practicing");
});

test("getFeedbackMessage returns an encouraging message for an A grade", () => {
  assert.equal(getFeedbackMessage("A"), "Outstanding work! You really know your stuff.");
});

test("getFeedbackMessage returns an encouraging message for a B grade", () => {
  assert.equal(getFeedbackMessage("B"), "Great job! Keep practicing to master this.");
});

test("getFeedbackMessage returns an encouraging message for a C grade", () => {
  assert.equal(getFeedbackMessage("C"), "Good effort! Keep learning and improving.");
});

test("getFeedbackMessage returns a general message for any other grade", () => {
  assert.equal(getFeedbackMessage("Keep practicing"), "Every quiz is a chance to learn. Keep going!");
});

test("getFeedbackMessage returns a general message for null", () => {
  assert.equal(getFeedbackMessage(null), "Every quiz is a chance to learn. Keep going!");
});

test("formatTimeLeft formats a positive number of seconds", () => {
  assert.equal(formatTimeLeft(12), "⏱ 12s");
});

test("formatTimeLeft formats the warning threshold", () => {
  assert.equal(formatTimeLeft(5), "⏱ 5s");
});

test("formatTimeLeft formats zero seconds", () => {
  assert.equal(formatTimeLeft(0), "⏱ 0s");
});
