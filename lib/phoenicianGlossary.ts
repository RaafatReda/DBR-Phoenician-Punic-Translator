import type { GlossaryEntry } from '../types';
import { aleph } from './glossary/aleph';
import { bet } from './glossary/bet';
import { gimel } from './glossary/gimel';
import { dalet } from './glossary/dalet';
import { he } from './glossary/he';
import { waw } from './glossary/waw';
import { zayin } from './glossary/zayin';
import { heth } from './glossary/heth';
import { teth } from './glossary/teth';
import { yodh } from './glossary/yodh';
import { kaph } from './glossary/kaph';
import { lamedh } from './glossary/lamedh';
import { mem } from './glossary/mem';
import { nun } from './glossary/nun';
import { samekh } from './glossary/samekh';
import { ayin } from './glossary/ayin';
import { pe } from './glossary/pe';
import { sade } from './glossary/sade';
import { qoph } from './glossary/qoph';
import { resh } from './glossary/resh';
import { shin } from './glossary/shin';
import { taw } from './glossary/taw';
import { personalNames } from './glossary/personal_names';

// A comprehensive, alphabetized list of Phoenician words with multilingual definitions.
export const phoenicianGlossary: GlossaryEntry[] = [
  ...aleph,
  ...bet,
  ...gimel,
  ...dalet,
  ...he,
  ...waw,
  ...zayin,
  ...heth,
  ...teth,
  ...yodh,
  ...kaph,
  ...lamedh,
  ...mem,
  ...nun,
  ...samekh,
  ...ayin,
  ...pe,
  ...sade,
  ...qoph,
  ...resh,
  ...shin,
  ...taw,
  ...personalNames,
].sort((a, b) => a.phoenician.localeCompare(b.phoenician));
