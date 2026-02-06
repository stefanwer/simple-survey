# Simple Survey

This project is a simple survey or quiz application. It presents a series of questions to the user and then provides a result based on their answers.

## How to Use

1. Open `index.html` in your web browser.
2. Answer the questions presented on the `question.html` page.
3. View your result on the `result.html` page.
4. On the result page, you can also download your result as a PDF.

## Project Structure

- `index.html`: The landing page.
- `question.html`: The page that displays the questions.
- `result.html`: The page that displays the result.
- `questions.json`: Contains the survey questions and options. Each question can have any number of answers, and each answer has a `weight`. The final result is calculated based on the sum of the weights of the selected answers.
- `script.js`: The main JavaScript file for the application logic.
- `style.css`: The stylesheet for the application.
