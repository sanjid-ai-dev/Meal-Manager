const STORAGE_KEY = 'siaan_meal_manager_store_v1';
const LEGACY_KEY = 'evilID';

function getDefaultMonthYear() {
  const now = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return {
    month: months[now.getMonth()],
    year: String(now.getFullYear())
  };
}

function getChartKey(month, year) {
  return `${month}_${year}`;
}

function loadStoreFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.charts) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local store', e);
  }

  // Migrate legacy evilID if present
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy && legacy.month && legacy.year) {
        const key = getChartKey(legacy.month, legacy.year);
        return {
          activeKey: key,
          charts: {
            [key]: {
              id: key,
              month: legacy.month,
              year: String(legacy.year),
              managerName: legacy.managerName || 'Manager',
              totalExpense: 0,
              members: [],
              updatedAt: new Date().toISOString()
            }
          }
        };
      }
    }
  } catch (e) {
    console.warn('Failed to migrate legacy store', e);
  }

  return { activeKey: null, charts: {} };
}

function saveStoreToLocal(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}

async function syncStoreWithServer() {
  const localStore = loadStoreFromLocal();
  try {
    const res = await fetch('/api/charts');
    if (res.ok) {
      const serverStore = await res.json();
      const hasServerCharts = serverStore && serverStore.charts && Object.keys(serverStore.charts).length > 0;
      const hasLocalCharts = localStore && localStore.charts && Object.keys(localStore.charts).length > 0;

      if (hasServerCharts && !hasLocalCharts) {
        saveStoreToLocal(serverStore);
        return serverStore;
      } else if (hasLocalCharts) {
        // Merge server and local charts, preferring newer updatedAt
        const mergedCharts = { ...(serverStore.charts || {}), ...localStore.charts };
        const merged = {
          activeKey: localStore.activeKey || serverStore.activeKey || Object.keys(mergedCharts)[0] || null,
          charts: mergedCharts
        };
        saveStoreToLocal(merged);
        await pushStoreToServer(merged);
        return merged;
      }
    }
  } catch (e) {
    // Offline or server unreachable, use localStore
  }
  return localStore;
}

async function pushStoreToServer(store) {
  saveStoreToLocal(store);
  try {
    await fetch('/api/charts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store)
    });
  } catch (e) {
    // Ignore network error, localStorage has it
  }
}
