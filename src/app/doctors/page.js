'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi } from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import Toast from '../../components/Toast';
import {
  Stethoscope,
  Plus,
  Search,
  Calendar,
  Filter,
  UserPlus,
  Eye,
  Trash2,
  Edit2,
  Users,
  Phone,
  Mail,
  Building,
  RefreshCw,
  AlertCircle,
  Lock,
  Shield,
} from 'lucide-react';

export default function DoctorsPage() {
  const {
    isAuthenticated,
    loading: authLoading,
    role,
    isAdmin,
    isManager,
    isViewer,
    isVisitor,
    canCreate,
    canEdit,
    canDelete,
  } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Doctors State
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
  });
  const [filterOptions, setFilterOptions] = useState({
    specializations: [],
    hospitals: [],
  });

  // Filter & Search Controls
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [hospital, setHospital] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Doctor Patients View Modal State
  const [patientsModalOpen, setPatientsModalOpen] = useState(false);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Add Patient to Doctor Modal State
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [patientDoctorTarget, setPatientDoctorTarget] = useState(null);

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
    status: 'Active',
  });

  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    condition: 'Stable',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Admitted',
    notes: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  // Fetch doctors list
  const fetchDoctors = useCallback(
    async (page = pagination.page, limit = pagination.limit) => {
      try {
        setLoading(true);
        const res = await doctorApi.getDoctors({
          page,
          limit,
          search,
          specialization: specialization === 'All' ? '' : specialization,
          hospital: hospital === 'All' ? '' : hospital,
          startDate,
          endDate,
        });

        if (res.success) {
          setDoctors(res.data);
          setPagination(res.pagination);
          if (res.filterOptions) {
            setFilterOptions(res.filterOptions);
          }
        }
      } catch (err) {
        showToast(err.message || 'Error fetching doctors', 'error');
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, search, specialization, hospital, startDate, endDate]
  );

  useEffect(() => {
    if (isAuthenticated) {
      const delay = setTimeout(() => {
        fetchDoctors(1, pagination.limit);
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [search, specialization, hospital, startDate, endDate, isAuthenticated]);

  // Handle Create Doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!canCreate) {
      showToast('Access Denied: Visitors have view-only access and cannot create doctors.', 'error');
      return;
    }
    try {
      const res = await doctorApi.createDoctor(doctorForm);
      if (res.success) {
        showToast('Doctor created successfully!');
        setCreateModalOpen(false);
        setDoctorForm({
          name: '',
          specialization: '',
          hospital: '',
          phone: '',
          email: '',
          status: 'Active',
        });
        fetchDoctors(1);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create doctor', 'error');
    }
  };

  // Handle Edit Doctor
  const handleEditDoctor = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast('Access Denied: Visitors have view-only access and cannot edit doctor profiles.', 'error');
      return;
    }
    try {
      const res = await doctorApi.updateDoctor(selectedDoctor._id, doctorForm);
      if (res.success) {
        showToast('Doctor profile updated successfully!');
        setEditModalOpen(false);
        fetchDoctors(pagination.page);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update doctor', 'error');
    }
  };

  // Handle Delete Doctor
  const handleDeleteDoctor = async (doctor) => {
    if (!canDelete) {
      showToast('Access Denied: Visitors have view-only access and cannot delete doctors.', 'error');
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete ${doctor.name}? This will remove all associated patients.`
      )
    ) {
      try {
        const res = await doctorApi.deleteDoctor(doctor._id);
        if (res.success) {
          showToast(res.message || 'Doctor deleted successfully!');
          fetchDoctors(pagination.page);
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete doctor', 'error');
      }
    }
  };

  // Open Doctor Patients Modal
  const handleOpenPatientsModal = async (doctor) => {
    setSelectedDoctor(doctor);
    setPatientsModalOpen(true);
    try {
      setPatientsLoading(true);
      const res = await doctorApi.getDoctorPatients(doctor._id);
      if (res.success) {
        setDoctorPatients(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load doctor patients', 'error');
    } finally {
      setPatientsLoading(false);
    }
  };

  // Delete Patient from Doctor List
  const handleDeletePatientFromDoctor = async (patientId) => {
    if (!canDelete) {
      showToast('Access Denied: Visitors have view-only access and cannot delete patients.', 'error');
      return;
    }
    if (confirm('Delete this patient from doctor list?')) {
      try {
        const res = await doctorApi.deletePatientFromDoctor(selectedDoctor._id, patientId);
        if (res.success) {
          showToast('Patient deleted from doctor records');
          // Update list in modal
          setDoctorPatients((prev) => prev.filter((p) => p._id !== patientId));
          // Refresh main doctor list to update counts
          fetchDoctors(pagination.page);
        }
      } catch (err) {
        showToast(err.message || 'Failed to remove patient', 'error');
      }
    }
  };

  // Handle Add Patient under Doctor
  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate) {
      showToast('Access Denied: Visitors have view-only access and cannot add patients.', 'error');
      return;
    }
    try {
      const res = await doctorApi.addPatientToDoctor(patientDoctorTarget._id, patientForm);
      if (res.success) {
        showToast(`Patient added under Dr. ${patientDoctorTarget.name}!`);
        setAddPatientModalOpen(false);
        setPatientForm({
          name: '',
          age: '',
          gender: 'Male',
          phone: '',
          email: '',
          condition: 'Stable',
          admissionDate: new Date().toISOString().split('T')[0],
          status: 'Admitted',
          notes: '',
        });

        // If patients modal is open for this doctor, reload patients
        if (patientsModalOpen && selectedDoctor?._id === patientDoctorTarget._id) {
          handleOpenPatientsModal(patientDoctorTarget);
        }

        fetchDoctors(pagination.page);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add patient', 'error');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSpecialization('All');
    setHospital('All');
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
          title="Doctor Management"
          subtitle="Directory of hospital physicians, appointments & patient assignments"
        />

        <main className="page-wrapper">
          {/* Header Action Bar */}
          <div className="page-header-flex">
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Physicians Directory
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Track workload, hospital affiliations, and patient assignments
              </p>
            </div>

            {canCreate ? (
              <button
                onClick={() => {
                  setDoctorForm({
                    name: '',
                    specialization: '',
                    hospital: '',
                    phone: '',
                    email: '',
                    status: 'Active',
                  });
                  setCreateModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add New Doctor</span>
              </button>
            ) : (
              <span
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 500,
                }}
              >
                <Lock size={14} />
                <span>Read-Only Access</span>
              </span>
            )}
          </div>

          {/* Role Access Notice for Visitor / Viewer */}
          {(isViewer || isVisitor) && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: '#64748b',
              }}
            >
              <Shield size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <span>
                You are signed in as a <strong>Visitor (View-Only)</strong>. You have read-only access to browse doctor profiles, specialties, and patient caseloads. Creating, editing, and deleting records are restricted to Manager and Admin accounts.
              </span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div
            className="glass-panel"
            style={{
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Filter grid */}
            <div className="filter-grid">
              {/* Search */}
              <div>
                <label className="form-label">Search Doctors</label>
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
                    placeholder="Search by name, email, specialization..."
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              {/* Specialization Filter */}
              <div>
                <label className="form-label">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="form-select"
                >
                  <option value="All">All Specializations</option>
                  {filterOptions.specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital Filter */}
              <div>
                <label className="form-label">Hospital</label>
                <select
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="form-select"
                >
                  <option value="All">All Hospitals</option>
                  {filterOptions.hospitals.map((hosp) => (
                    <option key={hosp} value={hosp}>
                      {hosp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filters */}
              <div>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Clear button */}
              <div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '39px' }}
                >
                  <RefreshCw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Doctor Profile</th>
                    <th>Specialization</th>
                    <th>Hospital</th>
                    <th>Contact Info</th>
                    <th>Active Patients</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Loading doctor records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : doctors.length > 0 ? (
                    doctors.map((doc) => (
                      <tr key={doc._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--primary-light)',
                                border: '1px solid var(--primary-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              <Stethoscope size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                {doc.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                                Added {new Date(doc.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            {doc.specialization}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                            <Building size={14} color="var(--text-dim)" />
                            <span>{doc.hospital}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} color="var(--text-dim)" />
                              {doc.phone}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                              <Mail size={12} color="var(--text-dim)" />
                              {doc.email}
                            </span>
                          </div>
                        </td>

                        <td>
                          <button
                            onClick={() => handleOpenPatientsModal(doc)}
                            style={{
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              color: '#16a34a',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s',
                            }}
                          >
                            <Users size={13} />
                            <span>{doc.patientCount || 0} Patients</span>
                          </button>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              backgroundColor: doc.status === 'Active' ? '#f0fdf4' : '#fffbeb',
                              color: doc.status === 'Active' ? '#16a34a' : '#d97706',
                              border: `1px solid ${doc.status === 'Active' ? '#bbf7d0' : '#fde68a'}`,
                              fontWeight: 600,
                            }}
                          >
                            {doc.status || 'Active'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {/* View Patients (All Roles) */}
                            <button
                              onClick={() => handleOpenPatientsModal(doc)}
                              className="btn-icon"
                              title="View Patient List"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Add Patient under this doctor (Admin & Manager) */}
                            {canCreate && (
                              <button
                                onClick={() => {
                                  setPatientDoctorTarget(doc);
                                  setAddPatientModalOpen(true);
                                }}
                                className="btn-icon"
                                title="Add Patient to Doctor"
                                style={{ color: 'var(--primary)' }}
                              >
                                <UserPlus size={15} />
                              </button>
                            )}

                            {/* Edit Doctor (Admin & Manager) */}
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setSelectedDoctor(doc);
                                  setDoctorForm({
                                    name: doc.name,
                                    specialization: doc.specialization,
                                    hospital: doc.hospital,
                                    phone: doc.phone,
                                    email: doc.email,
                                    status: doc.status || 'Active',
                                  });
                                  setEditModalOpen(true);
                                }}
                                className="btn-icon"
                                title="Edit Doctor"
                              >
                                <Edit2 size={15} />
                              </button>
                            )}

                            {/* Delete Doctor (Admin Only) */}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteDoctor(doc)}
                                className="btn-icon"
                                title="Delete Doctor (Admin Only)"
                                style={{ color: '#dc2626' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        No doctors match the selected search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={(page) => fetchDoctors(page, pagination.limit)}
              onLimitChange={(limit) => fetchDoctors(1, limit)}
            />
          </div>
        </main>
      </div>

      {/* MODAL 1: Create Doctor Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Doctor to Portal"
      >
        <form onSubmit={handleCreateDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Full Doctor Name *</label>
            <input
              type="text"
              required
              value={doctorForm.name}
              onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
              placeholder="e.g. Dr. Meredith Grey"
              className="form-input"
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                required
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                placeholder="e.g. Cardiology, Neurosurgery"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Hospital / Clinic *</label>
              <input
                type="text"
                required
                value={doctorForm.hospital}
                onChange={(e) => setDoctorForm({ ...doctorForm, hospital: e.target.value })}
                placeholder="e.g. Central Memorial Hospital"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                value={doctorForm.phone}
                onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Official Email *</label>
              <input
                type="email"
                required
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                placeholder="doctor@hospital.org"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Duty Status</label>
            <select
              value={doctorForm.status}
              onChange={(e) => setDoctorForm({ ...doctorForm, status: e.target.value })}
              className="form-select"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
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
              Save Doctor Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Doctor Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Profile: ${selectedDoctor?.name}`}
      >
        <form onSubmit={handleEditDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Full Doctor Name *</label>
            <input
              type="text"
              required
              value={doctorForm.name}
              onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                required
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Hospital *</label>
              <input
                type="text"
                required
                value={doctorForm.hospital}
                onChange={(e) => setDoctorForm({ ...doctorForm, hospital: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                value={doctorForm.phone}
                onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                required
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              value={doctorForm.status}
              onChange={(e) => setDoctorForm({ ...doctorForm, status: e.target.value })}
              className="form-select"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
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
              Update Doctor
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: View Doctor's Corresponding Patients Modal */}
      <Modal
        isOpen={patientsModalOpen}
        onClose={() => setPatientsModalOpen(false)}
        title={`Assigned Patients: ${selectedDoctor?.name}`}
        maxWidth="750px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Summary with Quick Add Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                {selectedDoctor?.specialization} • {selectedDoctor?.hospital}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Managing {doctorPatients.length} patient record{doctorPatients.length !== 1 ? 's' : ''}
              </div>
            </div>

            {canCreate && (
              <button
                onClick={() => {
                  setPatientDoctorTarget(selectedDoctor);
                  setAddPatientModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ padding: '7px 12px', fontSize: '0.8rem' }}
              >
                <UserPlus size={14} />
                <span>Add Patient</span>
              </button>
            )}
          </div>

          {/* Patients List Table */}
          <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age/Gender</th>
                  <th>Condition</th>
                  <th>Admission</th>
                  {canDelete && <th style={{ textAlign: 'right' }}>Remove</th>}
                </tr>
              </thead>
              <tbody>
                {patientsLoading ? (
                  <tr>
                    <td colSpan={canDelete ? 5 : 4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                      Loading patient records...
                    </td>
                  </tr>
                ) : doctorPatients.length > 0 ? (
                  doctorPatients.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{p.phone}</div>
                      </td>
                      <td>
                        {p.age} yrs • {p.gender}
                      </td>
                      <td>
                        <Badge value={p.condition} />
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(p.admissionDate).toLocaleDateString()}
                      </td>
                      {canDelete && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeletePatientFromDoctor(p._id)}
                            className="btn-icon"
                            title="Delete from doctor list"
                            style={{ color: '#dc2626' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canDelete ? 5 : 4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                      No patients currently assigned to this doctor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={() => setPatientsModalOpen(false)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Add Patient Under Specific Doctor Modal */}
      <Modal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        title={`Admit Patient under Dr. ${patientDoctorTarget?.name}`}
      >
        <form onSubmit={handleAddPatientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Patient Full Name *</label>
            <input
              type="text"
              required
              value={patientForm.name}
              onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              placeholder="e.g. Johnathan Doe"
              className="form-input"
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Age *</label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={patientForm.age}
                onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                placeholder="45"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Gender *</label>
              <select
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                className="form-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Phone Contact *</label>
              <input
                type="text"
                required
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                placeholder="+1 (555) 987-6543"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                placeholder="patient@example.com"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Clinical Condition *</label>
              <select
                value={patientForm.condition}
                onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value })}
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
              <label className="form-label">Intake Status</label>
              <select
                value={patientForm.status}
                onChange={(e) => setPatientForm({ ...patientForm, status: e.target.value })}
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
            <label className="form-label">Admission Date</label>
            <input
              type="date"
              value={patientForm.admissionDate}
              onChange={(e) => setPatientForm({ ...patientForm, admissionDate: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Clinical Notes / Diagnosis</label>
            <textarea
              rows={2}
              value={patientForm.notes}
              onChange={(e) => setPatientForm({ ...patientForm, notes: e.target.value })}
              placeholder="Initial symptoms, diagnosis, and treatment protocol..."
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setAddPatientModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign & Admit Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Feedback */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}
