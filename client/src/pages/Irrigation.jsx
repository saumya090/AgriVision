import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Calendar, Droplet, Plus, Trash2, Edit3, X, Loader, AlertCircle } from 'lucide-react';

const Irrigation = () => {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Form states
  const [farmId, setFarmId] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [waterUsed, setWaterUsed] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, farmsRes] = await Promise.all([
        API.get('/irrigation'),
        API.get('/farms')
      ]);
      setRecords(recordsRes.data.data);
      setFarms(farmsRes.data.data);
      if (farmsRes.data.data.length > 0) {
        setFarmId(farmsRes.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch irrigation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRecord(null);
    setDate('');
    setDuration('');
    setWaterUsed('');
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setFarmId(rec.farmId._id);
    // Format date string for datetime-local input (YYYY-MM-DDThh:mm)
    const formattedDate = new Date(rec.date).toISOString().slice(0, 16);
    setDate(formattedDate);
    setDuration(rec.duration);
    setWaterUsed(rec.waterUsed);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmId || !date || !duration || !waterUsed) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      if (editingRecord) {
        await API.put(`/irrigation/${editingRecord._id}`, { farmId, date, duration, waterUsed });
        showToast('Irrigation record updated successfully', 'success');
      } else {
        await API.post('/irrigation', { farmId, date, duration, waterUsed });
        showToast('Irrigation scheduled successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Error saving irrigation schedule', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this irrigation record?')) {
      return;
    }
    try {
      await API.delete(`/irrigation/${id}`);
      showToast('Irrigation log removed', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete log', 'error');
    }
  };

  // Split into upcoming and past logs
  const upcomingLogs = records.filter(r => new Date(r.date) >= new Date());
  const pastLogs = records.filter(r => new Date(r.date) < new Date());

  // Aggregate total water used
  const totalWaterUsed = records.reduce((acc, curr) => acc + (curr.waterUsed || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header and stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl hidden sm:block">
            <Droplet size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Irrigation Scheduler
            </h1>
            <p className="text-sm text-slate-400 mt-1">Schedule water releases and log water consumption logs.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider block">Total Consumption</span>
            <span className="text-sm font-extrabold text-sky-400">{totalWaterUsed.toLocaleString()} Liters</span>
          </div>

          {farms.length > 0 && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md ml-auto md:ml-0"
            >
              <Plus size={16} />
              Schedule Irrigation
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader className="w-10 h-10 text-sky-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Fetching schedules...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-850 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-4">
          <AlertCircle size={32} className="text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Registered Farms</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Please register your farm plot in the "My Farms" section before creating an irrigation schedule.
          </p>
          <a
            href="/farms"
            className="inline-flex items-center gap-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md mt-2"
          >
            Go to Farms
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Upcoming schedule calendar list */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" />
              Upcoming Schedules
            </h2>

            {upcomingLogs.length > 0 ? (
              <div className="space-y-4">
                {upcomingLogs.map((log) => (
                  <div
                    key={log._id}
                    className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between group hover:border-slate-750 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
                        <Droplet size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">
                          {log.farmId?.farmName || 'Unknown Farm'}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                          {new Date(log.date).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block tracking-wider font-bold">Metrics</span>
                        <span className="text-xs font-semibold text-sky-400 mt-0.5 block">
                          {log.duration} min • {log.waterUsed} L
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(log)}
                          className="p-2 text-slate-500 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No future irrigation schedules programmed. Click schedule above to add.
              </div>
            )}
          </div>

          {/* Column 2: Historical Irrigation Logs */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-slate-350 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              Past Logs (Completed Tasks)
            </h2>

            {pastLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Farm</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Duration</th>
                      <th className="pb-3">Water Used</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50 text-slate-300">
                    {pastLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-850/15">
                        <td className="py-3 font-semibold text-slate-300">{log.farmId?.farmName || 'Farm'}</td>
                        <td className="py-3">
                          {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3">{log.duration} mins</td>
                        <td className="py-3 font-semibold text-sky-400">{log.waterUsed} Liters</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDelete(log._id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
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
              <div className="text-center py-8 text-slate-650 text-xs">
                No past irrigation events logged.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduler Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingRecord ? 'Modify Irrigation Log' : 'Schedule Irrigation release'}
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
                  Select Target Farm plot
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="30"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Water Volume (Liters)
                  </label>
                  <input
                    type="number"
                    value={waterUsed}
                    onChange={(e) => setWaterUsed(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="2500"
                    required
                  />
                </div>
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
                  {editingRecord ? 'Save Changes' : 'Schedule Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Irrigation;
