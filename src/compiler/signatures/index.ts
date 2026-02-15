// src/compiler/signatures/index.ts
//Шаблоны (Скелеты)

import { layoutSignatures } from './layout';
import { contentSignatures } from './content';

export const SIGNATURES = {
  ...layoutSignatures,
  ...contentSignatures
};