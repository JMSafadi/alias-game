import { Injectable } from '@nestjs/common';
import * as natural from 'natural';

@Injectable()
export class SimilarityService {
  // Normalize string deleting white spaces and converting to lower case
  private normalizeString(input: string): string {
    return input.trim().toLowerCase();
  }
  // Calculate lexical similarity
  private calculateLexicalSimilarity(word: string, guess: string): number {
    const normalizedWord = this.normalizeString(word);
    const normalizedGuess = this.normalizeString(guess);
    const distance = natural.LevenshteinDistance(
      normalizedWord,
      normalizedGuess,
    );
    const maxLen = Math.max(normalizedWord.length, normalizedGuess.length);
    const similarity = ((maxLen - distance) / maxLen) * 100;
    console.log('lexical similarity: ', similarity);
    return similarity;
  }
  // Calculate phonetic similarity with Metaphone
  private calculatePhoneticSimilarity(word: string, guess: string): number {
    const metaphone = new natural.Metaphone();
    const normalizedWord = this.normalizeString(word);
    const normalizedGuess = this.normalizeString(guess);
    const soundex1 = metaphone.process(normalizedWord);
    const soundex2 = metaphone.process(normalizedGuess);
    console.log('soundex: ', soundex1, soundex2);
    const result = metaphone.compare(soundex1, soundex2);
    console.log('phonetic similarity is: ', result);
    return result ? 100 : 0;
  }
  // Calculate overall simlairity for one word
  private calculateOverallSimilarity(word: string, guess: string): number {
    const lexicalSimilarity = this.calculateLexicalSimilarity(word, guess);
    const phonetixSimilarity = this.calculatePhoneticSimilarity(word, guess);
    const result = (lexicalSimilarity + phonetixSimilarity) / 2;
    console.log('overall similarity: ', result);
    return result;
  }
  // Calculate similarity for multiple words string message
  calculateSimilarityText(text: string, guess: string): number {
    const words = text.split(' ');
    let highestSimilarity = 0;

    for (const word of words) {
      const similarity = this.calculateOverallSimilarity(guess, word);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
      }
    }
    console.log('Highest similarity in message: ', highestSimilarity);
    return highestSimilarity;
  }
  checkGuess(word: string, guess: string): boolean {
    const normalizedWord = this.normalizeString(word);
    const normalizedGuess = this.normalizeString(guess);
    const result =
      this.calculateOverallSimilarity(normalizedWord, normalizedGuess) === 100;
    console.log('Is guess correct? ', result);
    return result;
  }
}
