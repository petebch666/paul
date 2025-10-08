// Simple script to clear localStorage database
const { JSDOM } = require('jsdom');

// Create a mock DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Mock localStorage
const localStorageMock = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
    console.log('✅ Database cleared successfully!');
  }
};

global.localStorage = localStorageMock;

// Clear the database
console.log('🔄 Clearing database...');
localStorage.clear();
console.log('✨ Database reset complete! Please restart the dev server.');

