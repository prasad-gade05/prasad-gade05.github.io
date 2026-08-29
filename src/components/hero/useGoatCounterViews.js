import { useEffect, useState } from "react";

const GOATCOUNTER_COUNTER_URL = "https://prasadgade05.goatcounter.com/counter";
const viewsCache = new Map();

const getViewsForPath = (path) => {
  if (!viewsCache.has(path)) {
    const request = (async () => {
      try {
        const url =
          path === "TOTAL"
            ? `${GOATCOUNTER_COUNTER_URL}/TOTAL.json`
            : `${GOATCOUNTER_COUNTER_URL}/${encodeURIComponent(path)}.json`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`GoatCounter responded ${response.status}`);
        }
        const data = await response.json();
        if (typeof data?.count === "string") return data.count;
        if (typeof data?.count === "number") return String(data.count);
        return null;
      } catch {
        return null;
      }
    })();
    viewsCache.set(path, request);
  }
  return viewsCache.get(path);
};

export const useGoatCounterViews = (paths) => {
  const [views, setViews] = useState({});

  const pathsKey = [
    ...new Set((Array.isArray(paths) ? paths : paths ? [paths] : []).filter(Boolean)),
  ].join("|");

  useEffect(() => {
    if (!pathsKey) return undefined;
    let cancelled = false;
    Promise.all(
      pathsKey.split("|").map(async (path) => [path, await getViewsForPath(path)])
    )
      .then((entries) => {
        if (!cancelled) setViews(Object.fromEntries(entries));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathsKey]);

  return views;
};
