import { SimilarityService } from './similarity.service';

describe('Similarity Service', () => {
  let service: SimilarityService;
  beforeEach(() => {
    service = new SimilarityService();
  });

  describe('normalizeString', () => {
    it('should remove white spaces and convert to lowercase', () => {
      const result = service['normalizeString']('  elEphanT  ');
      expect(result).toBe('elephant');
    });
  });
  describe('calculateLexicalSimilarity', () => {
    it('should calculate lexical similarity between two strings', () => {
      const result = service['calculateLexicalSimilarity'](
        'elephant',
        'elehpant',
      );
      expect(result).toBeGreaterThan(70);
    });
    it('should return 100 when words are identical', () => {
      const result = service['calculateLexicalSimilarity'](
        'elephant',
        'elephant',
      );
      expect(result).toBe(100);
    });
    it('should return 0 when words are completly different', () => {
      const result = service['calculateLexicalSimilarity'](
        'elephant',
        'rabbit',
      );
      expect(result).toBeLessThan(50);
    });
  });
  describe('calculatePhoneticSimilarity', () => {
    it('should return 100 for phonetic match', () => {
      const result = service['calculatePhoneticSimilarity']('knight', 'night');
      expect(result).toBe(true);
    });
    it('should return 0 if no phonetic match', () => {
      const result = service['calculatePhoneticSimilarity'](
        'elephant',
        'rabbit',
      );
      expect(result).toBe(false);
    });
  });
  describe('calculateSimilarityText', () => {
    it('should return the highest similarity in the text', () => {
      const result = service.calculateSimilarityText(
        'elephants but singular',
        'elephant',
      );
      expect(result).toBeGreaterThan(70);
    });
    it('should return low similarity if there is not similar words', () => {
      const result = service.calculateSimilarityText(
        'very large grey wild animal',
        'elephant',
      );
      expect(result).toBeLessThan(50);
    });
  });
  describe('checkGuess', () => {
    it('should return true if correct guess', () => {
      const result = service.checkGuess('rabbit', 'rabbit');
      expect(result).toBe(true);
    });
    it('should return false if incorrect guess', () => {
      const result = service.checkGuess('rabbit', 'dog');
      expect(result).toBe(false);
    });
  });
});
