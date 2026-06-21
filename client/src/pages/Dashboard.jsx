import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  Sprout, 
  Droplet, 
  TrendingUp, 
  MapPin, 
  ArrowRight,
  TrendingDown,
  Activity,
  Calendar,
  AlertCircle,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [irrigation, setIrrigation] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [farmsRes, cropsRes, irrigationRes, harvestsRes, analyticsRes] = await Promise.all([
          API.get('/farms'),
          API.get('/crops'),
          API.get('/irrigation'),
          API.get('/harvests'),
          API.get('/expenses/analytics'),
        ]);

        setFarms(farmsRes.data.data);
        setCrops(cropsRes.data.data);
        setIrrigation(irrigationRes.data.data);
        setHarvests(harvestsRes.data.data);
        setAnalytics(analyticsRes.data);

      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        showToast('Failed to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-semibold">Cultivating dashboard insights...</p>
      </div>
    );
  }

  // Derived dashboard metrics
  const totalFarms = farms.length;
  const activeCropsCount = crops.filter(c => c.status === 'Active').length;
  
  // Filter future irrigation tasks
  const upcomingIrrigations = irrigation
    .filter(i => new Date(i.date) >= new Date())
    .slice(0, 3);

  const recentHarvests = harvests.slice(0, 3);
  const totalExpenses = analytics?.summary?.totalExpenses || 0;
  const totalRevenue = analytics?.summary?.totalRevenue || 0;
  const netProfit = analytics?.summary?.netProfit || 0;

  // Chart configs
  const monthlyData = analytics?.monthlyData || [];
  const categoryData = analytics?.categoryData || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user.name}!</h1>
          <p className="text-sm text-slate-400 mt-1">Here is a quick overview of your agriculture operations today.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-2 px-4 rounded-2xl text-xs font-bold">
          <MapPin size={14} />
          {user.district}, {user.state}
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Farms */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Farms</span>
            <h3 className="text-2xl font-black text-white mt-1">{totalFarms}</h3>
            <Link to="/farms" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 mt-3 transition-colors">
              Manage Farms <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Sprout size={24} />
          </div>
        </div>

        {/* Card 2: Active Crops */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Crops</span>
            <h3 className="text-2xl font-black text-white mt-1">{activeCropsCount}</h3>
            <Link to="/crops" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 mt-3 transition-colors">
              Track Growth <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl">
            <Activity size={24} />
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Revenue</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{totalRevenue.toLocaleString()}</h3>
            <span className="text-[10px] text-slate-400 mt-3 block">From harvested logs</span>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Profit</span>
            <h3 className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-400 mt-3 block">Revenue - Expenses</span>
          </div>
          <div className={`p-4 rounded-2xl ${netProfit >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            {netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
        </div>

      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Financial Area Chart */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Revenue vs Expense Timeline</h2>
              <p className="text-xs text-slate-400 mt-1">Monthly trend of your cultivation finance</p>
            </div>
          </div>
          <div className="h-80 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No financial data logged yet. Add harvests or expenses to populate chart.
              </div>
            )}
          </div>
        </div>

        {/* Right: Categorized Expenses Pie Chart */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Expense Breakdown</h2>
            <p className="text-xs text-slate-400 mt-1">Categorical distribution of cost</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative">
            {totalExpenses > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">No expenses logged yet.</div>
            )}
            {totalExpenses > 0 && (
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                <span className="text-lg font-extrabold text-white">₹{totalExpenses.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Pie Chart Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.filter(d => d.value > 0).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-[11px] text-slate-400 font-medium truncate">{item.name} ({Math.round((item.value / totalExpenses) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Bottom Side widgets (Farming Tip, Upcoming Irrigation, Recent Harvests) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Farming Tip Card (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-white">Farming Tip of the Day</h2>
              <p className="text-xs text-slate-400 mt-1">Science-backed practice for better yield</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Leaf size={20} />
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {[
              { emoji: '💧', tip: 'Drip irrigation saves up to 60% water vs flood irrigation — ideal for vegetables and fruits.' },
              { emoji: '🌱', tip: 'Rotate legumes like lentils with cereals to naturally fix nitrogen and reduce fertiliser costs.' },
              { emoji: '🍂', tip: 'Apply 5–10 cm of mulch around crops to retain soil moisture and suppress weed growth.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>

          <Link to="/farming-techniques" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold rounded-xl transition-colors">
            Explore All Techniques <ArrowRight size={12} />
          </Link>
        </div>

        {/* Irrigation Tasks Widget (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Upcoming Irrigation</h2>
            <p className="text-xs text-slate-400 mt-1">Water schedules for your farms</p>
          </div>

          <div className="space-y-3 my-4 flex-1 flex flex-col justify-center">
            {upcomingIrrigations.length > 0 ? (
              upcomingIrrigations.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
                    <Droplet size={16} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{task.farmId?.farmName || 'Farm'}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 py-0.5 px-2 rounded-full font-bold">
                      {task.duration}m
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 text-xs py-8 gap-2">
                <Calendar size={20} className="text-slate-600" />
                <span>No upcoming irrigation logs.</span>
              </div>
            )}
          </div>

          <Link to="/irrigation" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold rounded-xl transition-colors">
            Schedule Irrigation
          </Link>
        </div>

        {/* Recent Harvests Widget (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Harvests</h2>
            <p className="text-xs text-slate-400 mt-1">Crops reaped and revenues recorded</p>
          </div>

          <div className="space-y-3 my-4 flex-1 flex flex-col justify-center">
            {recentHarvests.length > 0 ? (
              recentHarvests.map((log) => (
                <div key={log._id} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                    <Sprout size={16} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{log.cropName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.farmId?.farmName || 'Farm'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-emerald-400 block">
                      +₹{(log.totalRevenue || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                      {log.quantity} kg
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 text-xs py-8 gap-2">
                <AlertCircle size={20} className="text-slate-600" />
                <span>No crops harvested yet.</span>
              </div>
            )}
          </div>

          <Link to="/harvests" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold rounded-xl transition-colors">
            Record Harvest
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
