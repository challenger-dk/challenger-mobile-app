#!/usr/bin/env node

/**
 * Script to convert facilities Excel files to JSON with pre-processed coordinates
 * Processes all Excel files in the excel-files folder
 * Run this whenever the Excel files are updated:
 * node scripts/generate-facilities-json.js
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelFilesDir = path.join(__dirname, '../assets/facilities/excel-files');
const jsonPath = path.join(__dirname, '../assets/facilities/facilities.json');

// Facility types to exclude
const excludedFacilityTypes = [
  'Fitnesscentre',
  'Skydeanlæg',
  'Kabelbaner',
  'Alpine skianlæg',
  'Orienteringsbaner',
  'Parkouranlæg',
  'Golfanlæg',
  'Motorsportsanlæg',
  'MTB-spor og cykelanlæg',
  'Is- og skøjteanlæg',
];

// UTM to lat/lng conversion function
function utmToLatLng(easting, northing, zone = 32) {
  const k0 = 0.9996;
  const a = 6378137;
  const e2 = 0.00669438;
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const x = easting - 500000;
  const y = northing;

  const m = y / k0;
  const mu =
    m / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256));

  const e1_2 = e1 * e1;
  const e1_3 = e1_2 * e1;
  const e1_4 = e1_3 * e1;

  const j1 = (3 * e1) / 2 - (27 * e1_3) / 32;
  const j2 = (21 * e1_2) / 16 - (55 * e1_4) / 32;
  const j3 = (151 * e1_3) / 96;
  const j4 = (1097 * e1_4) / 512;

  const fp =
    mu +
    j1 * Math.sin(2 * mu) +
    j2 * Math.sin(4 * mu) +
    j3 * Math.sin(6 * mu) +
    j4 * Math.sin(8 * mu);

  const e_2 = e2 / (1 - e2);
  const c1 = e_2 * Math.cos(fp) * Math.cos(fp);
  const t1 = Math.tan(fp);
  const n1 = a / Math.sqrt(1 - e2 * Math.sin(fp) * Math.sin(fp));
  const r1 =
    (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(fp) * Math.sin(fp), 1.5);
  const d = x / (n1 * k0);

  const q1 = (n1 * Math.tan(fp)) / r1;
  const q2 = (d * d) / 2;
  const q3 =
    ((5 + 3 * t1 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * e_2) * d * d * d * d) / 24;
  const q4 =
    ((61 +
      90 * t1 * t1 +
      298 * c1 +
      45 * t1 * t1 * t1 * t1 -
      252 * e_2 -
      3 * c1 * c1) *
      d *
      d *
      d *
      d *
      d *
      d) /
    720;
  const lat = fp - q1 * (q2 - q3 + q4);

  const q5 = d;
  const q6 = ((1 + 2 * t1 * t1 + c1) * d * d * d) / 6;
  const q7 =
    ((5 -
      2 * c1 +
      28 * t1 * t1 -
      3 * c1 * c1 +
      8 * e_2 +
      24 * t1 * t1 * t1 * t1) *
      d *
      d *
      d *
      d *
      d) /
    120;
  const lon = (q5 - q6 + q7) / Math.cos(fp);

  const latitude = (lat * 180) / Math.PI;
  const longitude = (zone - 1) * 6 - 180 + 3 + (lon * 180) / Math.PI;

  return { latitude, longitude };
}

// Extract city name from filename (e.g., "facilities-københavn.xlsx" -> "København")
function extractCityName(filename) {
  const name = filename.replace(/^facilities-/, '').replace(/\.xlsx$/, '');

  // Capitalize first letter of each word, preserving Danish characters
  const words = name.split('-');
  const capitalized = words.map((word) => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return capitalized.join(' ');
}

// Process a single Excel file
function processExcelFile(filePath, cityName) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  if (data.length === 0) return [];

  const headers = data[0].map((h) => String(h).trim());
  const facilities = [];
  let facilityIdCounter = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    // Ensure row has same length as headers, pad with empty strings
    while (row.length < headers.length) {
      row.push('');
    }

    const values = row.map((v) => {
      const val = v !== null && v !== undefined ? String(v).trim() : '';
      return val;
    });

    const gisX = parseFloat(values[headers.indexOf('Gis X')] || '0');
    const gisY = parseFloat(values[headers.indexOf('Gis Y')] || '0');

    if (!gisX || !gisY || isNaN(gisX) || isNaN(gisY)) continue;

    const { latitude, longitude } = utmToLatLng(gisX, gisY, 32);

    if (isNaN(latitude) || isNaN(longitude)) continue;

    const facilityType = values[headers.indexOf('Facilitetstype')] || '';

    // Skip excluded facility types
    if (excludedFacilityTypes.includes(facilityType)) continue;

    const placement = values[headers.indexOf('Placering')] || '';
    const indoor =
      placement.toLowerCase().includes('indendørs') ||
      placement.toLowerCase().includes('indendors');

    facilityIdCounter++;

    const facility = {
      id: `facility-${cityName.toLowerCase().replace(/\s+/g, '-')}-${facilityIdCounter}`,
      name: values[headers.indexOf('Navn')] || '',
      detailedName: values[headers.indexOf('Navn Detaljeret')] || undefined,
      address: values[headers.indexOf('Adresse')] || '',
      phone: values[headers.indexOf('Telefon')] || undefined,
      email: values[headers.indexOf('Email')] || undefined,
      website: values[headers.indexOf('Hjemmeside')] || undefined,
      facilityType: facilityType,
      indoor: indoor,
      notes: values[headers.indexOf('Eksterne bemærkninger')] || undefined,
      location: {
        address: values[headers.indexOf('Adresse')] || '',
        latitude: latitude,
        longitude: longitude,
        postal_code: '',
        city: cityName,
        country: 'Denmark',
      },
    };

    // Remove undefined fields
    Object.keys(facility).forEach((key) => {
      if (facility[key] === undefined) {
        delete facility[key];
      }
    });

    facilities.push(facility);
  }

  return facilities;
}

// Main processing
const allFacilities = [];

// Get all Excel files
const files = fs
  .readdirSync(excelFilesDir)
  .filter((file) => file.endsWith('.xlsx'));

console.log(`📂 Found ${files.length} Excel files to process...\n`);

files.forEach((file, index) => {
  const filePath = path.join(excelFilesDir, file);
  const cityName = extractCityName(file);

  console.log(
    `Processing ${index + 1}/${files.length}: ${file} (${cityName})...`
  );

  try {
    const facilities = processExcelFile(filePath, cityName);
    allFacilities.push(...facilities);
    console.log(
      `  ✅ Added ${facilities.length} facilities from ${cityName}\n`
    );
  } catch (error) {
    console.error(`  ❌ Error processing ${file}:`, error.message);
  }
});

// Write JSON file
fs.writeFileSync(jsonPath, JSON.stringify(allFacilities, null, 2));
console.log(
  `\n✅ Generated ${allFacilities.length} total facilities in ${jsonPath}`
);
