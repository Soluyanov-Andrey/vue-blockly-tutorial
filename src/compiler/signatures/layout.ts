// src/compiler/signatures/layout.ts
export const layoutSignatures = {
  row: (id: string, title: string) => ({
    rowId: id,
    rowTitle: title,
    blocks: []
  })
};