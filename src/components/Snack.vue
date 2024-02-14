<script lang="ts" setup>
  interface Emits {
    (e: "close"): void;
  }

  const emits = defineEmits<Emits>();
</script>

<template>
  <div class="snack">
    <span @click="$emit('close')" class="material-symbols-outlined icon"> close </span>
    <p>Shift and Mouse click on table to rotate it 45°</p>
  </div>
</template>

<style>
  .snack {
    position: absolute;
    bottom: 10px;
    right: 50%;
    z-index: 1;
    transform: translateX(50%);
    background-color: #213547;
    color: white;
    padding: 10px 15px;
    border-radius: 10px;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .snack .icon {
    font-size: 18px;
    background-color: #283e51;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
  }
  .snack .icon:hover {
    background-color: #223546;
  }
  .snack p {
    margin: 0;
    padding: 0;
  }
</style>
