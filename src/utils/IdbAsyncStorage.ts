import { get, set, del } from 'idb-keyval';

// Note: the interface definition is copied from the react-query source code '/src/createAsyncStoragePersistor-experimental/index.ts'
interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const IdbAsyncStorage = (): AsyncStorage => {
  return {
    getItem: async (key: string) => {
      return get(key) as Promise<string | null>;
    },

    setItem: async (key: string, value: string) => {
      await set(key, value);
    },

    removeItem: async (key: string) => {
      await del(key);
    },
  };
};

export default IdbAsyncStorage;
