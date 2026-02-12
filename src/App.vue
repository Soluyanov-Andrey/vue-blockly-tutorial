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
        <SitePreview :structure="mySiteObject" />
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useCompiler } from './compiler'; // Импортируем шлюз
import { useBlockly } from './composables/useBlockly'
import SitePreview from './components/SitePreview.vue'


import img_block1 from './assets/b1.png'
import img_block3 from './assets/b3.png'
import img_block5 from './assets/b5.png'
import img_block6 from './assets/b6.png'
import img_block8 from './assets/b8.png'


const activeTab = ref<'editor' | 'site'>('editor')

// 1. Инициализируем компилятор
const { compile } = useCompiler()

// 1. Подключаем Blockly
const { latestJson, resizeBlockly } = useBlockly()

// 3. Структура сайта теперь пустая по умолчанию
const mySiteObject = ref<any[]>([])

/**
 * ГЛАВНЫЙ ПРОЦЕСС ОБНОВЛЕНИЯ
 * следим за JSON из Blockly. Как только он изменился — прогоняем через компилятор.
 */
watch(latestJson, (newRawData) => {
  if (newRawData) {
    // Шлюз принимает сырой JSON и превращает его в структуру сайта
    mySiteObject.value = compile(newRawData)
  }
}, { immediate: true, deep: true })




// 3. Следим за переключением вкладок для корректного ресайза Blockly
watch(activeTab, async (newTab) => {
  if (newTab === 'editor') {
    await nextTick()
    resizeBlockly() // Вызываем  функцию из useBlockly
  }
})
// Временный тест для проверки шлюза
setTimeout(() => {
  console.log("Тест: Имитируем приход данных из Blockly...");
  
  // Записываем данные в latestJson, за которым следит наш watch
  latestJson.value = [
    {
      rowId: "test_row_from_gateway",
      rowTitle: "Проверка шлюза",
      blocks: [
        { 
          id: "T1", 
          type: "text", 
          title: "Успех!", 
          data: { content: "Если ты видишь этот текст, значит шлюз работает!" } 
        }
      ]
    }
  ];
}, 2000);

</script>

<style>
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
  flex-shrink: 0;
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
  flex-grow: 1;
  position: relative;
  background: #eee;
}

/* Стили для BlocklyArea (твои оригинальные) */
#blocklyArea {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

#blocklyDiv {
  position: absolute;
}

/* Стили для области сайта */
.site-preview-area {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #f0f2f5;
}
</style>
