export interface AlphabetLetter {
  char: string;
  translit: string;
  nameKey: string;
  meaningKey: string;
}

export const alphabetData: AlphabetLetter[] = [
  { char: '𐤀', translit: 'ʾ', nameKey: 'aleph', meaningKey: 'ox' },
  { char: '𐤁', translit: 'b', nameKey: 'bet', meaningKey: 'house' },
  { char: '𐤂', translit: 'g', nameKey: 'gimel', meaningKey: 'camel' },
  { char: '𐤃', translit: 'd', nameKey: 'dalet', meaningKey: 'door' },
  { char: '𐤄', translit: 'h', nameKey: 'he', meaningKey: 'window' },
  { char: '𐤅', translit: 'w', nameKey: 'waw', meaningKey: 'hook' },
  { char: '𐤆', translit: 'z', nameKey: 'zayin', meaningKey: 'weapon' },
  { char: '𐤇', translit: 'ḥ', nameKey: 'het', meaningKey: 'fence' },
  { char: '𐤈', translit: 'ṭ', nameKey: 'tet', meaningKey: 'wheel' },
  { char: '𐤉', translit: 'y', nameKey: 'yod', meaningKey: 'hand' },
  { char: '𐤊', translit: 'k', nameKey: 'kaph', meaningKey: 'palm_of_hand' },
  { char: '𐤋', translit: 'l', nameKey: 'lamed', meaningKey: 'goad' },
  { char: '𐤌', translit: 'm', nameKey: 'mem', meaningKey: 'water' },
  { char: '𐤍', translit: 'n', nameKey: 'nun', meaningKey: 'fish' },
  { char: '𐤎', translit: 's', nameKey: 'samekh', meaningKey: 'pillar' },
  { char: '𐤏', translit: 'ʿ', nameKey: 'ayin', meaningKey: 'eye' },
  { char: '𐤐', translit: 'p', nameKey: 'pe', meaningKey: 'mouth' },
  { char: '𐤑', translit: 'ṣ', nameKey: 'sade', meaningKey: 'plant' },
  { char: '𐤒', translit: 'q', nameKey: 'qoph', meaningKey: 'monkey' },
  { char: '𐤓', translit: 'r', nameKey: 'resh', meaningKey: 'head' },
  { char: '𐤔', translit: 'š', nameKey: 'shin', meaningKey: 'tooth' },
  { char: '𐤕', translit: 't', nameKey: 'taw', meaningKey: 'mark' },
];