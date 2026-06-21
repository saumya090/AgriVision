import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Users, Sprout, TrendingUp, ShoppingBag, Trash2, Mail, MapPin, Loader, ShieldAlert, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch platform metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, name) => {
    if (userId === user._id) {
      showToast('You cannot delete your own admin account', 'warning');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete user "${name}"? This action will cascade-delete all of their farms, crops sown, irrigation tasks, harvests, expenses, and marketplace listings. This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      showToast(`User account "${name}" and all related data purged`, 'success');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete user account', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm font-semibold">Gathering AgriVision stats...</p>
      </div>
    );
  }

  // Chart structures
  const userRoleData = [
    { name: 'Farmers', value: stats?.usersBreakdown?.farmers || 0 },
    { name: 'Admins', value: stats?.usersBreakdown?.admins || 0 }
  ];

  const cropStatusData = [
    { name: 'Active', value: stats?.cropsBreakdown?.active || 0 },
    { name: 'Planned', value: stats?.cropsBreakdown?.planned || 0 },
    { name: 'Harvested', value: stats?.cropsBreakdown?.harvested || 0 }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          Admin Control Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor system metrics, manage user databases, and supervise marketplace listings.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Users</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalUsers || 0}</h3>
            <span className="text-[10px] text-slate-400 block mt-2">Farmers & Admins</span>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        {/* Total Farms */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Farms</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats?.totalFarms || 0}</h3>
            <span className="text-[10px] text-slate-400 block mt-2">Registered land plots</span>
          </div>
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl">
            <Sprout size={24} />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Harvest Revenue</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-400 block mt-2">Aggregate transaction sales</span>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Products listed */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Market Products</span>
            <h3 className="text-2xl font-black text-amber-500 mt-1">{stats?.totalProducts || 0}</h3>
            <span className="text-[10px] text-slate-400 block mt-2">Active buyer listings</span>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <ShoppingBag size={24} />
          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: User Distribution (Pie) */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">User Base breakdown</h2>
            <p className="text-xs text-slate-400 mt-1">Proportion of Farmers vs System Admin accounts</p>
          </div>
          <div className="h-60 w-full flex items-center justify-center relative my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRoleData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs text-slate-400 uppercase font-bold">Accounts</span>
              <span className="text-xl font-extrabold text-white">{stats?.totalUsers}</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {userRoleData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                <span className="text-xs text-slate-400 font-semibold">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Crop cycle status breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">System Sowing Dynamics</h2>
            <p className="text-xs text-slate-400 mt-1">Status distribution across all registered crop cycles</p>
          </div>
          <div className="h-60 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropStatusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Bar dataKey="value" name="Crop cycles" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {cropStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
            Distribution: Active vs Planned vs Harvested crops
          </div>
        </div>

      </div>

      {/* User Accounts Management Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">User Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Manage system accounts and access clearances.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-right">Clearances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50 text-slate-350">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-850/15 transition-all">
                  <td className="py-4 font-bold text-white text-sm">{u.name}</td>
                  <td className="py-4 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} />
                      {u.email}
                    </span>
                  </td>
                  <td className="py-4 font-medium">{u.phone}</td>
                  <td className="py-4">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-slate-500" />
                      {u.district}, {u.state}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      u.role === 'Admin' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {u._id !== user._id ? (
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="text-slate-500 hover:text-rose-450 font-bold p-1 hover:bg-slate-950 border border-transparent hover:border-slate-850 rounded-lg transition-all"
                        title="Purge User Account"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic px-2">Active Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
