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
} from 'lucide-react';

export default function DoctorsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
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
                Physicians Directory
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Create, track workload, and manage doctor-patient relationships
              </p>
            </div>

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
              <Plus size={18} />
              <span>Create New Doctor</span>
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
            {/* Top row: Search and Dates */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                alignItems: 'end',
              }}
            >
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
                    style={{ paddingLeft: '38px' }}
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
                <label className="form-label">Registered From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Registered To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Clear button */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '42px' }}
                >
                  <RefreshCw size={15} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none' }}>
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Loading doctor records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : doctors.length > 0 ? (
                    doctors.map((doc) => (
                      <tr key={doc._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(58,134,255,0.2))',
                                border: '1px solid rgba(0,210,255,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                fontWeight: 700,
                              }}
                            >
                              <Stethoscope size={20} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                                {doc.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                                Member since {new Date(doc.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(58, 134, 255, 0.12)',
                              color: '#60a5fa',
                              border: '1px solid rgba(58, 134, 255, 0.25)',
                            }}
                          >
                            {doc.specialization}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <Building size={14} color="var(--text-dim)" />
                            <span>{doc.hospital}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#34d399',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s',
                            }}
                          >
                            <Users size={14} />
                            <span>{doc.patientCount || 0} Patients</span>
                          </button>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: doc.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color: doc.status === 'Active' ? '#34d399' : '#fbbf24',
                              border: `1px solid ${doc.status === 'Active' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                              fontWeight: 600,
                            }}
                          >
                            {doc.status || 'Active'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {/* View Patients */}
                            <button
                              onClick={() => handleOpenPatientsModal(doc)}
                              className="btn-icon"
                              title="View Patient List"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Add Patient under this doctor */}
                            <button
                              onClick={() => {
                                setPatientDoctorTarget(doc);
                                setAddPatientModalOpen(true);
                              }}
                              className="btn-icon"
                              title="Add Patient to Doctor"
                              style={{ color: 'var(--primary)' }}
                            >
                              <UserPlus size={16} />
                            </button>

                            {/* Edit Doctor */}
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
                              <Edit2 size={16} />
                            </button>

                            {/* Delete Doctor */}
                            <button
                              onClick={() => handleDeleteDoctor(doc)}
                              className="btn-icon"
                              title="Delete Doctor"
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              borderRadius: '10px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>
                {selectedDoctor?.specialization} • {selectedDoctor?.hospital}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Managing {doctorPatients.length} patient record{doctorPatients.length !== 1 ? 's' : ''}
              </div>
            </div>

            <button
              onClick={() => {
                setPatientDoctorTarget(selectedDoctor);
                setAddPatientModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <UserPlus size={15} />
              <span>Add Patient to Dr. {selectedDoctor?.name?.split(' ')[1] || ''}</span>
            </button>
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
                  <th style={{ textAlign: 'right' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {patientsLoading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                      Loading patient records...
                    </td>
                  </tr>
                ) : doctorPatients.length > 0 ? (
                  doctorPatients.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.phone}</div>
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
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeletePatientFromDoctor(p._id)}
                          className="btn-icon"
                          title="Delete from doctor list"
                          style={{ color: '#fb7185' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
