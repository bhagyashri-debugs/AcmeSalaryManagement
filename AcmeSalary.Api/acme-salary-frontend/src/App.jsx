import { useCallback, useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5185/api/employees';
const SALARY_API_URL = 'http://localhost:5185/api/salary';
const PAGE_SIZE = 20;

const initialForm = {
  name: '',
  email: '',
  department: '',
  country: 'India',
  jobTitle: '',
  basicSalary: '',
  currency: 'INR',
};

const CURRENCIES = ['INR', 'USD', 'GBP', 'CAD', 'AUD', 'EUR', 'SGD'];

function formatCurrency(amount, currency = 'INR') {
  const safeCurrency = CURRENCIES.includes(currency) ? currency : 'INR';

  return Number(amount ?? 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 2,
  });
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [summary, setSummary] = useState({
  employeeCount: 0,
  departments: 0,
  salaryByCurrency: [],
});

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sortBy,
        sortOrder,
      });

      if (search.trim()) params.set('search', search.trim());
      if (country) params.set('country', country);
      if (department) params.set('department', department);
      if (jobTitle) params.set('jobTitle', jobTitle);

      const response = await fetch(`${API_URL}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch employees. Check the API.');
      }

      const result = await response.json();

      // Supports both the paged API response and a plain employee array.
      if (Array.isArray(result)) {
        setEmployees(result);
        setTotalCount(result.length);
      } else {
        setEmployees(result.data ?? result.employees ?? result.items ?? []);
        setTotalCount(result.totalCount ?? result.total ?? 0);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the API.');
      setEmployees([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, country, department, jobTitle, sortBy, sortOrder]);

  

const fetchSummary = useCallback(async () => {
  try {
    const response = await fetch(
      'http://localhost:5185/api/employees/summary'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard summary.');
    }

    const result = await response.json();

    setSummary({
      employeeCount: result.employeeCount ?? 0,
      departments: result.departmentCount ?? 0,
      salaryByCurrency: result.salaryByCurrency ?? [],
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
  }
}, []);



  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      return 'Name must contain at least 2 characters.';
    }

    if (formData.name.trim().length > 100) {
      return 'Name cannot exceed 100 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (!formData.department.trim()) {
      return 'Department is required.';
    }

    if (formData.department.trim().length > 50) {
      return 'Department cannot exceed 50 characters.';
    }

    if (!formData.country.trim()) {
      return 'Country is required.';
    }

    if (!formData.jobTitle.trim()) {
      return 'Job title is required.';
    }

    if (
      formData.basicSalary === '' ||
      !Number.isFinite(Number(formData.basicSalary)) ||
      Number(formData.basicSalary) <= 0
    ) {
      return 'Basic salary must be greater than zero.';
    }

    if (!CURRENCIES.includes(formData.currency)) {
      return 'Please select a valid currency.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const employeeData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      department: formData.department.trim(),
      country: formData.country.trim(),
      jobTitle: formData.jobTitle.trim(),
      basicSalary: Number(formData.basicSalary),
      currency: formData.currency,
    };

    try {
      setSaving(true);

      const isEditing = editingId !== null;
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        let message = responseText;

        try {
          const parsed = JSON.parse(responseText);
          message =
            parsed.message ||
            parsed.title ||
            Object.values(parsed.errors ?? {}).flat().join(' ') ||
            responseText;
        } catch {
          // Keep the original response text.
        }

        throw new Error(message || 'Unable to save employee.');
      }

      setSuccess(
        isEditing
          ? 'Employee updated successfully.'
          : 'Employee added successfully.'
      );

      setFormData(initialForm);
      setEditingId(null);

      if (!isEditing && page !== 1) {
        setPage(1);
      } else {
        await fetchEmployees();
      }

      await fetchSummary();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name ?? '',
      email: employee.email ?? '',
      department: employee.department ?? '',
      country: employee.country ?? 'India',
      jobTitle: employee.jobTitle ?? '',
      basicSalary: String(employee.basicSalary ?? ''),
      currency: CURRENCIES.includes(employee.currency)
        ? employee.currency
        : 'INR',
    });

    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (employee) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${employee.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/${employee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(
          (await response.text()) || 'Failed to delete employee.'
        );
      }

      if (editingId === employee.id) handleCancelEdit();

      setSuccess('Employee deleted successfully.');

      if (employees.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchEmployees();
      }

      await fetchSummary();
    } catch (err) {
      setError(err.message || 'Unable to delete employee.');
    }
  };

  const handleViewSalary = async (employeeId) => {
    setSalaryDetails(null);
    setSalaryLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${SALARY_API_URL}/${employeeId}`);

      if (!response.ok) {
        throw new Error('Unable to fetch salary details.');
      }

      setSalaryDetails(await response.json());
    } catch (err) {
      setError(err.message || 'Unable to load salary details.');
    } finally {
      setSalaryLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }

    setPage(1);
  };

  const sortIndicator = (field) => {
    if (sortBy !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const resetFilters = () => {
    setSearch('');
    setCountry('');
    setDepartment('');
    setJobTitle('');
    setPage(1);
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h2>Acme Salary</h2>
            <p>Management Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-link active">
            <span>▦</span> Dashboard
          </a>
          <a href="#employees" className="nav-link">
            <span>♙</span> Employees
          </a>
          <a href="#employee-form" className="nav-link">
            <span>＋</span> Add Employee
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>Acme Salary Management</p>
          <small>Employee administration</small>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="page-header">
          <div>
            <p className="eyebrow">HR MANAGEMENT SYSTEM</p>
            <h1>Dashboard</h1>
            <p className="page-subtitle">
              Manage your employees and salary information.
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={() => {
              fetchEmployees();
              fetchSummary();
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </header>

        {error && (
          <div className="alert error-alert" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert success-alert" role="status">
            {success}
          </div>
        )}

        <section className="summary-grid">
          <div className="summary-card">
            <div className="summary-card-top">
              Total Employees <span className="summary-icon">♙</span>
            </div>
            <h2>{summary.employeeCount.toLocaleString('en-IN')}</h2>
            <p>Employees in the system</p>
          </div>

          
<div className="summary-card">
  <div className="summary-card-top">
    Salary by Currency <span className="summary-icon">₹</span>
  </div>

  {summary.salaryByCurrency.length === 0 ? (
    <h2>Loading...</h2>
  ) : (
    <div>
      {summary.salaryByCurrency.map((item) => (
        <div
          key={item.currency}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '10px',
            fontSize: '14px',
          }}
        >
          <span>
            {item.currency} ({item.employeeCount} employees)
          </span>
          <strong>
            {formatCurrency(item.totalBasicSalary, item.currency)}
          </strong>
        </div>
      ))}
    </div>
  )}

  <p>Basic salary totals shown separately for each currency.</p>
</div>


          <div className="summary-card">
            <div className="summary-card-top">
              Departments <span className="summary-icon">▤</span>
            </div>
            <h2>{summary.departments}</h2>
            <p>Unique departments</p>
          </div>
        </section>

        <section className="content-card form-card" id="employee-form">
          <div className="section-heading">
            <div>
              <h2>{editingId !== null ? 'Edit Employee' : 'Add Employee'}</h2>
              <p>
                {editingId !== null
                  ? 'Update the employee details below.'
                  : 'Enter employee details to add a new record.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Engineering"
                  maxLength={50}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="basicSalary">Basic Salary</label>
                <input
                  id="basicSalary"
                  name="basicSalary"
                  type="number"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  placeholder="Enter basic salary"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update Employee'
                    : '+ Add Employee'}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="content-card employees-card" id="employees">
          <div className="section-heading">
            <div>
              <h2>Employee Directory</h2>
              <p>Search, filter, sort, and manage employee records.</p>
            </div>
            <span className="employee-count">
              {totalCount.toLocaleString('en-IN')} employees
            </span>
          </div>

          <div className="form-grid directory-filters">
            <div className="form-field">
              <label htmlFor="search">Search name or email</label>
              <input
                id="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Type a name or email"
              />
            </div>

            <div className="form-field">
              <label htmlFor="filterCountry">Country</label>
              <select
                id="filterCountry"
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All countries</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="filterDepartment">Department</label>
              <select
                id="filterDepartment"
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All departments</option>
                {[
                  'Engineering',
                  'Human Resources',
                  'Finance',
                  'Sales',
                  'Marketing',
                  'Operations',
                  'IT',
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="filterJobTitle">Job Title</label>
              <select
                id="filterJobTitle"
                value={jobTitle}
                onChange={(event) => {
                  setJobTitle(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All job titles</option>
                {[
                  'Software Engineer',
                  'Senior Software Engineer',
                  'HR Manager',
                  'Financial Analyst',
                  'Sales Executive',
                  'Marketing Specialist',
                  'Operations Manager',
                  'IT Support Analyst',
                  'Team Lead',
                  'Data Analyst',
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          </div>

          {loading ? (
            <p className="table-message">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="table-message">
              No employees found for the selected search or filters.
            </p>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>
                        <button type="button" onClick={() => handleSort('id')}>
                          ID{sortIndicator('id')}
                        </button>
                      </th>
                      <th>
                        <button type="button" onClick={() => handleSort('name')}>
                          Employee{sortIndicator('name')}
                        </button>
                      </th>
                      <th>
                        <button type="button" onClick={() => handleSort('email')}>
                          Email{sortIndicator('email')}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          onClick={() => handleSort('country')}
                        >
                          Country{sortIndicator('country')}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          onClick={() => handleSort('department')}
                        >
                          Department{sortIndicator('department')}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          onClick={() => handleSort('jobTitle')}
                        >
                          Job Title{sortIndicator('jobTitle')}
                        </button>
                      </th>
                      <th>
                        <button
                          type="button"
                          onClick={() => handleSort('basicSalary')}
                        >
                          Basic Salary{sortIndicator('basicSalary')}
                        </button>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <td className="employee-name">{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.country}</td>
                        <td>
                          <span className="department-badge">
                            {employee.department}
                          </span>
                        </td>
                        <td>{employee.jobTitle}</td>
                        <td className="salary-cell">
                          {formatCurrency(
                            employee.basicSalary,
                            employee.currency
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="salary-button"
                              type="button"
                              onClick={() => handleViewSalary(employee.id)}
                            >
                              View Salary
                            </button>
                            <button
                              className="edit-button"
                              type="button"
                              onClick={() => handleEdit(employee)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              type="button"
                              onClick={() => handleDelete(employee)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-actions pagination-controls">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>

        <footer className="page-footer">
          Acme Salary Management · Employee administration
        </footer>
      </main>

      {salaryLoading && (
        <div className="salary-modal-backdrop" role="dialog" aria-modal="true">
          <div className="salary-modal">
            <p>Loading salary details...</p>
          </div>
        </div>
      )}

      {salaryDetails && (
        <div
          className="salary-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="salary-modal-title"
          onClick={() => setSalaryDetails(null)}
        >
          <div
            className="salary-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="salary-modal-header">
              <div>
                <h2 id="salary-modal-title">Salary Breakdown</h2>
                <p>Employee ID: {salaryDetails.employeeId}</p>
              </div>

              <button
                className="close-button"
                type="button"
                onClick={() => setSalaryDetails(null)}
                aria-label="Close salary details"
              >
                ×
              </button>
            </div>

            <div className="salary-details">
              {[
                ['Basic Salary', salaryDetails.basicSalary],
                ['HRA', salaryDetails.hra],
                ['Other Allowance', salaryDetails.otherAllowance],
                ['Gross Salary', salaryDetails.grossSalary],
                ['Deductions', salaryDetails.deductions],
                ['Net Salary', salaryDetails.netSalary],
              ].map(([label, amount]) => (
                <div
                  className={`salary-row ${
                    label === 'Net Salary' ? 'net-salary-row' : ''
                  }`}
                  key={label}
                >
                  <span>{label}</span>
                  <strong>
                    {label === 'Deductions' ? '−' : ''}
                    {formatCurrency(amount, salaryDetails.currency || 'INR')}
                  </strong>
                </div>
              ))}
            </div>

            <p className="page-subtitle">
              Illustrative salary breakdown only; not a statutory payroll
              calculation.
            </p>

            <button
              className="close-modal-button"
              type="button"
              onClick={() => setSalaryDetails(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
