import { CrimeHotspot } from '../types';

/**
 * Dynamic JSON Array for Crime Hotspot Locations
 * Easy to replace or fetch from backend REST / GraphQL APIs.
 */
export const initialCrimeHotspots: CrimeHotspot[] = [
  {
    id: 'hs-101',
    areaName: 'Downtown Central Financial Sector',
    severity: 'High',
    crimeIndex: 88,
    totalCases: 142,
    mostCommonCrime: 'Armed Robbery & Bank Heist',
    lastUpdated: '2026-08-05 18:30',
    center: [18.922, 72.8346],
    radiusMeters: 900,
    polygonCoords: [
      [18.928, 72.828],
      [18.931, 72.839],
      [18.918, 72.842],
      [18.914, 72.832],
    ],
  },
  {
    id: 'hs-102',
    areaName: 'Old Port Terminal & Harbor Docks',
    severity: 'High',
    crimeIndex: 94,
    totalCases: 189,
    mostCommonCrime: 'Narcotics Smuggling & Cargo Fraud',
    lastUpdated: '2026-08-06 02:15',
    center: [18.951, 72.844],
    radiusMeters: 1100,
    polygonCoords: [
      [18.958, 72.838],
      [18.961, 72.852],
      [18.943, 72.855],
      [18.942, 72.840],
    ],
  },
  {
    id: 'hs-103',
    areaName: 'East Side Industrial Park & Warehouses',
    severity: 'Medium',
    crimeIndex: 67,
    totalCases: 76,
    mostCommonCrime: 'Cyber Extortion & Server Hijack',
    lastUpdated: '2026-08-04 14:20',
    center: [18.982, 72.862],
    radiusMeters: 800,
    polygonCoords: [
      [18.988, 72.855],
      [18.991, 72.869],
      [18.976, 72.871],
      [18.975, 72.858],
    ],
  },
  {
    id: 'hs-104',
    areaName: 'West End Residential Enclave',
    severity: 'Low',
    crimeIndex: 32,
    totalCases: 24,
    mostCommonCrime: 'Burglary & Vehicle Theft',
    lastUpdated: '2026-08-03 11:00',
    center: [18.905, 72.815],
    radiusMeters: 700,
    polygonCoords: [
      [18.911, 72.809],
      [18.913, 72.821],
      [18.899, 72.822],
      [18.898, 72.811],
    ],
  },
  {
    id: 'hs-105',
    areaName: 'North Suburb Junction & Transit Hub',
    severity: 'Medium',
    crimeIndex: 59,
    totalCases: 61,
    mostCommonCrime: 'Fraud & Pickpocketing',
    lastUpdated: '2026-08-05 09:45',
    center: [19.015, 72.848],
    radiusMeters: 850,
    polygonCoords: [
      [19.022, 72.841],
      [19.024, 72.855],
      [19.009, 72.857],
      [19.008, 72.844],
    ],
  },
];
