import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5185/api/employees';
const SALARY_API_URL = 'http://localhost:5185/api/salary';

const initialForm = {
  name: '',
  email: '',
  department: '',
  basicSalary: '',
};

function formatCurrency(amount) {
  return Number(amount ?? 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
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

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch employees.');
      setEmployees(await response.json());
    } catch (err) {
      setError(err.message || 'Unable to connect to the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
    if (
      formData.basicSalary === '' ||
      !Number.isFinite(Number(formData.basicSalary)) ||
      Number(formData.basicSalary) <= 0
    ) {
      return 'Basic salary must be greater than zero.';
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
      basicSalary: Number(formData.basicSalary),
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
        const message = await response.text();
        throw new Error(message || 'Unable to save employee.');
      }

      setSuccess(
        isEditing
          ? 'Employee updated successfully.'
          : 'Employee added successfully.'
      );
      setFormData(initialForm);
      setEditingId(null);
      await fetchEmployees();
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
      basicSalary: String(employee.basicSalary ?? ''),
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
        throw new Error((await response.text()) || 'Failed to delete employee.');
      }
      if (editingId === employee.id) handleCancelEdit();
      setSuccess('Employee deleted successfully.');
      await fetchEmployees();
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
      if (!response.ok) throw new Error('Unable to fetch salary details.');
      setSalaryDetails(await response.json());
    } catch (err) {
      setError(err.message || 'Unable to load salary details.');
    } finally {
      setSalaryLoading(false);
    }
  };

  const totalBasicSalary = employees.reduce(
    (total, employee) => total + Number(employee.basicSalary || 0),
    0
  );
  const departments = new Set(
    employees.map((employee) => employee.department?.trim()).filter(Boolean)
  );

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
            onClick={fetchEmployees}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </header>

        {error && <div className="alert error-alert" role="alert">{error}</div>}
        {success && <div className="alert success-alert" role="status">{success}</div>}

        <section className="summary-grid">
          <div className="summary-card">
            <div className="summary-card-top">
              Total Employees <span className="summary-icon">♙</span>
            </div>
            <h2>{employees.length}</h2>
            <p>Employees in the system</p>
          </div>
          <div className="summary-card">
            <div className="summary-card-top">
              Combined Basic Salary <span className="summary-icon">₹</span>
            </div>
            <h2>{formatCurrency(totalBasicSalary)}</h2>
            <p>Total basic salary of all employees</p>
          </div>
          <div className="summary-card">
            <div className="summary-card-top">
              Departments <span className="summary-icon">▤</span>
            </div>
            <h2>{departments.size}</h2>
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
                <label htmlFor="basicSalary">Basic Salary (₹)</label>
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
            </div>

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={saving}>
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
              <p>View and manage your employee records.</p>
            </div>
            <span className="employee-count">{employees.length} employees</span>
          </div>

          {loading ? (
            <p className="table-message">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="table-message">
              No employees found. Add an employee using the form above.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Basic Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td className="employee-name">{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>
                        <span className="department-badge">
                          {employee.department}
                        </span>
                      </td>
                      <td className="salary-cell">
                        {formatCurrency(employee.basicSalary)}
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
          <div className="salary-modal" onClick={(event) => event.stopPropagation()}>
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
              <div className="salary-row">
                <span>Basic Salary</span>
                <strong>{formatCurrency(salaryDetails.basicSalary)}</strong>
              </div>
              <div className="salary-row">
                <span>HRA</span>
                <strong>{formatCurrency(salaryDetails.hra)}</strong>
              </div>
              <div className="salary-row">
                <span>Other Allowance</span>
                <strong>{formatCurrency(salaryDetails.otherAllowance)}</strong>
              </div>
              <div className="salary-row">
                <span>Gross Salary</span>
                <strong>{formatCurrency(salaryDetails.grossSalary)}</strong>
              </div>
              <div className="salary-row">
                <span>Deductions</span>
                <strong>−{formatCurrency(salaryDetails.deductions)}</strong>
              </div>
              <div className="salary-row net-salary-row">
                <span>Net Salary</span>
                <strong>{formatCurrency(salaryDetails.netSalary)}</strong>
              </div>
            </div>

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