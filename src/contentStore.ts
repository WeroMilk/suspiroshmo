import { defaultContent, type SiteContent } from './data';

const STORAGE_KEY = 'suspiros-site-content-v1';

function isValidContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== 'object') return false;
  const data = value as SiteContent;
  return Array.isArray(data.products) && Array.isArray(data.stores) && Array.isArray(data.categories) && Boolean(data.transferInfo);
}

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultContent);
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidContent(parsed)) return structuredClone(defaultContent);
    return {
      products: parsed.products,
      stores: parsed.stores,
      categories: parsed.categories.length ? parsed.categories : defaultContent.categories,
      transferInfo: { ...defaultContent.transferInfo, ...parsed.transferInfo },
    };
  } catch {
    return structuredClone(defaultContent);
  }
}

export function saveContent(content: SiteContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export function resetContent(): SiteContent {
  const next = structuredClone(defaultContent);
  saveContent(next);
  return next;
}
