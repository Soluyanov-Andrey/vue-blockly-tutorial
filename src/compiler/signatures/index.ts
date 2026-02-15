// src/compiler/signatures/index.ts
//Шаблоны (Скелеты)

import { layoutSignatures } from './layout';
import { contentSignatures } from './content';

export const SIGNATURES = {
  layout: layoutSignatures,
  content: contentSignatures
};

// Типизация для удобства (опционально)
export type SignaturesType = typeof SIGNATURES;