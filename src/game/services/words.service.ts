/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { Injectable, NotFoundException } from '@nestjs/common';
// import * as words from './../words/words.json';
import words from '../words/words.json';

@Injectable()
export class WordService {
  generateWord() {
    // Select random category
    const allCategories = Object.keys(words);
    const randomCategory =
      allCategories[Math.floor(Math.random() * allCategories.length)];
    if (!words[randomCategory]) {
      throw new NotFoundException(`Category ${randomCategory} not found`);
    }
    // Select random word from category
    const wordList = words[randomCategory];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    console.log(
      `Selected category: ${randomCategory}. Selected word: ${randomWord}`,
    );
    return randomWord;
  }
}
