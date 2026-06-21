import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sprout, Calendar, Loader, Plus, Archive, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, Play } from 'lucide-react';

const Crops = () => {
  const { showToast } = useToast();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [farmId, setFarmId] = useState('');
  const [cropName, setCropName] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [status, setStatus] = useState('Active');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsRes, farmsRes] = await Promise.all([
        API.get('/crops'),
        API.get('/farms')
      ]);
      setCrops(cropsRes.data.data);
      setFarms(farmsRes.data.data);
      if (farmsRes.data.data.length > 0) {
        setFarmId(farmsRes.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch crops data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmId || !cropName || !sowingDate) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await API.post('/crops', { farmId, cropName, sowingDate, status });
      showToast('Crop sown schedule successfully logged', 'success');
      setIsModalOpen(false);
      // Reset form
      setCropName('');
      setSowingDate('');
      setStatus('Active');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error scheduling crop', 'error');
    }
  };

  const handleUpdateStatus = async (cropId, newStatus) => {
    try {
      await API.put(`/crops/${cropId}`, { status: newStatus });
      showToast(`Crop status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating crop status', 'error');
    }
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop record?')) {
      return;
    }
    try {
      await API.delete(`/crops/${cropId}`);
      showToast('Crop record deleted', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete crop record', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Archive className="text-emerald-500" />
            Crop Lifecycle Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1">Sow new varieties, update status, and manage harvest transitions.</p>
        </div>
        {farms.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
          >
            <Plus size={16} />
            Sow New Crop
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Fetching crop schedules...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-850 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-4">
          <AlertTriangle size={32} className="text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Register a Farm plot first</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            You must register at least one farm plot under the "My Farms" section before sowing or scheduling crops.
          </p>
          <a
            href="/farms"
            className="inline-flex items-center gap-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md mt-2"
          >
            Go to Farms <ArrowRight size={14} />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Active and Planned crops (Main Focus) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-lg p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Current & Planned Cycles
            </h2>
            
            {crops.filter(c => c.status !== 'Harvested').length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-4 font-bold">Crop Details</th>
                      <th className="pb-4 font-bold">Farm Plot</th>
                      <th className="pb-4 font-bold">Sowing Date</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {crops.filter(c => c.status !== 'Harvested').map((crop) => (
                      <tr key={crop._id} className="group hover:bg-slate-850/30 transition-colors">
                        <td className="py-4 font-semibold text-white text-sm">{crop.cropName}</td>
                        <td className="py-4 text-slate-300 font-medium">{crop.farmId?.farmName || 'Unknown Farm'}</td>
                        <td className="py-4 font-medium">
                          {new Date(crop.sowingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold border ${
                            crop.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${crop.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                            {crop.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {crop.status === 'Planned' && (
                            <button
                              onClick={() => handleUpdateStatus(crop._id, 'Active')}
                              className="px-3 py-1.5 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 rounded-lg font-semibold inline-flex items-center gap-1 transition-all"
                            >
                              <Play size={12} /> Mark Active
                            </button>
                          )}
                          {crop.status === 'Active' && (
                            <span className="text-slate-500 text-[11px] font-medium">
                              Go to <a href="/harvests" className="text-emerald-400 hover:underline">Harvest Logs</a> to record harvest.
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(crop._id)}
                            className="px-2 py-1.5 text-slate-500 hover:text-rose-400 transition-colors"
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
                No active or planned crop schedules at the moment. Sown new crops to populate.
              </div>
            )}
          </div>

          {/* Harvested Crops (History log) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-slate-500" />
              Sowing History (Harvested Cycles)
            </h2>

            {crops.filter(c => c.status === 'Harvested').length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-4">Crop</th>
                      <th className="pb-4">Farm</th>
                      <th className="pb-4">Sown Date</th>
                      <th className="pb-4">Harvest Date</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-400">
                    {crops.filter(c => c.status === 'Harvested').map((crop) => (
                      <tr key={crop._id} className="hover:bg-slate-850/10">
                        <td className="py-4 font-semibold text-slate-300">{crop.cropName}</td>
                        <td className="py-4">{crop.farmId?.farmName || 'Unknown Farm'}</td>
                        <td className="py-4">{new Date(crop.sowingDate).toLocaleDateString()}</td>
                        <td className="py-4">
                          {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 py-0.5 px-2 bg-slate-850 text-slate-500 border border-slate-800 rounded-full text-[10px] font-bold">
                            {crop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-650 text-xs">
                No past harvested cycles on record.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sowing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Sow New Crop Cycle</h2>
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
                      {f.farmName} ({f.area} Acres)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Crop Name
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  placeholder="Wheat, Rice, Cotton..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sowing Date
                </label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Initial Cycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                >
                  <option value="Active">Active (Sown and Growing)</option>
                  <option value="Planned">Planned (Scheduled/Future Cycle)</option>
                </select>
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
                  Log Sowing Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crops;
