// src/compiler/signatures/content.ts
export const contentSignatures = {
  image: (id: string, title: string, src: string) => ({
    id,
    type: 'image',
    title,
    data: { src }
  }),
  text: (id: string, title: string, content: string) => ({
    id,
    type: 'text',
    title,
    data: { content }
  })
};