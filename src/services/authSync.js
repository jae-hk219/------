import axios from 'axios';

const KVDB_URL = 'https://kvdb.io/hj_fieldlink_v2_9f8s2j1k/registered_users';

/**
 * Helper to get local registered users
 */
export const getLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('registered_users')) || [];
  } catch (e) {
    console.error('Failed to get local users:', e);
    return [];
  }
};

/**
 * Helper to save local registered users
 */
export const saveLocalUsers = (users) => {
  try {
    localStorage.setItem('registered_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local users:', e);
  }
};

/**
 * Fetch registered users from the remote key-value store
 */
export const fetchRemoteUsers = async () => {
  try {
    const response = await axios.get(KVDB_URL, { timeout: 4000 });
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    // If the key is not initialized yet (404), return empty array
    if (error.response && error.response.status === 404) {
      return [];
    }
    console.warn('Failed to fetch remote users, using fallback:', error.message);
    throw error; // Re-throw to let the caller know it failed
  }
};

/**
 * Save registered users to the remote key-value store
 */
export const saveRemoteUsers = async (users) => {
  try {
    await axios.put(KVDB_URL, users, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 4000
    });
  } catch (error) {
    console.error('Failed to save remote users:', error.message);
    throw error;
  }
};

/**
 * Synchronize remote and local users bidirectionally.
 * Merges local and remote users using 'id' as unique key.
 * If a user exists in both, keeps the one with the more recent 'updatedAt' timestamp.
 */
export const syncUsers = async () => {
  const localUsers = getLocalUsers();
  try {
    const remoteUsers = await fetchRemoteUsers();

    // Map by ID for quick lookup and merging
    const mergedMap = new Map();

    // Load local users first
    localUsers.forEach(user => {
      mergedMap.set(user.id, { updatedAt: 0, ...user });
    });

    // Merge remote users, keeping the latest one based on updatedAt
    remoteUsers.forEach(remoteUser => {
      const existing = mergedMap.get(remoteUser.id);
      const remoteWithTime = { updatedAt: 0, ...remoteUser };
      
      if (!existing || remoteWithTime.updatedAt > (existing.updatedAt || 0)) {
        mergedMap.set(remoteUser.id, remoteWithTime);
      }
    });

    const mergedUsers = Array.from(mergedMap.values());
    
    // Save the merged list locally and remotely
    saveLocalUsers(mergedUsers);
    try {
      await saveRemoteUsers(mergedUsers);
    } catch (e) {
      console.warn('Sync warning: Could not write merged users back to remote:', e.message);
    }
    return mergedUsers;
  } catch (error) {
    console.warn('Sync failed: Using local database only.', error.message);
    return localUsers;
  }
};

/**
 * Register a new user: checks duplicate locally & remotely, then saves to both.
 */
export const registerRemoteUser = async (newUser) => {
  // Add updatedAt timestamp
  const userWithTimestamp = {
    ...newUser,
    updatedAt: Date.now()
  };

  // Sync first to get the latest database
  let users = [];
  try {
    users = await syncUsers();
  } catch (e) {
    users = getLocalUsers();
  }

  // Check duplication
  if (users.some(u => u.id === userWithTimestamp.id)) {
    throw new Error('이미 사용 중인 아이디입니다.');
  }

  users.push(userWithTimestamp);
  
  // Save local and remote
  saveLocalUsers(users);
  try {
    await saveRemoteUsers(users);
  } catch (e) {
    console.warn('Failed to register user to cloud, stored locally:', e.message);
  }
  return users;
};

/**
 * Update user details (e.g. password, nickname, specialty, profileImage)
 */
export const updateRemoteUser = async (userId, updatedData) => {
  let users = [];
  try {
    users = await syncUsers();
  } catch (e) {
    users = getLocalUsers();
  }

  const updatedUsers = users.map(u => {
    if (u.id === userId) {
      return {
        ...u,
        ...updatedData,
        updatedAt: Date.now() // Set new timestamp
      };
    }
    return u;
  });

  saveLocalUsers(updatedUsers);
  try {
    await saveRemoteUsers(updatedUsers);
  } catch (e) {
    console.warn('Failed to update user details in cloud, saved locally:', e.message);
  }
  return updatedUsers;
};

/**
 * Delete a user account
 */
export const deleteRemoteUser = async (userId) => {
  let users = [];
  try {
    users = await syncUsers();
  } catch (e) {
    users = getLocalUsers();
  }

  const updatedUsers = users.filter(u => u.id !== userId);

  saveLocalUsers(updatedUsers);
  try {
    await saveRemoteUsers(updatedUsers);
  } catch (e) {
    console.warn('Failed to delete user in cloud, deleted locally:', e.message);
  }
  return updatedUsers;
};
