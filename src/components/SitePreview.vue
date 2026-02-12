<template>
  <div class="site-canvas">
    <div v-for="row in structure" :key="row.rowId" class="layout-row">
      <div class="row-label">{{ row.rowTitle }}</div>
      
      <div class="row-items">
        <div v-for="block in row.blocks" :key="block.id" class="block-wrapper">
          <div class="block-name">{{ block.title }}</div>

          <component 
            :is="componentsMap[block.type]" 
            v-bind="block.data"
            class="dynamic-content"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TextBlock from './blocks/TextBlock.vue';
import ImageBlock from './blocks/ImageBlock.vue';

defineProps<{ structure: any[] }>();

// Мапа, которая связывает строку из JSON с реальным компонентом
const componentsMap: Record<string, any> = {
  text: TextBlock,
  image: ImageBlock
};
</script>

<style scoped>
.layout-row {
  margin-bottom: 20px;
}

.row-label {
  font-weight: bold;
  margin-bottom: 10px;
}

/* Контейнер для блоков в одном ряду */
.row-items {
  display: flex;       /* Выстраивает блоки в ряд */
  flex-wrap: wrap;    /* Если блоков много, они перенесутся на новую строку */
  gap: 15px;          /* Расстояние между квадратиками */
}

.block-wrapper {
  width: 225px;       
  height: 225px;      
  background: white;
  border: 1px solid #d1d5db; /* Чуть более темная рамка */
  display: flex;
  flex-direction: column;
  padding: 0;           /* Убираем общий padding, чтобы заголовок прилипал к краям */
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 12px;  /* Более современные скругления */
  transition: transform 0.2s, box-shadow 0.2s;
}

/* Эффект при наведении */
.block-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.block-name { 
  font-size: 11px;
  font-weight: 800;      /* Жирный шрифт */
  text-transform: uppercase; /* Все заглавные */
  letter-spacing: 0.05em;
  color: #4b5563;
  background: #f9fafb;   /* Светло-серый фон для заголовка */
  padding: 8px 12px;     /* Внутренние отступы заголовка */
  border-bottom: 1px solid #e5e7eb; /* Полоска под заголовком */
  margin-bottom: 0;      /* Убираем лишний отступ */
}

.dynamic-content { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 10px;         /* Контент теперь имеет свои отступы */
}
</style>