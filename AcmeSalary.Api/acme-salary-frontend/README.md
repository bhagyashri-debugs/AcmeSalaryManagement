# Acme Salary Management

A full-stack employee management application built with React and ASP.NET Core Web API. The application supports employee record management, salary information, searching, filtering, sorting, pagination, and dashboard summaries.

## Features

- **Employee management:** Create, view, update, and delete employee records.
- **Employee directory:** Browse employee records with server-side pagination.
- **Search and filtering:** Search employees and filter by country, department, and job title.
- **Sorting:** Sort employee records by supported fields.
- **Salary management:** Store basic salary and currency information.
- **Dashboard:** View employee and department statistics, with country and department headcount summaries.
- **Database migrations:** Manage database schema changes using Entity Framework Core.
- **Sample data:** Seed 10,000 employee records for testing.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- HTML and CSS

### Backend
- ASP.NET Core Web API
- C#
- .NET 10
- Entity Framework Core
- SQLite

### Testing and Version Control
- xUnit
- Git and GitHub

## Project Structure

```text
AcmeSalaryManagement/
├── AcmeSalary.Api/
│   ├── Controllers/
│   ├── Data/
│   ├── Migrations/
│   ├── Models/
│   ├── Services/
│   └── acme-salary-frontend/
│       └── src/
└── AcmeSalary.Tests/
```

## Prerequisites

Install the following before running the application:

- .NET 10 SDK
- Node.js and npm
- Git (optional, for cloning the repository)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/bhagyashri-debugs/AcmeSalaryManagement.git
cd AcmeSalaryManagement
```

### 2. Start the backend

From the repository root:

```bash
cd AcmeSalary.Api
dotnet restore
dotnet run
```

The API is configured to run at `http://localhost:5185` in the development setup.

If the database has not yet been created or migrated, apply the existing Entity Framework Core migrations using the project's configured database connection and migration setup.

### 3. Start the frontend

Open a second terminal:

```bash
cd AcmeSalary.Api/acme-salary-frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal. The development frontend is expected at `http://localhost:5173`.

Keep both the backend and frontend running while using the application.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/employees` | Retrieve paginated employees |
| GET | `/api/employees?page=1&pageSize=20` | Retrieve a specific page |
| GET | `/api/employees/summary` | Retrieve dashboard summary data |
| GET | `/api/employees/{id}` | Retrieve an employee by ID |
| POST | `/api/employees` | Create an employee |
| PUT | `/api/employees/{id}` | Update an employee |
| DELETE | `/api/employees/{id}` | Delete an employee |

The employee listing endpoint supports pagination and the implemented search, filtering, and sorting parameters.

## Running Tests

From the repository root:

```bash
dotnet test AcmeSalary.Tests/AcmeSalary.Tests.csproj
```

The current verified test run completed successfully with **16 tests passed and 0 failures**.

## Production Build

To create a production build of the frontend:

```bash
cd AcmeSalary.Api/acme-salary-frontend
npm install
npm run build
```

The production files are generated in the frontend's `dist` directory.

## Repository

GitHub: https://github.com/bhagyashri-debugs/AcmeSalaryManagement

## Notes

- Configure the database connection and migration setup for the target environment before running the application.
- Ensure the frontend API URL matches the backend URL.
- Salary values should be interpreted together with their currency; amounts in different currencies should not be combined into a single total without conversion.
- This project is intended as an employee and salary management application.

