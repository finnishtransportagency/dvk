import { Storage as IonicStorage } from '@ionic/storage';

// Note: the interface definition is copied from the react-query source code '/src/createAsyncStoragePersistor-experimental/index.ts'
interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const IonicAsyncStorage = (storage: IonicStorage): AsyncStorage => {
  return {
    getItem: async (key: string) => {
      return storage.get(key) as Promise<string>;
    },

    setItem: async (key: string, value: string) => {
      await storage.set(key, value);
    },

    removeItem: async (key: string) => {
      await storage.remove(key);
    },
  };
};

export default IonicAsyncStorage;
