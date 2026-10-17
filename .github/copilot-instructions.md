# Repository Guidelines

## Project structure

This is a dependency-free static quiz app. The repository-root `index.html` redirects GitHub Pages visitors to `src/index.html`; the app is otherwise served from `src/`.

Keep browser responsibilities separated: `src/questions.js` defines the `QUESTIONS` data, `src/quiz.js` contains DOM-free quiz functions, and `src/app.js` connects those functions to the page and owns UI state. The script order in `src/index.html` is significant: questions and quiz logic must load before the app code.

The logic files expose CommonJS exports when loaded by Node, while remaining plain browser scripts. Keep quiz rules testable without the DOM and put rendering and event handling in `app.js`.

## Build, test, and run

- `npm test` runs both test files with Node's built-in test runner; no install step is needed.
- `node --test --test-name-pattern="isCorrect returns true for the right answer" tests/quiz.test.js` runs one named test. Replace the pattern or file path to select another test.
- `npm start` serves `src/` at `http://localhost:8080` using `http-server` via `npx`.

There is no build or lint script. The starter intentionally has one failing test: `getGrade gives an A for exactly 90%` captures the planted threshold bug for Workshop Chapter 4. The expected initial test result is 8 passing and 1 failing; preserve this setup unless the task is to work through that chapter or otherwise fix the grade behavior.

## Code and test conventions

Questions use `{ question, options, answer }`, with `answer` as a zero-based index into the four options. Keep these fields and invariants aligned with the validation in `tests/questions.test.js`.

Use Node's built-in `node:test` and `node:assert/strict`; there is no test framework or package dependency. Test pure behavior through `src/quiz.js` exports rather than requiring a browser DOM.
