import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MAX_POINTS_FOR_CHART = 500; // sample if more for smooth rendering

function formatChartDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
}

function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** DD/MM/YYYY for clipboard table */
function formatDateTable(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function WeightDeficitLog({ records, chartData, addOrUpdate, getByDate, remove }) {
  const todayStr = getTodayStr();
  const [date, setDate] = useState(todayStr);
  const [weight, setWeight] = useState('');
  const [deficit, setDeficit] = useState('');
  const [existingDate, setExistingDate] = useState(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef(null);

  // When date changes, load existing record if any
  useEffect(() => {
    const existing = getByDate(date);
    if (existing) {
      setWeight(String(existing.weight));
      setDeficit(String(existing.deficit));
      setExistingDate(date);
    } else {
      setWeight('');
      setDeficit('');
      setExistingDate(null);
    }
  }, [date, getByDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const d = parseFloat(deficit);
    if (!date || isNaN(w) || w < 30 || w > 200) return;
    addOrUpdate(date, w, isNaN(d) ? 0 : d);
    setExistingDate(date);
  };

  const handleDelete = () => {
    if (!existingDate) return;
    if (window.confirm('Delete this day\'s record?')) {
      remove(existingDate);
      setWeight('');
      setDeficit('');
      setDate(todayStr);
      setExistingDate(null);
    }
  };

  // For 1000+ records: sample to keep chart responsive
  const displayData = useMemo(() => {
    if (!chartData.length) return [];
    if (chartData.length <= MAX_POINTS_FOR_CHART) return chartData;
    const step = Math.ceil(chartData.length / MAX_POINTS_FOR_CHART);
    return chartData.filter((_, i) => i % step === 0 || i === chartData.length - 1);
  }, [chartData]);

  const hasData = displayData.length > 0;

  // Table data: newest first
  const tableRows = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  const handleEditRow = (recordDate) => {
    setDate(recordDate);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteRow = (recordDate) => {
    if (window.confirm('Delete this day\'s record?')) remove(recordDate);
  };

  const copyWeightTableToClipboard = async () => {
    if (!chartData.length) return;
    const sorted = [...chartData].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const dateFirst = new Date(first.date + 'T12:00:00');
    const dateLast = new Date(last.date + 'T12:00:00');
    const totalDays = Math.round((dateLast - dateFirst) / (1000 * 60 * 60 * 24)) + 1;
    const oldWeight = first.weight;
    const currentWeight = last.weight;
    const weightLoss = oldWeight - currentWeight;

    const col1 = 'date';
    const col2 = 'weight';
    const maxDateLen = Math.max(col1.length, ...sorted.map((r) => formatDateTable(r.date).length));
    const maxWeightLen = Math.max(col2.length, ...sorted.map((r) => String(r.weight).length));
    const pad = (s, len) => String(s).padEnd(len, ' ');
    let text = `${pad(col1, maxDateLen)}  |  ${pad(col2, maxWeightLen)}\n`;
    text += `${'-'.repeat(maxDateLen)}--+--${'-'.repeat(maxWeightLen)}\n`;
    sorted.forEach((r) => {
      text += `${pad(formatDateTable(r.date), maxDateLen)}  |  ${pad(r.weight, maxWeightLen)}\n`;
    });
    text += `\nTotal days: ${totalDays} (from ${formatDateTable(first.date)} to ${formatDateTable(last.date)})\n`;
    text += `Weight change: ${weightLoss.toFixed(1)} kg in ${totalDays} days (${oldWeight} kg → ${currentWeight} kg)\n`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
        📉 Weight & Deficit Log
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Log weight and daily calorie deficit. Select a date to add or edit. Chart shows weight over time.
      </p>

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Date (today or past)
          </label>
          <input
            type="date"
            value={date}
            max={todayStr}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            min="30"
            max="200"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 85"
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Deficit (kcal)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={deficit}
            onChange={(e) => setDeficit(e.target.value)}
            placeholder="e.g. 500"
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            className="flex-1 min-w-[120px] py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition-colors"
          >
            {existingDate ? 'Update' : 'Save'}
          </button>
          {existingDate && (
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {/* Table: all entries with Edit / Delete */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">All entries</h3>
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-600">
            <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-3 py-3 sm:px-4">Date</th>
                  <th scope="col" className="px-3 py-3 sm:px-4">Weight (kg)</th>
                  <th scope="col" className="px-3 py-3 sm:px-4">Deficit (kcal)</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr
                    key={row.date}
                    className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-3 py-3 sm:px-4 font-medium whitespace-nowrap">
                      {formatChartDate(row.date)}
                    </td>
                    <td className="px-3 py-3 sm:px-4">{row.weight}</td>
                    <td className="px-3 py-3 sm:px-4">{row.deficit}</td>
                    <td className="px-3 py-3 sm:px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleEditRow(row.date)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        aria-label="Edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.date)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-1"
                        aria-label="Delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No entries yet. Use the form above to add one.</p>
        )}
      </div>

      {/* Clipboard + Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Weight over time</h3>
          {hasData && (
            <button
              type="button"
              onClick={copyWeightTableToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
              title="Copy date | weight table and summary"
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy table & summary</span>
                </>
              )}
            </button>
          )}
        </div>
        {hasData ? (
          <div className="w-full h-[280px] sm:h-[320px] min-h-[200px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={displayData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatChartDate}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-slate-500 dark:text-slate-400"
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(255,255,255)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '8px 12px',
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const value = payload[0]?.value;
                    return (
                      <div className="text-sm">
                        <div className="font-semibold text-slate-700">{label ? formatChartDate(label) : ''}</div>
                        <div className="text-blue-600">Weight: {value != null ? `${Number(value)} kg` : '—'}</div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: displayData.length <= 60 ? 3 : 0 }}
                  activeDot={{ r: 5 }}
                  name="Weight"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm">
            No data yet. Add a record above to see your weight trend.
          </div>
        )}
        {chartData.length > MAX_POINTS_FOR_CHART && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Showing {displayData.length} of {chartData.length} points for smooth display.
          </p>
        )}
      </div>
    </div>
  );
}
