import type { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export const Settings = {
  AUTO_START_TIMER: "autoStartTimer",
  AUTO_RERUN: "autoRerun"
};

const DEFAULTS = new Map([
  [Settings.AUTO_START_TIMER, false],
  [Settings.AUTO_RERUN, true]
]);

function makeUseStorage<T>(key: string) {
  return () =>
    useStorage<T>(key, (v) => (v === undefined ? (DEFAULTS.get(key) as T) : v));
}

export const useAutoStartTimer = makeUseStorage<boolean>(
  Settings.AUTO_START_TIMER
);
export const useAutoRerun = makeUseStorage<boolean>(Settings.AUTO_RERUN);

export async function getOrSetDefault(storage: Storage, key: string) {
  if (!DEFAULTS.has(key)) {
    throw new Error(`${key} is not a valid key`);
  }

  const value = await storage.get(key);
  if (value === undefined) {
    await storage.set(key, DEFAULTS.get(key));
    return DEFAULTS.get(key);
  }

  return value;
}
