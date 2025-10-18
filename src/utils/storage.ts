import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wrapper to provide localStorage-like API
 * This helps migrate from web localStorage to React Native AsyncStorage
 */
export const storage = {
  /**
   * Get item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys from storage:', error);
      return [];
    }
  }
};

/**
 * Legacy localStorage compatibility layer
 * This provides the same API as localStorage but uses AsyncStorage
 */
export const localStorage = {
  getItem: (key: string): string | null => {
    // This is a synchronous wrapper - in practice, you should use storage.getItem
    console.warn('Using synchronous localStorage.getItem - consider using storage.getItem instead');
    return null;
  },

  setItem: (key: string, value: string): void => {
    console.warn('Using synchronous localStorage.setItem - consider using storage.setItem instead');
    storage.setItem(key, value);
  },

  removeItem: (key: string): void => {
    console.warn('Using synchronous localStorage.removeItem - consider using storage.removeItem instead');
    storage.removeItem(key);
  },

  clear: (): void => {
    console.warn('Using synchronous localStorage.clear - consider using storage.clear instead');
    storage.clear();
  }
};

