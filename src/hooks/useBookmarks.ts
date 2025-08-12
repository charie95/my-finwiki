"use client";
import { useEffect, useState } from "react";

export type Bookmark = { keyword: string; url: string; savedAt: number };
const KEY = "myfinwiki.bookmarks";

function read(): Bookmark[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Bookmark[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function write(list: Bookmark[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function useBookmarks() {
  const [list, setList] = useState<Bookmark[] | null>(null); // null = 아직 로딩 전

  useEffect(() => {
    setList(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setList(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = (keyword: string) => (list ?? []).some((b) => b.keyword === keyword);

  const add = (b: Bookmark) => {
    if (list === null) return;
    const next = [b, ...list.filter((x) => x.keyword !== b.keyword)];
    write(next);
    setList(next);
  };

  const remove = (keyword: string) => {
    if (list === null) return;
    const next = list.filter((x) => x.keyword !== keyword);
    write(next);
    setList(next);
  };

  const toggle = (b: Bookmark) => (has(b.keyword) ? remove(b.keyword) : add(b));

  return { list, has, add, remove, toggle };
}
