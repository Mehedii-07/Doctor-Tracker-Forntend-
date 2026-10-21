'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  PlusCircle,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Activity size={36} color="var(--primary)" className="animate-pulse" />
          <span>Validating medical portal session...</span>
        </div>
      </div>
    );
  }

  const conditionColors = {
    Critical: '#f43f5e',
    Serious: '#f59e0b',
    Stable: '#10b981',
    Chronic: '#8b5cf6',
    Recovering: '#00d2ff',
  };

  const conditionChartData = stats?.conditionDistribution?.map((item) => ({
    name: item.condition,
    value: item.count,
    color: conditionColors[item.condition] || '#3a86ff',
  })) || [];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Clinical Operations Dashboard"
          subtitle="Real-time aggregation, doctor allocations & patient intake metrics"
        />

        <main className="page-wrapper">
          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                padding: '14px 20px',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Stats Cards */}
          <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
            <StatCard
              title="Total Doctors"
              value={stats?.summary?.totalDoctors}
              icon={Stethoscope}
              color="cyan"
              subtitle="Specialists registered"
              trend="+8.2% vs last month"
            />
            <StatCard
              title="Total Patients"
              value={stats?.summary?.totalPatients}
              icon={Users}
              color="emerald"
              subtitle="Active medical records"
              trend="+14% this quarter"
            />
            <StatCard
              title="Avg Patients / Doctor"
              value={stats?.summary?.avgPatientsPerDoctor}
              icon={TrendingUp}
              color="purple"
              subtitle="Balanced caseload ratio"
              trend="Optimal"
            />
            <StatCard
              title="Critical Patients"
              value={stats?.summary?.criticalPatients}
              icon={AlertTriangle}
              color="rose"
              subtitle="High acuity monitoring"
              trend="Priority Attention"
            />
          </div>

          {/* Charts Row 1: Patients Per Doctor & Date-Based Statistics */}
          <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
            {/* Chart 1: Patients per Doctor */}
            <div className="glass-panel">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    Patients Per Doctor Distribution
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Workload distribution across medical staff
                  </p>
                </div>
                <Link
                  href="/doctors"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  <span>Manage Doctors</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ width: '100%', height: '300px' }}>
                {stats?.patientsPerDoctor?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.patientsPerDoctor}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="name"
                        stroke="var(--text-dim)"
                        fontSize={11}
                        tickLine={false}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis stroke="var(--text-dim)" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111a2e',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                        cursor={{ fill: 'rgba(0, 210, 255, 0.05)' }}
                      />
                      <Bar
                        dataKey="patientCount"
                        name="Patients Assigned"
                        fill="url(#doctorBarGrad)"
                        radius={[6, 6, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="doctorBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00d2ff" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#3a86ff" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-dim)',
                    }}
                  >
                    No doctor patient data available.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Date-based Statistics */}
            <div className="glass-panel">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    Date-Based Admissions Trend
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Daily patient registrations over the past 7 days
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Calendar size={14} />
                  <span>Last 7 Days</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '300px' }}>
                {stats?.dateWiseStats?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.dateWiseStats}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="admissionArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="label"
                        stroke="var(--text-dim)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="var(--text-dim)" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111a2e',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="admissions"
                        name="New Admissions"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#admissionArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-dim)',
                    }}
                  >
                    No admissions logged this week.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Condition Breakdown & Recent Patients */}
          <div className="grid-cols-2" style={{ marginBottom: '28px' }}>
            {/* Condition Breakdown */}
            <div className="glass-panel">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                  Patient Condition Distribution
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Acuity categorization across all hospital units
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', height: '260px' }}>
                <div style={{ width: '55%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {conditionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111a2e',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div
                  style={{
                    width: '45%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    paddingLeft: '12px',
                  }}
                >
                  {conditionChartData.map((item) => (
                    <div
                      key={item.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '3px',
                            backgroundColor: item.color,
                          }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                      </div>
                      <strong style={{ color: '#fff' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="glass-panel">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                  Doctor Specializations
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Departmental staff distribution
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {stats?.specializationDistribution?.slice(0, 5).map((spec) => {
                  const pct = Math.round(
                    (spec.count / (stats.summary.totalDoctors || 1)) * 100
                  );
                  return (
                    <div key={spec.specialization}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {spec.specialization}
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                          {spec.count} doctor{spec.count > 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          borderRadius: '4px',
                          background: 'var(--bg-surface-elevated)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3a86ff, #00d2ff)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Admissions Section */}
          <div className="glass-panel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                  Recently Admitted Patients
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Latest recorded intakes awaiting review or treatment
                </p>
              </div>
              <Link href="/patients" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <span>View All Patients</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Condition</th>
                    <th>Assigned Doctor</th>
                    <th>Status</th>
                    <th>Admission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentPatients?.length > 0 ? (
                    stats.recentPatients.map((patient) => (
                      <tr key={patient._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{patient.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {patient.phone}
                          </div>
                        </td>
                        <td>
                          {patient.age} yrs • {patient.gender}
                        </td>
                        <td>
                          <Badge value={patient.condition} />
                        </td>
                        <td>
                          {patient.doctorId ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{patient.doctorId.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                {patient.doctorId.specialization}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>
                          )}
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
                            }}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(patient.admissionDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                        No patient intake records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
