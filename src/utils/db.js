/**
 * db.js
 * A mock database utility using localStorage to handle user authentication and data.
 * This simulates a real backend without needing a node server, so it works perfectly in the browser.
 */

const USERS_KEY = 'caregiver_users';
const CURRENT_USER_KEY = 'caregiver_current_user';

// Initialize the database if it doesn't exist
const initDB = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
};

initDB();

export const registerUser = async (name, email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        
        // Check if user exists
        if (users.find(u => u.email === email)) {
          reject(new Error('User with this email already exists.'));
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password, // In a real app, hash this!
          createdAt: new Date().toISOString(),
          moodHistory: [],
          chatHistory: [],
          onboardingCompleted: false,
          preferences: {
            language: 'en',
            caringFor: '',
            hobbies: [],
            emergencyContacts: []
          }
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        resolve(newUser);
      } catch (err) {
        reject(new Error('Failed to register user.'));
      }
    }, 500);
  });
};

export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid email or password.'));
        }
      } catch (err) {
        reject(new Error('Failed to login.'));
      }
    }, 500);
  });
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Update user profile (used for onboarding)
export const updateUserProfile = async (userId, updates) => {
  return new Promise((resolve, reject) => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY));
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Update session if it's the current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        }
        resolve(users[userIndex]);
      } else {
        reject(new Error('User not found.'));
      }
    } catch (err) {
      reject(new Error('Failed to update profile.'));
    }
  });
};

// Add mood entry for graph
export const addMoodEntry = async (userId, moodValue) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const entry = {
      date: new Date().toISOString(),
      mood: moodValue // 1 to 5 scale
    };
    if (!users[userIndex].moodHistory) users[userIndex].moodHistory = [];
    users[userIndex].moodHistory.push(entry);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }
  }
};

// Save chat session
export const saveChatSession = async (userId, messages) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      messages
    };
    if (!users[userIndex].chatHistory) users[userIndex].chatHistory = [];
    users[userIndex].chatHistory.push(session);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }
  }
};

