const FIREBASE_DB_URL = 'https://engineering-ai-ba3e2-default-rtdb.firebaseio.com';

/**
 * Get local storage records for a specific user ID.
 * Falls back to 'guest' if no user ID is provided.
 */
export const getLocalRecords = (userId = 'guest') => {
  try {
    const key = `calculation_records_${userId}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    console.error(`Failed to get local records for ${userId}:`, e);
    return [];
  }
};

/**
 * Save records locally for a specific user ID.
 */
export const saveLocalRecords = (userId = 'guest', records) => {
  try {
    const key = `calculation_records_${userId}`;
    localStorage.setItem(key, JSON.stringify(records));
  } catch (e) {
    console.error(`Failed to save local records for ${userId}:`, e);
  }
};

/**
 * Fetch calculation records from Firebase for a specific user ID.
 */
export const fetchRemoteRecords = async (userId) => {
  if (!userId || userId === 'guest') return [];
  const endpoint = `${FIREBASE_DB_URL}/records/${userId}.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`Firebase responded with ${response.status}`);
    }
    
    const data = await response.json();
    if (!data) return [];
    
    // Return records list
    return Array.isArray(data) ? data : Object.values(data);
  } catch (error) {
    console.warn(`Failed to fetch remote records for user ${userId}:`, error.message);
    throw error;
  }
};

/**
 * Push calculation records to Firebase for a specific user ID.
 */
export const saveRemoteRecords = async (userId, records) => {
  if (!userId || userId === 'guest') return;
  const endpoint = `${FIREBASE_DB_URL}/records/${userId}.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`Firebase responded with ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to save remote records for user ${userId}:`, error.message);
    throw error;
  }
};

/**
 * Synchronize local and remote calculation records bidirectionally.
 * Merges them by unique 'id', keeping whichever has a newer 'updatedAt' time.
 * Sorts them chronologically descending (newest first).
 */
export const syncRecords = async (userId) => {
  if (!userId || userId === 'guest') {
    return getLocalRecords('guest');
  }

  const localRecords = getLocalRecords(userId);
  try {
    const remoteRecords = await fetchRemoteRecords(userId);
    const mergedMap = new Map();

    // 1. Process local records
    localRecords.forEach(rec => {
      const parsedTime = rec.updatedAt ? new Date(rec.updatedAt).getTime() : new Date(rec.timestamp).getTime();
      mergedMap.set(rec.id, { 
        updatedAt: rec.timestamp, // fallback
        ...rec, 
        _parsedTime: isNaN(parsedTime) ? 0 : parsedTime 
      });
    });

    // 2. Merge remote records
    remoteRecords.forEach(remoteRec => {
      if (!remoteRec || !remoteRec.id) return;
      const remoteParsedTime = remoteRec.updatedAt ? new Date(remoteRec.updatedAt).getTime() : new Date(remoteRec.timestamp).getTime();
      const existing = mergedMap.get(remoteRec.id);
      
      const remoteWithTime = {
        updatedAt: remoteRec.timestamp, // fallback
        ...remoteRec,
        _parsedTime: isNaN(remoteParsedTime) ? 0 : remoteParsedTime
      };

      if (!existing || remoteWithTime._parsedTime > existing._parsedTime) {
        mergedMap.set(remoteRec.id, remoteWithTime);
      }
    });

    // 3. Clean up parsing aids and sort newest first
    const mergedList = Array.from(mergedMap.values()).map(rec => {
      const { _parsedTime, ...cleanRec } = rec;
      return cleanRec;
    });

    mergedList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 4. Save cache locally and backup to cloud
    saveLocalRecords(userId, mergedList);
    try {
      await saveRemoteRecords(userId, mergedList);
    } catch (e) {
      console.warn('Sync warning: merged calculation records could not be synced to remote server:', e.message);
    }

    return mergedList;
  } catch (error) {
    console.warn(`Sync failed for records of ${userId}, using local cached database:`, error.message);
    return localRecords;
  }
};

/**
 * Migrates old legacy global calculation_records to user-specific local and remote storage.
 */
export const migrateLegacyRecords = async (userId) => {
  if (!userId || userId === 'guest') return false;
  
  try {
    const legacyRecordsStr = localStorage.getItem('calculation_records');
    if (!legacyRecordsStr) return false;

    const legacyRecords = JSON.parse(legacyRecordsStr);
    if (!Array.isArray(legacyRecords) || legacyRecords.length === 0) {
      localStorage.removeItem('calculation_records'); // cleanup empty records
      return false;
    }

    console.log(`Starting migration of ${legacyRecords.length} records to user: ${userId}`);
    const localUserRecords = getLocalRecords(userId);
    const existingIds = new Set(localUserRecords.map(r => r.id));

    // Append legacy records if their ID doesn't already exist
    const migratedTime = new Date().toISOString();
    const recordsToAppend = legacyRecords.map(rec => ({
      ...rec,
      updatedAt: rec.updatedAt || migratedTime // mark migration update
    })).filter(rec => !existingIds.has(rec.id));

    const updatedUserRecords = [...recordsToAppend, ...localUserRecords];
    updatedUserRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Save locally
    saveLocalRecords(userId, updatedUserRecords);

    // Remove legacy item to prevent multiple migrations
    localStorage.removeItem('calculation_records');

    // Sync to Firebase
    try {
      await saveRemoteRecords(userId, updatedUserRecords);
    } catch (e) {
      console.warn('Migration cloud backup deferred:', e.message);
    }

    return true;
  } catch (e) {
    console.error('Migration failed:', e);
    return false;
  }
};
