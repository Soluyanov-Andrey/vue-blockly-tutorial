<template>
  <div class="site-preview">
    <header class="preview-header">
      <h1>Предпросмотр моего мини-сайта</h1>
    </header>
    
    <div class="preview-content">
      <div v-if="pageData.length === 0" class="empty-state">
        На рабочем столе пока нет блоков...
      </div>
      
      <div v-for="block in pageData" :key="block.id" class="render-item">
        <div v-if="block.type === 'custom_print'" class="card">
          <h3>Карточка: {{ block.fields?.NAME || 'Без имени' }}</h3>
          <p>{{ block.message }}</p>
        </div>
        
        <div v-else-if="block.type === 'group_container'" class="container-box">
          <strong>Контейнер: {{ block.fields?.NAME }}</strong>
          <div class="nested">Внутри этого блока: {{ block.children?.length || 0 }} эл.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pageData: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.site-preview { padding: 20px; font-family: sans-serif; }
.card { border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin-bottom: 10px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.container-box { border: 2px dashed #995ba5; padding: 10px; background: #fdf5ff; }
.nested { font-size: 0.8em; color: #666; }
</style>