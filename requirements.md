# ACME Salary Management System — Requirements

## Goal
Replace spreadsheet-based salary management with a web application that allows an HR Manager to manage employee salary records and answer organization-wide salary questions across multiple countries.

## Target User
HR Manager responsible for maintaining employee and salary information for an organization of 10,000 employees.

## Scope and Features

1. **Dashboard:** Display total employee count, average salary, and salary/headcount summaries by country and department.
2. **Employee Directory:** List employees with server-side pagination, sorting, searching, and filters for country, department, and job title.
3. **Employee Records:** View employee details and create, edit, and validate employee records.
4. **Salary Management:** View and update salary amounts and currencies, with validation and clear separation of salary from employee profile data.
5. **Salary Insights:** Calculate employee counts and average salaries grouped by country, department, and job title. Clearly identify currency when displaying monetary values.
6. **Data and API:** Use a relational database, REST API, and repeatable seed script that generates 10,000 synthetic employee records.
7. **Quality:** Include automated tests, error handling, input validation, documentation, and incremental Git commits.

## Technical Approach
- Frontend: React.
- Backend: ASP.NET Core Web API.
- Data access: Entity Framework Core.
- Database: SQLite for this assessment.
- Testing: Automated backend unit tests and frontend tests for important behavior.

## Non-Functional Requirements
- Support efficient browsing of 10,000 records through server-side pagination and filtering.
- Keep code modular, readable, and maintainable.
- Validate input and return consistent API errors.
- Avoid exposing salary information unnecessarily; design access controls for HR-only use.
- Use deterministic seed data and repeatable tests.
- Document setup, architecture, assumptions, and limitations.

## Deliberately Out of Scope
- Payroll execution, bank transfers, payslips, tax calculations, and statutory compliance: these require additional business rules and integrations.
- Real employee data and external HR/payroll integrations: synthetic data keeps the assessment self-contained and avoids exposing personal information.
- Multi-level approvals, a full audit platform, and advanced role management: valuable for a production rollout, but not necessary to demonstrate the core workflow.
- LLM-powered chat: structured salary analytics answer the core business questions more predictably and keep the initial implementation focused.

## Success Criteria
The application runs end-to-end, seeds 10,000 employees, supports employee and salary management, returns correct salary analytics, passes meaningful automated tests, is deployed with a demo, and includes a clear Git history and supporting documentation.