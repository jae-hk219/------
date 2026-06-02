const FIREBASE_DB_URL = 'https://engineering-ai-ba3e2-default-rtdb.firebaseio.com';

/**
 * Helper to get local custom posts (cached)
 */
export const getLocalPosts = () => {
  try {
    return JSON.parse(localStorage.getItem('custom_posts')) || [];
  } catch (e) {
    console.error('Failed to get local posts:', e);
    return [];
  }
};

/**
 * Helper to save local custom posts
 */
export const saveLocalPosts = (posts) => {
  try {
    localStorage.setItem('custom_posts', JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save local posts:', e);
  }
};

/**
 * Fetch all posts from Firebase
 */
export const fetchRemotePosts = async () => {
  const endpoint = `${FIREBASE_DB_URL}/community_posts.json`;
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
    
    return Array.isArray(data) ? data : Object.values(data);
  } catch (error) {
    console.warn('Failed to fetch remote community posts:', error.message);
    throw error;
  }
};

/**
 * Save all posts to Firebase
 */
export const saveRemotePosts = async (posts) => {
  const endpoint = `${FIREBASE_DB_URL}/community_posts.json`;
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posts),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`Firebase responded with ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to save remote community posts:', error.message);
    throw error;
  }
};

/**
 * Sync posts bidirectionally between local and remote
 */
export const syncPosts = async () => {
  const localPosts = getLocalPosts();
  try {
    const remotePosts = await fetchRemotePosts();
    const mergedMap = new Map();

    // 1. Process local posts
    localPosts.forEach(post => {
      if (!post || !post.id) return;
      const parsedTime = post.updatedAt ? new Date(post.updatedAt).getTime() : new Date(post.createdAt || post.id).getTime();
      mergedMap.set(post.id, {
        updatedAt: post.createdAt || new Date().toISOString(),
        ...post,
        _parsedTime: isNaN(parsedTime) ? 0 : parsedTime
      });
    });

    // 2. Merge remote posts
    remotePosts.forEach(remotePost => {
      if (!remotePost || !remotePost.id) return;
      const remoteParsedTime = remotePost.updatedAt ? new Date(remotePost.updatedAt).getTime() : new Date(remotePost.createdAt || remotePost.id).getTime();
      const existing = mergedMap.get(remotePost.id);
      
      const remoteWithTime = {
        updatedAt: remotePost.createdAt || new Date().toISOString(),
        ...remotePost,
        _parsedTime: isNaN(remoteParsedTime) ? 0 : remoteParsedTime
      };

      if (!existing || remoteWithTime._parsedTime > existing._parsedTime) {
        mergedMap.set(remotePost.id, remoteWithTime);
      }
    });

    // 3. Clean up and sort descending
    const mergedList = Array.from(mergedMap.values()).map(post => {
      const { _parsedTime, ...cleanPost } = post;
      return cleanPost;
    });

    mergedList.sort((a, b) => new Date(b.createdAt || b.id).getTime() - new Date(a.createdAt || a.id).getTime());

    // 4. Save cache and back up
    saveLocalPosts(mergedList);
    try {
      await saveRemotePosts(mergedList);
    } catch (e) {
      console.warn('Sync warning: merged posts could not be synced to remote server:', e.message);
    }

    return mergedList;
  } catch (error) {
    console.warn('Post sync failed, returning local cached posts:', error.message);
    return localPosts;
  }
};

/**
 * Helper to get local comments (cached)
 */
export const getLocalComments = (postId) => {
  try {
    const key = `post_comments_${postId}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    console.error(`Failed to get local comments for post ${postId}:`, e);
    return [];
  }
};

/**
 * Helper to save local comments
 */
export const saveLocalComments = (postId, comments) => {
  try {
    const key = `post_comments_${postId}`;
    localStorage.setItem(key, JSON.stringify(comments));
  } catch (e) {
    console.error(`Failed to save local comments for post ${postId}:`, e);
  }
};

/**
 * Fetch comments for a specific post from Firebase
 */
export const fetchRemoteComments = async (postId) => {
  if (!postId) return [];
  const endpoint = `${FIREBASE_DB_URL}/post_comments/${postId}.json`;
  
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
    
    return Array.isArray(data) ? data : Object.values(data);
  } catch (error) {
    console.warn(`Failed to fetch remote comments for post ${postId}:`, error.message);
    throw error;
  }
};

/**
 * Save comments for a specific post to Firebase
 */
export const saveRemoteComments = async (postId, comments) => {
  if (!postId) return;
  const endpoint = `${FIREBASE_DB_URL}/post_comments/${postId}.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comments),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`Firebase responded with ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to save remote comments for post ${postId}:`, error.message);
    throw error;
  }
};

/**
 * Sync comments for a post bidirectionally
 */
export const syncComments = async (postId) => {
  if (!postId) return [];
  const localComments = getLocalComments(postId);
  
  try {
    const remoteComments = await fetchRemoteComments(postId);
    const mergedMap = new Map();

    // 1. Process local comments
    localComments.forEach(comm => {
      if (!comm || !comm.id) return;
      mergedMap.set(comm.id, comm);
    });

    // 2. Merge remote comments
    remoteComments.forEach(remoteComm => {
      if (!remoteComm || !remoteComm.id) return;
      mergedMap.set(remoteComm.id, remoteComm);
    });

    // 3. Sort ascending (first comment first)
    const mergedList = Array.from(mergedMap.values());
    mergedList.sort((a, b) => a.id - b.id);

    // 4. Cache and save remote
    saveLocalComments(postId, mergedList);
    try {
      await saveRemoteComments(postId, mergedList);
    } catch (e) {
      console.warn(`Sync warning: merged comments for ${postId} could not be synced to remote server:`, e.message);
    }

    return mergedList;
  } catch (error) {
    console.warn(`Comment sync failed for ${postId}, using local comments:`, error.message);
    return localComments;
  }
};
