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
  TrendingUp,
  Activity,
  ArrowUpRight,
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
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Activity size={32} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem' }}>Loading portal session...</span>
        </div>
      </div>
    );
  }

  const conditionColors = {
    Critical: '#ef4444',
    Serious: '#f59e0b',
    Stable: '#10b981',
    Chronic: '#8b5cf6',
    Recovering: '#2563eb',
  };

  const conditionChartData = stats?.conditionDistribution?.map((item) => ({
    name: item.condition,
    value: item.count,
    color: conditionColors[item.condition] || '#3b82f6',
  })) || [];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Clinical Dashboard"
          subtitle="Real-time patient intake and doctor distribution metrics"
        />

        <main className="page-wrapper">
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.85rem',
              }}
            >
              <AlertTriangle size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Stats Cards */}
          <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
            <StatCard
              title="Total Doctors"
              value={stats?.summary?.totalDoctors}
              icon={Stethoscope}
              color="cyan"
              subtitle="Registered physicians"
              trend="+8.2%"
            />
            <StatCard
              title="Total Patients"
              value={stats?.summary?.totalPatients}
              icon={Users}
              color="emerald"
              subtitle="Active medical records"
              trend="+14%"
            />
            <StatCard
              title="Avg Patients / Doctor"
              value={stats?.summary?.avgPatientsPerDoctor}
              icon={TrendingUp}
              color="purple"
              subtitle="Staff caseload ratio"
              trend="Balanced"
            />
            <StatCard
              title="Critical Patients"
              value={stats?.summary?.criticalPatients}
              icon={AlertTriangle}
              color="rose"
              subtitle="High acuity attention"
              trend="Priority"
            />
          </div>

          {/* Charts Row 1: Patients Per Doctor & Date-Based Admissions */}
          <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
            {/* Chart 1: Patients per Doctor */}
            <div className="glass-panel">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Patients Per Doctor
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Caseload distribution across medical staff
                  </p>
                </div>
                <Link
                  href="/doctors"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: 'var(--primary)',
                    fontWeight: 500,
                  }}
                >
                  <span>Manage</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div style={{ width: '100%', height: '260px' }}>
                {stats?.patientsPerDoctor?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.patientsPerDoctor}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '0.8rem',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                        }}
                        cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }}
                      />
                      <Bar
                        dataKey="patientCount"
                        name="Patients Assigned"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
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
                      fontSize: '0.85rem',
                    }}
                  >
                    No doctor caseload data available.
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
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Patient Admissions Trend
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Daily patient admissions (Past 7 Days)
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Calendar size={13} />
                  <span>Recent</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px' }}>
                {stats?.dateWiseStats?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.dateWiseStats}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="admissionArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        stroke="var(--text-dim)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="var(--text-dim)" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '0.8rem',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="admissions"
                        name="Admissions"
                        stroke="#10b981"
                        strokeWidth={2}
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
                      fontSize: '0.85rem',
                    }}
                  >
                    No admissions logged this week.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Condition Breakdown & Department Distribution */}
          <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
            {/* Condition Breakdown */}
            <div className="glass-panel">
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Patient Condition Distribution
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Acuity categorization across hospital units
                </p>
              </div>

              <div className="pie-container" style={{ display: 'flex', alignItems: 'center', minHeight: '220px' }}>
                <div className="pie-chart-wrap" style={{ width: '55%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {conditionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '0.8rem',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className="pie-legend-wrap"
                  style={{
                    width: '45%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
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
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: item.color,
                          }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                      </div>
                      <strong style={{ color: 'var(--text-main)' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="glass-panel">
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Specialization Overview
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Staff distribution by medical department
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                          fontSize: '0.82rem',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          {spec.specialization}
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                          {spec.count} doctor{spec.count > 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: '#f1f5f9',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: '#2563eb',
                            borderRadius: '3px',
                            transition: 'width 0.4s ease',
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
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Recently Admitted Patients
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Latest patient intake records
                </p>
              </div>
              <Link href="/patients" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                <span>View All Patients</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
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
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{patient.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
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
                              <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{patient.doctorId.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                {patient.doctorId.specialization}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(patient.admissionDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                        No recent patient records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .pie-container {
            flex-direction: column !important;
            height: auto !important;
            gap: 16px;
          }
          .pie-chart-wrap {
            width: 100% !important;
            height: 200px !important;
          }
          .pie-legend-wrap {
            width: 100% !important;
            padding-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
