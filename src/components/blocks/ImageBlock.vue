<template>
  <div class="image-block-inner">
    <img :src="src" class="responsive-img" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ src: string }>();
</script>

<style scoped>
.image-block-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px; /* Добавляем внутренний отступ, чтобы картинка не касалась рамок */
  box-sizing: border-box;
}

.responsive-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Картинка сохранит пропорции и не обрежется */
  border-radius: 4px;  /* Мягкие углы у самой картинки */
}
</style>