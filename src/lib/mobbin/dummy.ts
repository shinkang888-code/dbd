/**
 * Preview(무DB) 시드 — 실측한 저장 앱을 그대로 담아 대시보드가 바로 동작하게 한다.
 * (2026-07 shinkang888@gmail.com 계정 Saved 실측 기준)
 */
import type { MobbinApp } from "./types";

export const DUMMY_APPS: MobbinApp[] = [
  {
    appKey: "lovable-web-ddefb8c8-715e-4dec-bc56-9bb4b99d4f15",
    name: "Lovable — Build apps & websites with AI",
    url: "https://mobbin.com/apps/lovable-web-ddefb8c8-715e-4dec-bc56-9bb4b99d4f15/6cf1551f-ad56-4139-b6c0-c65576fa4ea6/screens",
    platform: ["Web", "Site"],
    screenCount: 339,
    iconUrl: null,
    nativeCategories: ["AI", "Developer Tools"],
    categoryOverride: null,
  },
  {
    appKey: "instagram-ios",
    name: "Instagram",
    url: "https://mobbin.com/apps/instagram-ios",
    platform: ["iOS"],
    screenCount: 0,
    iconUrl: null,
    nativeCategories: ["Social Networking"],
    categoryOverride: null,
  },
  {
    appKey: "cleo-ios",
    name: "Cleo",
    url: "https://mobbin.com/apps/cleo-ios",
    platform: ["iOS"],
    screenCount: 0,
    iconUrl: null,
    nativeCategories: ["Finance"],
    categoryOverride: null,
  },
  {
    appKey: "strava-ios",
    name: "Strava",
    url: "https://mobbin.com/apps/strava-ios",
    platform: ["iOS"],
    screenCount: 0,
    iconUrl: null,
    nativeCategories: ["Health & Fitness"],
    categoryOverride: null,
  },
];
