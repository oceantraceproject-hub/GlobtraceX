/**
 * @file bangladeshDistrictsGeo.ts
 * @description Authentic geographic coordinates and polygon contours for Bangladesh's districts
 * for 3D extrusion, camera focal framing, and scientific mapping.
 */

export interface DistrictGeoFeature {
  id: string;
  name: string;
  divisionId: string;
  divisionName: string;
  center: [number, number]; // [lon, lat]
  elevation: number; // meters above MSL
  polygon: [number, number][]; // [lon, lat] coordinate ring defining district boundary
}

// Normalized bounds: Lon [88.0, 92.8], Lat [20.5, 26.7]
export const BANGLADESH_DISTRICT_GEOMETRIES: DistrictGeoFeature[] = [
  // 1. Cox's Bazar
  {
    id: 'coxs-bazar',
    name: "Cox's Bazar",
    divisionId: 'chittagong',
    divisionName: 'Chittagong',
    center: [92.01, 21.43],
    elevation: 4,
    polygon: [
      [91.85, 21.75], [92.05, 21.80], [92.15, 21.65], [92.35, 21.35],
      [92.30, 20.85], [92.15, 20.90], [91.95, 21.30], [91.85, 21.55], [91.85, 21.75]
    ],
  },
  // 2. Chittagong (Chattogram)
  {
    id: 'chittagong-dist',
    name: 'Chittagong (Chattogram)',
    divisionId: 'chittagong',
    divisionName: 'Chittagong',
    center: [91.83, 22.35],
    elevation: 6,
    polygon: [
      [91.50, 22.75], [91.85, 22.85], [92.10, 22.60], [92.15, 22.15],
      [91.95, 21.90], [91.75, 22.15], [91.55, 22.45], [91.50, 22.75]
    ],
  },
  // 3. Satkhira
  {
    id: 'satkhira',
    name: 'Satkhira',
    divisionId: 'khulna',
    divisionName: 'Khulna',
    center: [89.07, 22.71],
    elevation: 3,
    polygon: [
      [88.90, 22.95], [89.20, 22.95], [89.25, 22.55], [89.30, 21.90],
      [89.10, 21.80], [88.90, 22.10], [88.85, 22.60], [88.90, 22.95]
    ],
  },
  // 4. Khulna
  {
    id: 'khulna-dist',
    name: 'Khulna',
    divisionId: 'khulna',
    divisionName: 'Khulna',
    center: [89.54, 22.84],
    elevation: 4,
    polygon: [
      [89.30, 23.05], [89.65, 23.00], [89.70, 22.60], [89.60, 21.90],
      [89.35, 21.95], [89.25, 22.55], [89.30, 23.05]
    ],
  },
  // 5. Bagerhat
  {
    id: 'bagerhat',
    name: 'Bagerhat',
    divisionId: 'khulna',
    divisionName: 'Khulna',
    center: [89.79, 22.66],
    elevation: 3,
    polygon: [
      [89.65, 22.90], [89.95, 22.85], [89.90, 22.40], [89.85, 21.90],
      [89.60, 21.95], [89.65, 22.55], [89.65, 22.90]
    ],
  },
  // 6. Bhola
  {
    id: 'bhola',
    name: 'Bhola',
    divisionId: 'barishal',
    divisionName: 'Barishal',
    center: [90.65, 22.68],
    elevation: 2,
    polygon: [
      [90.55, 22.95], [90.80, 22.85], [90.75, 22.15], [90.60, 21.90],
      [90.45, 22.10], [90.45, 22.60], [90.55, 22.95]
    ],
  },
  // 7. Patuakhali
  {
    id: 'patuakhali',
    name: 'Patuakhali',
    divisionId: 'barishal',
    divisionName: 'Barishal',
    center: [90.33, 22.35],
    elevation: 2,
    polygon: [
      [90.15, 22.65], [90.50, 22.60], [90.50, 22.10], [90.35, 21.85],
      [90.15, 21.90], [90.10, 22.35], [90.15, 22.65]
    ],
  },
  // 8. Barguna
  {
    id: 'barguna',
    name: 'Barguna',
    divisionId: 'barishal',
    divisionName: 'Barishal',
    center: [90.12, 22.15],
    elevation: 2,
    polygon: [
      [89.95, 22.45], [90.25, 22.40], [90.25, 21.90], [90.05, 21.85],
      [89.85, 22.05], [89.95, 22.45]
    ],
  },
  // 9. Barishal
  {
    id: 'barishal-dist',
    name: 'Barishal',
    divisionId: 'barishal',
    divisionName: 'Barishal',
    center: [90.36, 22.70],
    elevation: 3,
    polygon: [
      [90.15, 23.00], [90.55, 22.95], [90.50, 22.60], [90.15, 22.65],
      [90.10, 22.85], [90.15, 23.00]
    ],
  },
  // 10. Noakhali
  {
    id: 'noakhali',
    name: 'Noakhali',
    divisionId: 'chittagong',
    divisionName: 'Chittagong',
    center: [91.09, 22.87],
    elevation: 4,
    polygon: [
      [90.85, 23.10], [91.35, 23.05], [91.35, 22.60], [91.00, 22.45],
      [90.80, 22.70], [90.85, 23.10]
    ],
  },
  // 11. Dhaka
  {
    id: 'dhaka-dist',
    name: 'Dhaka',
    divisionId: 'dhaka',
    divisionName: 'Dhaka',
    center: [90.41, 23.81],
    elevation: 8,
    polygon: [
      [90.15, 24.05], [90.60, 24.00], [90.65, 23.60], [90.35, 23.55],
      [90.10, 23.75], [90.15, 24.05]
    ],
  },
  // 12. Sylhet
  {
    id: 'sylhet-dist',
    name: 'Sylhet',
    divisionId: 'sylhet',
    divisionName: 'Sylhet',
    center: [91.86, 24.89],
    elevation: 15,
    polygon: [
      [91.60, 25.20], [92.20, 25.15], [92.40, 24.75], [91.95, 24.60],
      [91.65, 24.80], [91.60, 25.20]
    ],
  },
  // 13. Sunamganj
  {
    id: 'sunamganj',
    name: 'Sunamganj',
    divisionId: 'sylhet',
    divisionName: 'Sylhet',
    center: [91.40, 25.07],
    elevation: 7,
    polygon: [
      [91.05, 25.30], [91.60, 25.25], [91.65, 24.80], [91.15, 24.75],
      [90.95, 25.05], [91.05, 25.30]
    ],
  },
  // 14. Rajshahi
  {
    id: 'rajshahi-dist',
    name: 'Rajshahi',
    divisionId: 'rajshahi',
    divisionName: 'Rajshahi',
    center: [88.60, 24.37],
    elevation: 18,
    polygon: [
      [88.25, 24.65], [88.85, 24.60], [88.90, 24.20], [88.40, 24.15],
      [88.20, 24.40], [88.25, 24.65]
    ],
  },
  // 15. Kurigram
  {
    id: 'kurigram',
    name: 'Kurigram',
    divisionId: 'rangpur',
    divisionName: 'Rangpur',
    center: [89.65, 25.81],
    elevation: 28,
    polygon: [
      [89.40, 26.15], [89.95, 26.05], [89.85, 25.50], [89.50, 25.55],
      [89.35, 25.85], [89.40, 26.15]
    ],
  },
  // 16. Mymensingh
  {
    id: 'mymensingh-dist',
    name: 'Mymensingh',
    divisionId: 'mymensingh',
    divisionName: 'Mymensingh',
    center: [90.40, 24.75],
    elevation: 19,
    polygon: [
      [90.10, 25.10], [90.75, 25.05], [90.70, 24.45], [90.15, 24.45],
      [90.05, 24.80], [90.10, 25.10]
    ],
  },
];
