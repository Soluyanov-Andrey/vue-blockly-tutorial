<template>
  <div id="app-container">
    <header class="top-nav">
      <button 
        :class="{ active: activeTab === 'editor' }" 
        @click="activeTab = 'editor'"
      >
        🛠 Рабочий стол
      </button>
      <button 
        :class="{ active: activeTab === 'site' }" 
        @click="activeTab = 'site'"
      >
        🌐 Посмотреть сайт
      </button>
    </header>

    <main class="main-content">
      
      <div v-show="activeTab === 'editor'" id="blocklyArea">
        <div id="blocklyDiv"></div>
      </div>

      <div v-if="activeTab === 'site'" class="site-preview-area">
        <SitePreview :page-data="globalJson" />
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useBlockly } from './composables/useBlockly'
import SitePreview from './components/SitePreview.vue' // Создай этот файл

const activeTab = ref<'editor' | 'site'>('editor')

// Подключаем твою магию Blockly
// Важно: useBlockly внутри себя ищет id="blocklyDiv"
const { latestJson, resizeBlockly } = useBlockly()

// Глобальный JSON для сайта (синхронизируем с тем, что дает composable)
const globalJson = latestJson 

// КРИТИЧЕСКИЙ МОМЕНТ:
// Когда мы возвращаемся на вкладку 'editor', нам нужно заново пересчитать размеры
watch(activeTab, async (newTab) => {
  if (newTab === 'editor') {
    await nextTick() // Ждем, пока Vue покажет div обратно
    resizeBlockly()  // Вызываем твою функцию ресайза
  }
})
</script>

<style>
/* Сбрасываем дефолты */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
}

#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-nav {
  height: 50px;
  background: #2c3e50;
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 10px;
  flex-shrink: 0; /* Чтобы шапка не сжималась */
}

.top-nav button {
  padding: 8px 16px;
  background: #34495e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.top-nav button.active {
  background: #42b983;
}

.main-content {
  flex-grow: 1; /* Занимает всё оставшееся место */
  position: relative; /* Важно для абсолютного позиционирования внутри */
}

/* Твои оригинальные стили для Blockly */
#blocklyArea {
  position: absolute;
  inset: 0; /* Занимает всю main-content */
  width: 100%;
  height: 100%;
}

#blocklyDiv {
  position: absolute;
}

/* Стили для сайта */
.site-preview-area {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: white;
}
</style>
