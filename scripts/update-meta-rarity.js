#!/usr/bin/env node

/**
 * Update META character rarities to UR (6)
 * In Azur Lane, META characters are Ultra Rare and should have rarity 6
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateMetaRarities() {
  const charactersPath = path.join(__dirname, '../public/data/characters.json');

  if (!fs.existsSync(charactersPath)) {
    console.error('characters.json not found');
    return;
  }

  const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
  let updatedCount = 0;

  const updatedCharacters = characters.map(char => {
    if ((char.name.includes('META') || char.name.includes('·META') ||
         char.nameCn.includes('META') || char.nameCn.includes('·META') ||
         char.type === 'META' || char.faction === 'META') && char.rarity < 6) {
      const updatedChar = { ...char, rarity: 6 };
      updatedCount++;
      console.log(`Updated ${char.nameCn} (${char.name}) rarity from ${char.rarity} to 6 (UR)`);
      return updatedChar;
    }
    return char;
  });

  // Write back to file
  fs.writeFileSync(charactersPath, JSON.stringify(updatedCharacters, null, 2));
  console.log(`\nUpdated ${updatedCount} META characters to rarity 6 (UR)`);
}

updateMetaRarities();