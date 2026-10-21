'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi, doctorApi } from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import Toast from '../../components/Toast';
import {
  Users,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  Stethoscope,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function PatientsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Patients & Doctors state
  const [patients, setPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
  });

  // Filters state
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('All');
  const [doctorId, setDoctorId] = useState('All');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    condition: 'Stable',
    doctorId: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Admitted',
    notes: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  // Fetch doctors for the dropdown
  const loadDoctorsList = async () => {
    try {
      const res = await doctorApi.getDoctors({ limit: 100 });
      if (res.success) {
        setDoctorsList(res.data);
      }
    } catch (e) {
      console.error('Failed to load doctors list', e);
    }
  };

  // Fetch patients list
  const fetchPatients = useCallback(
    async (page = pagination.page, limit = pagination.limit) => {
      try {
        setLoading(true);
        const res = await patientApi.getPatients({
          page,
          limit,
          search,
          condition: condition === 'All' ? '' : condition,
          doctorId: doctorId === 'All' ? '' : doctorId,
          status: status === 'All' ? '' : status,
          startDate,
          endDate,
        });

        if (res.success) {
          setPatients(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        showToast(err.message || 'Error fetching patients', 'error');
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, search, condition, doctorId, status, startDate, endDate]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadDoctorsList();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const delay = setTimeout(() => {
        fetchPatients(1, pagination.limit);
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [search, condition, doctorId, status, startDate, endDate, isAuthenticated]);

  // Handle Create Patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const res = await patientApi.createPatient(form);
      if (res.success) {
        showToast('Patient admitted and created successfully!');
        setCreateModalOpen(false);
        resetForm();
        fetchPatients(1);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create patient record', 'error');
    }
  };

  // Handle Edit Patient
  const handleEditPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await patientApi.updatePatient(selectedPatient._id, form);
      if (res.success) {
        showToast('Patient information updated successfully!');
        setEditModalOpen(false);
        fetchPatients(pagination.page);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update patient', 'error');
    }
  };

  // Handle Delete Patient
  const handleDeletePatient = async (patient) => {
    if (confirm(`Are you sure you want to delete patient record for ${patient.name}?`)) {
      try {
        const res = await patientApi.deletePatient(patient._id);
        if (res.success) {
          showToast('Patient record deleted successfully');
          fetchPatients(pagination.page);
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete patient', 'error');
      }
    }
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || '',
      condition: patient.condition,
      doctorId: patient.doctorId?._id || patient.doctorId || '',
      admissionDate: patient.admissionDate
        ? new Date(patient.admissionDate).toISOString().split('T')[0]
        : '',
      status: patient.status || 'Admitted',
      notes: patient.notes || '',
    });
    setEditModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      condition: 'Stable',
      doctorId: doctorsList[0]?._id || '',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'Admitted',
      notes: '',
    });
  };

  const resetFilters = () => {
    setSearch('');
    setCondition('All');
    setDoctorId('All');
    setStatus('All');
    setStartDate('');
    setEndDate('');
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Patient Management"
          subtitle="Dedicated patient registry with conditions, care records, and physician assignments"
        />

        <main className="page-wrapper">
          {/* Top Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                Patient Registry
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                View and edit patient diagnosis, assigned doctors, and admission logs
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setCreateModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>Admit New Patient</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div
            className="glass-panel"
            style={{
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                alignItems: 'end',
              }}
            >
              {/* Search */}
              <div>
                <label className="form-label">Search Patients</label>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-dim)',
                    }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, phone, doctor..."
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              {/* Patient Condition Filter */}
              <div>
                <label className="form-label">Condition Filter</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="form-select"
                >
                  <option value="All">All Conditions</option>
                  <option value="Critical">Critical</option>
                  <option value="Serious">Serious</option>
                  <option value="Stable">Stable</option>
                  <option value="Chronic">Chronic</option>
                  <option value="Recovering">Recovering</option>
                </select>
              </div>

              {/* Doctor Filter */}
              <div>
                <label className="form-label">Assigned Doctor</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="form-select"
                >
                  <option value="All">All Doctors</option>
                  {doctorsList.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filters */}
              <div>
                <label className="form-label">Admitted From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Admitted To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Reset Button */}
              <div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '42px' }}
                >
                  <RefreshCw size={15} />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Patients Data Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Condition</th>
                    <th>Attending Doctor</th>
                    <th>Admission Date</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Loading patient records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : patients.length > 0 ? (
                    patients.map((pt) => (
                      <tr key={pt._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                            {pt.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Phone size={11} /> {pt.phone}
                          </div>
                        </td>

                        <td>
                          {pt.age} yrs • <span style={{ color: 'var(--text-muted)' }}>{pt.gender}</span>
                        </td>

                        <td>
                          <Badge value={pt.condition} />
                        </td>

                        <td>
                          {pt.doctorId ? (
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                {pt.doctorId.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                                {pt.doctorId.specialization}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>
                          )}
                        </td>

                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {new Date(pt.admissionDate).toLocaleDateString()}
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-muted)',
                              fontWeight: 500,
                            }}
                          >
                            {pt.status || 'Admitted'}
                          </span>
                        </td>

                        <td>
                          <div
                            style={{
                              maxWidth: '180px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: '0.78rem',
                              color: 'var(--text-dim)',
                            }}
                            title={pt.notes}
                          >
                            {pt.notes || '—'}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => openEditModal(pt)}
                              className="btn-icon"
                              title="Edit Patient Information"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => handleDeletePatient(pt)}
                              className="btn-icon"
                              title="Delete Patient"
                              style={{ color: '#fb7185' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
                        No patients match the given search and filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={(page) => fetchPatients(page, pagination.limit)}
              onLimitChange={(limit) => fetchPatients(1, limit)}
            />
          </div>
        </main>
      </div>

      {/* CREATE PATIENT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Admit New Patient"
      >
        <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Patient Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Age *</label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="32"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="form-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Phone Contact *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 789-0123"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="patient@email.com"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Clinical Condition *</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="form-select"
              >
                <option value="Stable">Stable</option>
                <option value="Serious">Serious</option>
                <option value="Critical">Critical</option>
                <option value="Chronic">Chronic</option>
                <option value="Recovering">Recovering</option>
              </select>
            </div>

            <div>
              <label className="form-label">Attending Doctor *</label>
              <select
                required
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="form-select"
              >
                <option value="">Select a Doctor</option>
                {doctorsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Admission Date</label>
              <input
                type="date"
                value={form.admissionDate}
                onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="form-select"
              >
                <option value="Admitted">Admitted</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Clinical Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Medical observations, prescription notes..."
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PATIENT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Patient: ${selectedPatient?.name}`}
      >
        <form onSubmit={handleEditPatient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Patient Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Age *</label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="form-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Phone *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Condition *</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="form-select"
              >
                <option value="Stable">Stable</option>
                <option value="Serious">Serious</option>
                <option value="Critical">Critical</option>
                <option value="Chronic">Chronic</option>
                <option value="Recovering">Recovering</option>
              </select>
            </div>

            <div>
              <label className="form-label">Assigned Doctor *</label>
              <select
                required
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="form-select"
              >
                {doctorsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Admission Date</label>
              <input
                type="date"
                value={form.admissionDate}
                onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="form-select"
              >
                <option value="Admitted">Admitted</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Clinical Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}
