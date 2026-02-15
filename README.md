# ATTR Screening MVP survey

This project is a simple, web-based tool to calculate a screening score for Transthyretin Amyloid Cardiomyopathy (ATTR-CM). It presents a series of questions based on clinical findings and calculates a score based on the user's answers. This can help clinicians identify patients who may need further diagnostic testing for ATTR-CM.

You can try it out here: [https://stefanwer.github.io/ATTR-Screening-MVP-survey/](https://stefanwer.github.io/ATTR-Screening-MVP-survey/)

## Features

- **Offline Mode:** The application is fully functional without an internet connection.
- **Progressive Web App (PWA):** The application can be saved on your mobile phone or tablet for easy access.
- **PDF Export:** You can download your results as a PDF file.
- **Dynamic Questions:** Questions are loaded from a `questions.json` file, making them easy to customize.

## How to Use

1.  Open `index.html` in your web browser.
2.  Answer the questions presented on the `question.html` page by checking the relevant findings.
3.  View your result on the `result.html` page.
4.  On the result page, you can also download your result as a PDF.

## Project Structure

-   `index.html`: The landing page.
-   `question.html`: The page that displays the questions.
-   `result.html`: The page that displays the result.
-   `questions.json`: Contains the screening questions, grouped into modules. Each question has a `score`. The final result is the sum of the scores of the selected findings.
-   `script.js`: The main JavaScript file for the application logic.
-   `style.css`: The stylesheet for the application.
-   `sw.js`: The service worker for offline functionality.
-   `manifest.json`: The web app manifest for PWA features.
