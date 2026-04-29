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
          moodHistory: []
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        resolve({ id: newUser.id, name: newUser.name, email: newUser.email });
      } catch (err) {
        reject(new Error('Failed to register user.'));
      }
    }, 500); // Simulate network delay
  });
};

export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const sessionUser = { id: user.id, name: user.name, email: user.email };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
          resolve(sessionUser);
        } else {
          reject(new Error('Invalid email or password.'));
        }
      } catch (err) {
        reject(new Error('Failed to login.'));
      }
    }, 500); // Simulate network delay
  });
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};
