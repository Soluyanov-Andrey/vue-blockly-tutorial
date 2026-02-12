<template>
  <div class="text-block-inner">
    {{ content }}
  </div>
</template>

<script setup lang="ts">
// Это КРИТИЧЕСКИ важно: имя 'content' должно совпадать с ключом в data
defineProps<{
  content: string
}>()

</script>

<style scoped>
.text-block-inner {
  padding: 10px;
  color: #333;
  text-align: center;
  word-break: break-word; /* Чтобы длинный текст не вылезал */
}
</style>