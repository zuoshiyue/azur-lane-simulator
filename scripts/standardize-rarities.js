#!/usr/bin/env node

/**
 * Apply standardized rarity weights to all characters
 * According to Azur Lane's official rarity system:
 * UR (6) = Ultra Rare (including META)
 * SSR (5) = Super Super Rare
 * SR (4) = Super Rare
 * R (3) = Rare
 * N (2) = Normal
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function standardizeRarities() {
  const charactersPath = path.join(__dirname, '../public/data/characters.json');

  if (!fs.existsSync(charactersPath)) {
    console.error('characters.json not found');
    return;
  }

  const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));

  // Count current distribution
  const rarityCount = {};
  characters.forEach(char => {
    rarityCount[char.rarity] = (rarityCount[char.rarity] || 0) + 1;
  });

  console.log('Current rarity distribution:');
  Object.keys(rarityCount).sort().forEach(rarity => {
    console.log(`Rarity ${rarity}: ${rarityCount[rarity]} characters`);
  });

  // Standardize any characters with invalid rarity values (1 or values higher than 6)
  const updatedCharacters = characters.map(char => {
    // If rarity is below 2 (N), set to 2
    // If rarity is above 6 (UR), set to 6
    if (char.rarity < 2) {
      return { ...char, rarity: 2 };  // Minimum rarity is N (2)
    } else if (char.rarity > 6) {
      return { ...char, rarity: 6 };  // Maximum rarity is UR (6)
    }
    return char;
  });

  // Write back to file
  fs.writeFileSync(charactersPath, JSON.stringify(updatedCharacters, null, 2));
  console.log('\nRarity values standardized successfully!');

  // New distribution
  const newRarityCount = {};
  updatedCharacters.forEach(char => {
    newRarityCount[char.rarity] = (newRarityCount[char.rarity] || 0) + 1;
  });

  console.log('\nNew rarity distribution:');
  Object.keys(newRarityCount).sort().forEach(rarity => {
    console.log(`Rarity ${rarity}: ${newRarityCount[rarity]} characters`);
  });
}

standardizeRarities();