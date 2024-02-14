<script setup lang="ts"></script>

<template>
  <section class="error-404">
    <h1>Error 404 | Not found</h1>
    <RouterLink to="/">Go Home</RouterLink>
  </section>
</template>

<style>
  .error-404 {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    text-align: center;
  }
</style>
