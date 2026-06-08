'use client';
import { useState } from 'react';
import { Download, FileText, Wrench, Users, TrendingUp, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reportsApi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { COLORS } from '@/constants/colors';
import { toast } from 'sonner';

const REPORT_TABS = [
  { value: 'complaints', label: 'Complaint Report', icon: FileText },
  { value: 'sla', label: 'SLA Report', icon: TrendingUp },
  { value: 'maintenance', label: 'Maintenance Report', icon: Wrench },
  { value: 'contractor', label: 'Contractor Performance', icon: Users },
  { value: 'department', label: 'Department Report', icon: Building2 },
];

// FIX #5: helper to trigger a blob download in browser
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('complaints');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const params = {};
  if (dateFrom) params.start_date = dateFrom;
  if (dateTo) params.end_date = dateTo;

  const { data: complaintsData } = useQuery({
    queryKey: ['complaints-report', params],
    queryFn: () => reportsApi.getComplaints(params)
  });
  const { data: slaData } = useQuery({
    queryKey: ['sla-report', params],
    queryFn: () => reportsApi.getSla(params)
  });
  const { data: maintenanceData } = useQuery({
    queryKey: ['maintenance-report', params],
    queryFn: () => reportsApi.getMaintenance(params)
  });
  const { data: contractorData = [] } = useQuery({
    queryKey: ['contractor-report', params],
    queryFn: () => reportsApi.getContractorPerformance(params)
  });
  const { data: departmentData = [] } = useQuery({
    queryKey: ['department-report', params],
    queryFn: () => reportsApi.getDepartment(params)
  });

  const summary = complaintsData?.summary || {};
  const sla = slaData || { breached: 0, met: 0, percentage: 0, byContractor: [] };
  const maint = maintenanceData?.summary || { total: 0, completed: 0, overdue: 0, upcoming: 0, due: 0 };
  const maintByLocation = maintenanceData?.byLocation || [];

  // FIX #5: Export PDF handler
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const blob = await reportsApi.exportPdf({ type: activeTab, ...params });
      downloadBlob(blob, `sail_miom_${activeTab}_report.pdf`);
      toast.success('PDF downloaded');
    } catch (e) {
      toast.error('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  // FIX #5: Export Excel handler
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await reportsApi.exportExcel(params);
      downloadBlob(blob, 'sail_miom_complaints_report.xlsx');
      toast.success('Excel downloaded');
    } catch (e) {
      toast.error('Excel export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary">Reports & Analytics</h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">Generate comprehensive reports for management review</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20" />
            <span className="text-sail-text-muted text-sm">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-sail-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sail-primary/20" />
          </div>
          {/* FIX #5: wired Export PDF button */}
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {exporting ? 'Generating…' : 'Export PDF'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 border border-sail-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <FileText className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="section-card p-0">
        <div className="flex border-b border-sail-border px-4">
          {REPORT_TABS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setActiveTab(value)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === value ? 'border-sail-primary text-sail-primary' : 'border-transparent text-sail-text-secondary hover:text-sail-text-primary'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* COMPLAINTS TAB */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Raised', value: summary.total ?? '—', color: 'text-sail-primary' },
                  { label: 'Total Resolved', value: summary.resolved ?? '—', color: 'text-green-600' },
                  { label: 'Avg Resolution', value: summary.avgResolutionTime ?? '—', color: 'text-orange-600' },
                  { label: 'Breach Rate', value: summary.breachRate ?? '—', color: 'text-red-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 bg-slate-50 rounded-xl border border-sail-border">
                    <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
                    <p className="text-sm text-sail-text-muted">{label}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-sail-text-primary mb-3">Complaints by Priority</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critical', value: (complaintsData?.data || []).filter(c => c.priority === 'CRITICAL').length },
                        { name: 'High', value: (complaintsData?.data || []).filter(c => c.priority === 'HIGH').length },
                        { name: 'Medium', value: (complaintsData?.data || []).filter(c => c.priority === 'MEDIUM').length },
                        { name: 'Low', value: (complaintsData?.data || []).filter(c => c.priority === 'LOW').length },
                      ]}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value">
                      {['#D62828', '#FF6B35', '#F4A261', '#2D9D5F'].map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SLA TAB */}
          {activeTab === 'sla' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 bg-green-50 rounded-xl border border-green-200 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{sla.met}</p>
                  <p className="text-sm text-green-700">SLA Met</p>
                </div>
                <div className="p-5 bg-red-50 rounded-xl border border-red-200 text-center">
                  <p className="text-3xl font-bold text-red-600 mb-1">{sla.breached}</p>
                  <p className="text-sm text-red-700">SLA Breached</p>
                </div>
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <p className="text-3xl font-bold text-sail-primary mb-1">{sla.percentage}%</p>
                  <p className="text-sm text-sail-secondary">Adherence Rate</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-sail-text-primary mb-3">SLA by Contractor</h3>
                <table className="w-full data-table">
                  <thead><tr>
                    <th className="px-4 py-3 text-left">Contractor</th>
                    <th className="px-4 py-3 text-left">Assigned</th>
                    <th className="px-4 py-3 text-left">Breached</th>
                    <th className="px-4 py-3 text-left">Rate</th>
                  </tr></thead>
                  <tbody className="divide-y divide-sail-border">
                    {(sla.byContractor || []).map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-sm">{c.assigned}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{c.breached}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${c.rate >= 90 ? 'text-green-600' : 'text-orange-600'}`}>{c.rate}%</span>
                        </td>
                      </tr>
                    ))}
                    {(sla.byContractor || []).length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-sail-text-muted">No data for selected period</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MAINTENANCE TAB — FIX #4a: now uses real data */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Completed', value: maint.completed, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                  { label: 'Overdue', value: maint.overdue, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
                  { label: 'Due Soon', value: maint.due, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                  { label: 'Upcoming', value: maint.upcoming, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`p-5 rounded-xl border text-center ${bg}`}>
                    <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
                    <p className="text-sm text-sail-text-muted">{label}</p>
                  </div>
                ))}
              </div>
              {maintByLocation.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-sail-text-primary mb-3">By Location</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={maintByLocation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="location" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="completed" name="Completed" fill="#2D9D5F" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="overdue" name="Overdue" fill="#D62828" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* CONTRACTOR TAB — FIX #4b: now uses real data */}
          {activeTab === 'contractor' && (
            <div>
              <table className="w-full data-table">
                <thead><tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Assigned</th>
                  <th className="px-4 py-3 text-left">Resolved</th>
                  <th className="px-4 py-3 text-left">Avg Time</th>
                  <th className="px-4 py-3 text-left">SLA Rate</th>
                  <th className="px-4 py-3 text-left">Work Orders</th>
                </tr></thead>
                <tbody className="divide-y divide-sail-border">
                  {contractorData.map((c) => (
                    <tr key={c.id || c.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-sm text-sail-text-secondary">{c.email || '—'}</td>
                      <td className="px-4 py-3 text-sm">{c.assigned}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{c.resolved}</td>
                      <td className="px-4 py-3 text-sm">{c.avgTime}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${c.slaRate >= 90 ? 'text-green-600' : 'text-orange-600'}`}>{c.slaRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{c.workOrdersCompleted}/{c.workOrdersAssigned}</td>
                    </tr>
                  ))}
                  {contractorData.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-sail-text-muted">No contractor data for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* DEPARTMENT TAB — complaints grouped by the raiser's department */}
          {activeTab === 'department' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Departments', value: departmentData.length, color: 'text-sail-primary' },
                  { label: 'Total Complaints', value: departmentData.reduce((s, d) => s + (d.total || 0), 0), color: 'text-blue-600' },
                  { label: 'Total Breached', value: departmentData.reduce((s, d) => s + (d.breached || 0), 0), color: 'text-red-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 bg-slate-50 rounded-xl border border-sail-border text-center">
                    <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
                    <p className="text-sm text-sail-text-muted">{label}</p>
                  </div>
                ))}
              </div>
              {departmentData.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-sail-text-primary mb-3">Complaints by Department</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="resolved" name="Resolved" fill="#2D9D5F" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="breached" name="Breached" fill="#D62828" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <table className="w-full data-table">
                <thead><tr>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Raised</th>
                  <th className="px-4 py-3 text-left">Resolved</th>
                  <th className="px-4 py-3 text-left">Breached</th>
                  <th className="px-4 py-3 text-left">Avg Time</th>
                  <th className="px-4 py-3 text-left">SLA Rate</th>
                </tr></thead>
                <tbody className="divide-y divide-sail-border">
                  {departmentData.map((d) => (
                    <tr key={d.department} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{d.department}</td>
                      <td className="px-4 py-3 text-sm">{d.total}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{d.resolved}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{d.breached}</td>
                      <td className="px-4 py-3 text-sm">{d.avgTime}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${d.slaRate >= 90 ? 'text-green-600' : 'text-orange-600'}`}>{d.slaRate}%</span>
                      </td>
                    </tr>
                  ))}
                  {departmentData.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-sail-text-muted">No department data for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
