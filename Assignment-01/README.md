# Assignment-01: Student Registration and Result Management System

**Student:** Harshal Dama | **Roll No:** 59 | **Course:** M.C.A | **Faculty:** Sneha Gavas
**University:** ITM Skills University | **Subject:** Full Stack Application

A responsive web app built with **HTML5, CSS3 and JavaScript**.

## How it works

1. The student enters personal details and marks for five subjects.
2. JavaScript validates every field and shows an error message under any invalid input.
3. Total marks and percentage are calculated and a grade is assigned.
4. The result is **Pass** if the student scores at least 35 in every subject, otherwise **Fail**.
5. The marksheet is displayed on the page without reloading.
6. The student object is converted to JSON with `JSON.stringify()` and saved in the browser's **Local Storage** under the key `students`.

## Features

- Form validation (name, roll number, class, email, phone, marks 0 to 100)
- Duplicate roll number check
- Total, percentage, grade and Pass/Fail result
- Saved students table with View and Delete
- Live view of the stored JSON
- Responsive layout, light and dark mode

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and form |
| `style.css` | Styling and responsive layout |
| `script.js` | Validation, calculation, JSON and Local Storage logic |

## How to run

Download or clone the repository, keep the three files in the same folder, and open `index.html` in a browser. No installation is needed.

## Concepts demonstrated

HTML5 forms, CSS3 responsive design, JavaScript validation, DOM manipulation, Pass/Fail logic, JSON handling, Local Storage.
