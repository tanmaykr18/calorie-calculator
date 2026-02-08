import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'weight-deficit-log';

/**
 * Each record: { date: 'YYYY-MM-DD', weight: number, deficit: number }
 */
export function useWeightDeficitLog() {
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Could not save weight-deficit log', e);
    }
  }, [records]);

  const addOrUpdate = useCallback((date, weight, deficit) => {
    const weightNum = Number(weight);
    const deficitNum = Number(deficit);
    if (!date || isNaN(weightNum) || isNaN(deficitNum)) return;
    setRecords((prev) => {
      const rest = prev.filter((r) => r.date !== date);
      return [...rest, { date, weight: weightNum, deficit: deficitNum }].sort(
        (a, b) => a.date.localeCompare(b.date)
      );
    });
  }, []);

  const getByDate = useCallback(
    (date) => records.find((r) => r.date === date) || null,
    [records]
  );

  const remove = useCallback((date) => {
    setRecords((prev) => prev.filter((r) => r.date !== date));
  }, []);

  const chartData = records
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: r.date, weight: r.weight, deficit: r.deficit }));

  return { records, chartData, addOrUpdate, getByDate, remove };
}
