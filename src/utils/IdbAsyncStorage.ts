import { type AsyncStorage, type PersistedQuery } from '@tanstack/react-query-persist-client';
import { getMany, setMany, delMany } from 'idb-keyval';

const GET_BATCH_TIMOUT = 50;
const GET_BATCH_MAX_ITEMS = 100;
const SET_BATCH_TIMOUT = 50;
const SET_BATCH_MAX_ITEMS = 100;
const REMOVE_BATCH_TIMOUT = 50;
const REMOVE_BATCH_MAX_ITEMS = 100;

class GetRequest {
  key: string;
  promiseResolve: (value: PersistedQuery | null | undefined) => void = (value) => {
    return value;
  };
  promiseReject: (value: PersistedQuery | null | undefined) => void = (value) => {
    return value;
  };
  promise: Promise<PersistedQuery | null | undefined>;
  constructor(key: string) {
    this.key = key;
    this.promise = new Promise<PersistedQuery | null | undefined>((resolve, reject) => {
      this.promiseResolve = resolve;
      this.promiseReject = reject;
    });
  }
}

class GetOperation {
  items: Array<GetRequest> = [];
  constructor(items: Array<GetRequest>) {
    this.items = items;
  }
  execute() {
    const keys = this.items.map((item) => item.key);
    getMany(keys).then((results) => {
      this.items.forEach((item, i) => {
        item.promiseResolve(results[i]);
      });
    });
  }
}

class SetRequest {
  key: string;
  value: PersistedQuery;
  promiseResolve: (value: void | PromiseLike<void>) => void = () => {
    return;
  };
  promiseReject: (value: void | PromiseLike<void>) => void = () => {
    return;
  };
  promise: Promise<void>;
  constructor(key: string, value: PersistedQuery) {
    this.key = key;
    this.value = value;
    this.promise = new Promise<void>((resolve, reject) => {
      this.promiseResolve = resolve;
      this.promiseReject = reject;
    });
  }
}

class SetOperation {
  items: Array<SetRequest> = [];
  constructor(items: Array<SetRequest>) {
    this.items = items;
  }
  execute() {
    const itemsToSet: Array<[string, PersistedQuery]> = this.items.map((item) => [item.key, item.value]);
    setMany(itemsToSet).then(() => {
      this.items.forEach((item) => {
        item.promiseResolve();
      });
    });
  }
}

class RemoveRequest {
  key: string;
  promiseResolve: (value: void | PromiseLike<void>) => void = () => {
    return;
  };
  promiseReject: (value: void | PromiseLike<void>) => void = () => {
    return;
  };
  promise: Promise<void>;
  constructor(key: string) {
    this.key = key;
    this.promise = new Promise<void>((resolve, reject) => {
      this.promiseResolve = resolve;
      this.promiseReject = reject;
    });
  }
}

class RemoveOperation {
  items: Array<RemoveRequest> = [];
  constructor(items: Array<RemoveRequest>) {
    this.items = items;
  }
  execute() {
    const keys = this.items.map((item) => item.key);
    delMany(keys).then(() => {
      this.items.forEach((item) => {
        item.promiseResolve();
      });
    });
  }
}

const IdbAsyncStorage = (): AsyncStorage<PersistedQuery> => {
  const getBuffer: Array<GetRequest> = [];
  let getRequestTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
  const setBuffer: Array<SetRequest> = [];
  let setRequestTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
  const removeBuffer: Array<RemoveRequest> = [];
  let removeRequestTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
  return {
    getItem: async (key: string) => {
      const item = new GetRequest(key);
      getBuffer.push(item);
      if (getBuffer.length === 1) {
        getRequestTimeout = setTimeout(() => {
          new GetOperation(getBuffer.splice(0, getBuffer.length)).execute();
        }, GET_BATCH_TIMOUT);
      } else if (getBuffer.length === GET_BATCH_MAX_ITEMS) {
        clearTimeout(getRequestTimeout);
        new GetOperation(getBuffer.splice(0, getBuffer.length)).execute();
      }
      return item.promise;
    },

    setItem: async (key: string, value: PersistedQuery) => {
      const item = new SetRequest(key, value);
      setBuffer.push(item);
      if (setBuffer.length === 1) {
        setRequestTimeout = setTimeout(() => {
          new SetOperation(setBuffer.splice(0, setBuffer.length)).execute();
        }, SET_BATCH_TIMOUT);
      } else if (setBuffer.length === SET_BATCH_MAX_ITEMS) {
        clearTimeout(setRequestTimeout);
        new SetOperation(setBuffer.splice(0, setBuffer.length)).execute();
      }
      return item.promise;
    },

    removeItem: async (key: string) => {
      const item = new RemoveRequest(key);
      removeBuffer.push(item);
      if (removeBuffer.length === 1) {
        removeRequestTimeout = setTimeout(() => {
          new RemoveOperation(removeBuffer.splice(0, removeBuffer.length)).execute();
        }, REMOVE_BATCH_TIMOUT);
      } else if (removeBuffer.length === REMOVE_BATCH_MAX_ITEMS) {
        clearTimeout(removeRequestTimeout);
        new RemoveOperation(removeBuffer.splice(0, removeBuffer.length)).execute();
      }
      return item.promise;
    },
  };
};

export default IdbAsyncStorage;
