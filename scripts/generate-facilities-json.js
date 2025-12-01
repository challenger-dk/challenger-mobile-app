#!/usr/bin/env node

/**
 * Script to convert facilities CSV to JSON with pre-processed coordinates
 * Run this whenever the CSV file is updated:
 * node scripts/generate-facilities-json.js
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../assets/facilities/facilities-københavn.csv');
const jsonPath = path.join(__dirname, '../assets/facilities/facilities.json');

// UTM to lat/lng conversion function
function utmToLatLng(easting, northing, zone = 32) {
  const k0 = 0.9996;
  const a = 6378137;
  const e2 = 0.00669438;
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  
  const x = easting - 500000;
  const y = northing;
  
  const m = y / k0;
  const mu = m / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
  
  const e1_2 = e1 * e1;
  const e1_3 = e1_2 * e1;
  const e1_4 = e1_3 * e1;
  
  const j1 = 3 * e1 / 2 - 27 * e1_3 / 32;
  const j2 = 21 * e1_2 / 16 - 55 * e1_4 / 32;
  const j3 = 151 * e1_3 / 96;
  const j4 = 1097 * e1_4 / 512;
  
  const fp = mu + j1 * Math.sin(2 * mu) + j2 * Math.sin(4 * mu) + j3 * Math.sin(6 * mu) + j4 * Math.sin(8 * mu);
  
  const e_2 = e2 / (1 - e2);
  const c1 = e_2 * Math.cos(fp) * Math.cos(fp);
  const t1 = Math.tan(fp);
  const n1 = a / Math.sqrt(1 - e2 * Math.sin(fp) * Math.sin(fp));
  const r1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(fp) * Math.sin(fp), 1.5);
  const d = x / (n1 * k0);
  
  const q1 = n1 * Math.tan(fp) / r1;
  const q2 = d * d / 2;
  const q3 = (5 + 3 * t1 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * e_2) * d * d * d * d / 24;
  const q4 = (61 + 90 * t1 * t1 + 298 * c1 + 45 * t1 * t1 * t1 * t1 - 252 * e_2 - 3 * c1 * c1) * d * d * d * d * d * d / 720;
  const lat = fp - q1 * (q2 - q3 + q4);
  
  const q5 = d;
  const q6 = (1 + 2 * t1 * t1 + c1) * d * d * d / 6;
  const q7 = (5 - 2 * c1 + 28 * t1 * t1 - 3 * c1 * c1 + 8 * e_2 + 24 * t1 * t1 * t1 * t1) * d * d * d * d * d / 120;
  const lon = (q5 - q6 + q7) / Math.cos(fp);
  
  const latitude = (lat * 180) / Math.PI;
  const longitude = ((zone - 1) * 6 - 180 + 3) + (lon * 180) / Math.PI;
  
  return { latitude, longitude };
}

// Read and parse CSV
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(l => l.trim());
const headers = lines[0].split(';').map(h => h.trim());

const facilities = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  // Handle multi-line entries
  let fullLine = line;
  let j = i + 1;
  while (j < lines.length && lines[j].split(';').length < headers.length) {
    fullLine += '\n' + lines[j];
    j++;
  }
  i = j - 1;
  
  const values = fullLine.split(';').map(v => v.trim());
  if (values.length < headers.length) continue;
  
  const gisX = parseFloat(values[headers.indexOf('Gis X')] || '0');
  const gisY = parseFloat(values[headers.indexOf('Gis Y')] || '0');
  
  if (!gisX || !gisY || isNaN(gisX) || isNaN(gisY)) continue;
  
  const { latitude, longitude } = utmToLatLng(gisX, gisY, 32);
  
  if (isNaN(latitude) || isNaN(longitude)) continue;
  
  const placement = values[headers.indexOf('Placering')] || '';
  const indoor = placement.toLowerCase().includes('indendørs') || placement.toLowerCase().includes('indendors');
  
  const facility = {
    id: `facility-${i}`,
    name: values[headers.indexOf('Navn')] || '',
    detailedName: values[headers.indexOf('Navn Detaljeret')] || undefined,
    address: values[headers.indexOf('Adresse')] || '',
    phone: values[headers.indexOf('Telefon')] || undefined,
    email: values[headers.indexOf('Email')] || undefined,
    website: values[headers.indexOf('Hjemmeside')] || undefined,
    facilityType: values[headers.indexOf('Facilitetstype')] || '',
    indoor: indoor,
    notes: values[headers.indexOf('Eksterne bemærkninger')] || undefined,
    location: {
      address: values[headers.indexOf('Adresse')] || '',
      latitude: latitude,
      longitude: longitude,
      postal_code: '',
      city: 'København',
      country: 'Denmark',
    },
  };
  
  // Remove undefined fields
  Object.keys(facility).forEach(key => {
    if (facility[key] === undefined) {
      delete facility[key];
    }
  });
  
  facilities.push(facility);
}

// Write JSON file
fs.writeFileSync(jsonPath, JSON.stringify(facilities, null, 2));
console.log(`✅ Generated ${facilities.length} facilities in ${jsonPath}`);

