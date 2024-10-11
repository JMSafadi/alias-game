import { WordService } from './words.service';
import * as words from '../words/words.json';

describe('generateWord', () => {
  let service: WordService;
  let wordsCopy;
  beforeEach(() => {
    service = new WordService();
    wordsCopy = JSON.parse(JSON.stringify(words));
  });
  it('should return a random word from random category, from JSON', () => {
    const randomWord = service.generateWord();
    const allWords = Object.values(wordsCopy).flat();
    expect(allWords).toContain(randomWord);
  });
});
