// src/compiler/mapping/blocks.ts

//СПРАВОЧНИК: Реестр контента 
import img_block1  from '@/assets/b1.png';
import img_block3  from '@/assets/b3.png';
import img_block5 from '@/assets/b5.png';
import img_block6 from '@/assets/b6.png';
import img_block8 from '@/assets/b8.png';

export const blocksMapping = {

  'block_01': { sig: 'image', title: 'Блок 1', src: img_block1 },
  'block_02': { sig: 'text',  title: 'Блок 2', content: 'Блок 2' },
  'block_03': { sig: 'image', title: 'Блок 3', src: img_block3 },
  'block_04': { sig: 'text',  title: 'Блок 4', content: 'Блок 4'},
  'block_05': { sig: 'image', title: 'Блок 5', src: img_block5 },
  'block_06': { sig: 'image', title: 'Блок 6', src: img_block6 },
  'block_07': { sig: 'text',  title: 'Блок 7', content: 'Блок 7'},
  'block_08': { sig: 'image', title: 'Блок 8', src: img_block8 },
  'block_09': { sig: 'text',  title: 'Блок 9', content: 'Блок 9'},
  'container_01': { sig: 'row', title: 'Верхняя секция' },
  'container_02': { sig: 'row', title: 'Средняя Секция' },
  'container_03': { sig: 'row', title: 'Нижняя секция' }
};

