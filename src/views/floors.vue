<script lang="ts" setup>
  import { useFloorsStore } from "@/store/floor.store";
  import { storeToRefs } from "pinia";
  import { onBeforeMount } from "vue";

  const floorsStore = useFloorsStore();
  const { fetchFloors, removeFloor } = floorsStore;
  const { floors } = storeToRefs(floorsStore);

  onBeforeMount(async () => {
    await fetchFloors();
  });

  async function deleteFloor(id: string) {
    await removeFloor(id);
  }
</script>

<template>
  <section>
    <div style="margin-bottom: 10px;">
      <RouterLink to="/create" class="btn d-flex">
        <span class="material-symbols-outlined"> add </span>
        <span> Create </span>
      </RouterLink>
    </div>
    <ul>
      <li v-for="floor in floors" :key="floor.id">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <button @click="deleteFloor(floor.id)" class="btn btn-danger d-flex">
            <span class="material-symbols-outlined" style="font-size: 18px; color: red;"> delete </span>
          </button>
          <RouterLink :to="'/edit/' + floor.id" style="color: red;">
            {{ floor.name }}
          </RouterLink>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
  section {
    padding: 20px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    margin: 0;
    padding: 0;
  }
</style>
