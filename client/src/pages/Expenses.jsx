import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { IndianRupee, Plus, Trash2, Edit3, X, Loader, Tag, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

const expenseCategories = ['Seeds', 'Fertilizer', 'Labor', 'Equipment', 'Miscellaneous'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Expenses = () => {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Form states
  const [farmId, setFarmId] = useState('');
  const [category, setCategory] = useState('Seeds');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, farmsRes, analyticsRes] = await Promise.all([
        API.get('/expenses'),
        API.get('/farms'),
        API.get('/expenses/analytics')
      ]);
      setExpenses(expensesRes.data.data);
      setFarms(farmsRes.data.data);
      setAnalytics(analyticsRes.data);
      if (farmsRes.data.data.length > 0) {
        setFarmId(farmsRes.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load expense metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingExpense(null);
    setCategory('Seeds');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setFarmId(exp.farmId._id);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDescription(exp.description || '');
    setDate(new Date(exp.date).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmId || !category || !amount || !date) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      if (editingExpense) {
        await API.put(`/expenses/${editingExpense._id}`, { farmId, category, amount, description, date });
        showToast('Expense updated successfully', 'success');
      } else {
        await API.post('/expenses', { farmId, category, amount, description, date });
        showToast('Expense logged successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Error recording expense details', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense log?')) {
      return;
    }
    try {
      await API.delete(`/expenses/${id}`);
      showToast('Expense record deleted', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete log', 'error');
    }
  };

  const totalExpenses = analytics?.summary?.totalExpenses || 0;
  const totalRevenue = analytics?.summary?.totalRevenue || 0;
  const netProfit = analytics?.summary?.netProfit || 0;

  const categoryData = analytics?.categoryData || [];
  const monthlyData = analytics?.monthlyData || [];

  return (
    <div className="space-y-8">
      {/* Top financial highlights bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Logged Expenses</span>
          <h2 className="text-2xl font-black text-rose-400 mt-1">₹{totalExpenses.toLocaleString()}</h2>
          <span className="text-[10px] text-slate-400 block mt-1">Total operating costs</span>
        </div>
        <div className="border-b md:border-b-0 md:border-r border-slate-800 py-4 md:py-0 md:px-6">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Harvest Revenue</span>
          <h2 className="text-2xl font-black text-emerald-400 mt-1">₹{totalRevenue.toLocaleString()}</h2>
          <span className="text-[10px] text-slate-400 block mt-1">Total crop sales generated</span>
        </div>
        <div className="pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Net Income</span>
            <h2 className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString()}
            </h2>
          </div>
          {farms.length > 0 && (
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md w-full md:w-auto self-start"
            >
              <Plus size={14} /> Log Cost
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Computing financial reports...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-850 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-4">
          <AlertCircle size={32} className="text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Registered Farms</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Please register your farm plot in the "My Farms" section before logging expenses.
          </p>
          <a
            href="/farms"
            className="inline-flex items-center gap-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md mt-2"
          >
            Go to Farms
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue vs Expense Chart */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6">Revenue vs Expenses Comparison</h2>
              <div className="h-72 w-full">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="revenue" name="Harvest Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    Insufficient monthly metrics. Log more values to display comparison bars.
                  </div>
                )}
              </div>
            </div>

            {/* Category breakdown pie */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Expense Category Distribution</h2>
                <p className="text-xs text-slate-400 mt-1">Categorical split of logged cost items</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
                <div className="h-56 w-56 shrink-0 relative flex items-center justify-center">
                  {totalExpenses > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
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
                    <div className="text-slate-500 text-xs">No expenses logged.</div>
                  )}
                  {totalExpenses > 0 && (
                    <div className="absolute flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Costs</span>
                      <span className="text-md font-black text-white">₹{totalExpenses.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full sm:w-auto">
                  {categoryData.filter(d => d.value > 0).map((item, idx) => (
                    <div key={item.name} className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-850">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        {item.name}
                      </div>
                      <span className="text-xs font-bold text-white">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Expenses Table list */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white">Transaction Logs</h2>
            
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Farm plot</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50 text-slate-300">
                    {expenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-850/15 transition-all">
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-xl font-medium">
                            <Tag size={12} className="text-emerald-500" />
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-350">{exp.farmId?.farmName || 'Unknown plot'}</td>
                        <td className="py-3.5 max-w-xs truncate text-slate-400" title={exp.description}>
                          {exp.description || '—'}
                        </td>
                        <td className="py-3.5">
                          {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 font-bold text-rose-400">₹{exp.amount.toLocaleString()}</td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="text-slate-500 hover:text-white p-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No logged financial expenses on record.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingExpense ? 'Modify Expense details' : 'Log Production Cost'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Farm plot
                </label>
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                >
                  {farms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.farmName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  >
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Amount (In INR)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="4500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Description / Remarks
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs resize-none"
                  placeholder="Purchased high-yield urea fertilizer bags."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingExpense ? 'Save Changes' : 'Log Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
