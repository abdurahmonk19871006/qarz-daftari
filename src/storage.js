/* Simple localStorage-backed persistence layer.
   Mirrors the async get/set/delete shape so App.jsx logic stays unchanged. */

const PREFIX = "qd_";

export const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return { key, value: raw, shared: false };
    } catch (e) {
      console.error("storage.get error", e);
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return { key, value, shared: false };
    } catch (e) {
      console.error("storage.set error", e);
      return null;
    }
  },
  async delete(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true, shared: false };
    } catch (e) {
      console.error("storage.delete error", e);
      return null;
    }
  },
};
