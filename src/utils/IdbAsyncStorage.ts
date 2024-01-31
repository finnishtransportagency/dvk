import { type AsyncStorage, type PersistedQuery } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';

const IdbAsyncStorage = (): AsyncStorage<PersistedQuery> => {
  return {
    getItem: async (key: string) => {
      return get(key);
    },

    setItem: async (key: string, value: PersistedQuery) => {
      set(key, value);
    },

    removeItem: async (key: string) => {
      del(key);
    },
  };
};

export default IdbAsyncStorage;
