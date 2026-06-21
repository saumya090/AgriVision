import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { FileText, Plus, Trash2, X, Loader, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';

const Harvest = () => {
  const { showToast } = useToast();
  const [harvests, setHarvests] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [farmId, setFarmId] = useState('');
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [date, setDate] = useState('');
  const [markAsHarvested, setMarkAsHarvested] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [harvestsRes, farmsRes, cropsRes] = await Promise.all([
        API.get('/harvests'),
        API.get('/farms'),
        API.get('/crops')
      ]);
      setHarvests(harvestsRes.data.data);
      setFarms(farmsRes.data.data);
      setCrops(cropsRes.data.data);
      if (farmsRes.data.data.length > 0) {
        setFarmId(farmsRes.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch harvest history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update crop options based on selected farm
  const activeCrops = crops.filter(c => c.farmId?._id === farmId && c.status === 'Active');

  useEffect(() => {
    if (activeCrops.length > 0) {
      setCropName(activeCrops[0].cropName);
    } else {
      setCropName('');
    }
  }, [farmId, crops]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmId || !cropName || !quantity || !sellingPrice) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      await API.post('/harvests', {
        farmId,
        cropName,
        quantity,
        sellingPrice,
        date: date || new Date().toISOString(),
        markAsHarvested
      });
      showToast('Harvest and revenue registered successfully', 'success');
      setIsModalOpen(false);
      // Reset form
      setQuantity('');
      setSellingPrice('');
      setDate('');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Error registering harvest', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this harvest record?')) {
      return;
    }
    try {
      await API.delete(`/harvests/${id}`);
      showToast('Harvest record deleted', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete record', 'error');
    }
  };

  const totalHarvestRevenue = harvests.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
  const totalHarvestQty = harvests.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header and stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl hidden sm:block">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Harvest Registry
            </h1>
            <p className="text-sm text-slate-400 mt-1">Record agricultural yields and automatically calculate crop revenues.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider block">Total Yield Sold</span>
            <span className="text-sm font-extrabold text-emerald-400">{totalHarvestQty.toLocaleString()} kg</span>
          </div>

          <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider block">Total Sales</span>
            <span className="text-sm font-extrabold text-emerald-400">₹{totalHarvestRevenue.toLocaleString()}</span>
          </div>

          {farms.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md ml-auto md:ml-0"
            >
              <Plus size={16} />
              Record Harvest
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading harvest journals...</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-850 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-4">
          <AlertTriangle size={32} className="text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Registered Farms</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Please register your farm plot in the "My Farms" section before logging crop harvests.
          </p>
          <a
            href="/farms"
            className="inline-flex items-center gap-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md mt-2"
          >
            Go to Farms
          </a>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-6">
          <h2 className="text-lg font-bold text-white">Harvest & Sales History</h2>

          {harvests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Crop Variety</th>
                    <th className="pb-3">Farm plot</th>
                    <th className="pb-3">Yield Quantity</th>
                    <th className="pb-3">Selling Price</th>
                    <th className="pb-3">Total Revenue</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50 text-slate-300">
                  {harvests.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-850/15 transition-all">
                      <td className="py-4 font-bold text-white text-sm">{log.cropName}</td>
                      <td className="py-4 font-semibold text-slate-350">{log.farmId?.farmName || 'Unknown Farm'}</td>
                      <td className="py-4 font-medium">{log.quantity} kg</td>
                      <td className="py-4 text-slate-450">₹{log.sellingPrice} / kg</td>
                      <td className="py-4 font-black text-emerald-400">
                        ₹{(log.totalRevenue || log.quantity * log.sellingPrice).toLocaleString()}
                      </td>
                      <td className="py-4">
                        {new Date(log.date || log.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="text-slate-500 hover:text-rose-450 p-1"
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
              No crop harvests recorded yet. Click "Record Harvest" to register yields.
            </div>
          )}
        </div>
      )}

      {/* Record Harvest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Record Crop Harvest</h2>
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
                  Select Sourced Farm plot
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
                  Crop Name
                </label>
                {activeCrops.length > 0 ? (
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  >
                    {activeCrops.map((c) => (
                      <option key={c._id} value={c.cropName}>
                        {c.cropName} (Active)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="Enter crop name manually..."
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quantity Sourced (kg)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="1200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Selling Price (Per kg)
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="35"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Harvest Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                />
              </div>

              {quantity && sellingPrice && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Estimated Revenue:</span>
                  <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                    <TrendingUp size={16} />
                    ₹{(quantity * sellingPrice).toLocaleString()}
                  </span>
                </div>
              )}

              {activeCrops.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="markAsHarvested"
                    checked={markAsHarvested}
                    onChange={(e) => setMarkAsHarvested(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4"
                  />
                  <label htmlFor="markAsHarvested" className="text-xs text-slate-350 cursor-pointer select-none">
                    Automatically mark corresponding crop cycle as <span className="font-semibold text-emerald-400">Harvested</span>
                  </label>
                </div>
              )}

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
                  Log Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Harvest;
