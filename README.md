# Simple Survey

This project is a simple survey or quiz application. It presents a series of questions to the user and then provides a result based on their answers.

You can try it out here: [https://stefanwer.github.io/simple-survey/](https://stefanwer.github.io/simple-survey/)

## Features

- **Offline Mode:** The application is fully functional without an internet connection.
- **Progressive Web App (PWA):** The application can be saved on your mobile phone or tablet for easy access.
- **PDF Export:** You can download your results as a PDF file.
- **Dynamic Questions:** Questions are loaded from a `questions.json` file, making them easy to customize.

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
