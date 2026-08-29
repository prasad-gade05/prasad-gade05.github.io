import { useEffect, useState } from "react";

const HF_DATASETS_API = "https://huggingface.co/api/datasets";
const downloadsCache = new Map();

export const extractHfRepoId = (url) => {
  if (typeof url !== "string") return null;
  const match = url.match(/^https?:\/\/huggingface\.co\/datasets\/([^/?#]+\/[^/?#]+)/i);
  return match ? match[1] : null;
};

export const formatDownloadCount = (count) =>
  new Intl.NumberFormat("en-US").format(count);

const getDownloadsAllTime = (repoId) => {
  if (!downloadsCache.has(repoId)) {
    const request = (async () => {
      try {
        const url = new URL(`${HF_DATASETS_API}/${repoId}`);
        url.searchParams.append("expand[]", "downloadsAllTime");
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Hugging Face API responded ${response.status}`);
        }
        const data = await response.json();
        return typeof data.downloadsAllTime === "number" ? data.downloadsAllTime : null;
      } catch {
        return null;
      }
    })();
    downloadsCache.set(repoId, request);
  }
  return downloadsCache.get(repoId);
};

export const useDatasetDownloads = (urls) => {
  const [downloads, setDownloads] = useState({});

  const repoIdsKey = [
    ...new Set(
      (Array.isArray(urls) ? urls : urls ? [urls] : [])
        .map(extractHfRepoId)
        .filter(Boolean)
    ),
  ].join("|");

  useEffect(() => {
    if (!repoIdsKey) return undefined;
    let cancelled = false;
    Promise.all(
      repoIdsKey
        .split("|")
        .map(async (repoId) => [repoId, await getDownloadsAllTime(repoId)])
    )
      .then((entries) => {
        if (!cancelled) setDownloads(Object.fromEntries(entries));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [repoIdsKey]);

  return downloads;
};

const KAGGLE_DATASETS_API = "https://www.kaggle.com/api/v1/datasets/list";
const kaggleCache = new Map();

export const extractKaggleRef = (url) => {
  if (typeof url !== "string") return null;
  const match = url.match(/^https?:\/\/(?:www\.)?kaggle\.com\/datasets\/([^/?#]+\/[^/?#]+)/i);
  return match ? match[1] : null;
};

const getKaggleDownloadsByOwner = (owner) => {
  if (!kaggleCache.has(owner)) {
    const request = (async () => {
      try {
        const url = new URL(KAGGLE_DATASETS_API);
        url.searchParams.set("user", owner);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Kaggle API responded ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected Kaggle API payload");
        }
        return Object.fromEntries(
          data
            .filter(
              (entry) =>
                entry && typeof entry.ref === "string" && typeof entry.downloadCount === "number"
            )
            .map((entry) => [entry.ref, entry.downloadCount])
        );
      } catch {
        return null;
      }
    })();
    kaggleCache.set(owner, request);
  }
  return kaggleCache.get(owner);
};

export const useKaggleDownloads = (urls) => {
  const [downloads, setDownloads] = useState({});

  const ownersKey = [
    ...new Set(
      (Array.isArray(urls) ? urls : urls ? [urls] : [])
        .map(extractKaggleRef)
        .filter(Boolean)
        .map((ref) => ref.split("/")[0])
    ),
  ].join("|");

  useEffect(() => {
    if (!ownersKey) return undefined;
    let cancelled = false;
    Promise.all(
      ownersKey
        .split("|")
        .map(async (owner) => [owner, await getKaggleDownloadsByOwner(owner)])
    )
      .then((entries) => {
        if (!cancelled) {
          const merged = {};
          for (const [, refCounts] of entries) {
            if (refCounts) Object.assign(merged, refCounts);
          }
          setDownloads(merged);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ownersKey]);

  return downloads;
};
