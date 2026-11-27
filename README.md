# Academy — Online Course Marketplace & E-Learning Platform

**Academy** is a full-stack e-learning and course enrollment platform built with a strongly typed **TypeScript** & **jQuery** frontend, an **ASP.NET Web API** (`TypescriptExamAPI`) backend, and a relational **Microsoft SQL Server** (`TypescriptExamDB`) database.

## Features

- **Role-Based Authentication & Authorization:** Secure login and registration supporting three distinct user roles: **Student**, **Instructor**, and **Admin**.
- **Instructor Course Management:** Complete CRUD operations for instructors to create, update, categorize, and manage courses.
- **Course Catalog & Shopping Cart:** Students can browse courses by category, add courses to their cart, and manage selections before checkout.
- **Checkout & Automated Invoicing:** Supports debit/credit card payment processing with automatic invoice and line-item detail generation upon enrollment.
- **Student Learning Profile:** Personalized dashboard displaying all active and purchased course enrollments.
- **Admin User Oversight:** Dedicated administrative dashboard to monitor platform activity and manage or remove user accounts.

## Repository Structure

- **`Frontend/`** — TypeScript source modules, compiled JavaScript, HTML5/CSS3 pages, and modular navbar/footer components.
- **`Backend/`** — ASP.NET Web API 2 REST controllers, models, and Entity Framework data access layer (`TypescriptExamAPI`).
- **`Typescript Exam SQL.sql`** — SQL Server database schema (`TypescriptExamDB`) covering users, roles, categories, courses, cart, payment modes, invoices, and enrollments.
- **`Typescript PPT.pptx`** — TypeScript fundamentals, static typing, interfaces, and compilation workflow reference deck.
- **`Question.docx`** — Functional specification and project requirements.

## Tech Stack

- **Frontend:** TypeScript, jQuery, HTML5, CSS3
- **Backend:** C#, ASP.NET Web API 2, Entity Framework
- **Database:** Microsoft SQL Server

## How to Run

1. **Database Setup:** Execute `Typescript Exam SQL.sql` in **SQL Server Management Studio (SSMS)** to create `TypescriptExamDB` and its tables.
2. **Backend Setup:** Open `Backend/TypescriptExamAPI.sln` in **Visual Studio**, verify the SQL Server connection string in `Web.config`, restore NuGet packages, and run the API (`F5`).
3. **Frontend Setup:** Run `tsc` inside `Frontend/` if modifying `.ts` files, then launch the frontend using **VS Code Live Server**[cite: 16, 18].
