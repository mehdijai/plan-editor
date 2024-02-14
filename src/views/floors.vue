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
  <div>
    <RouterLink to="/create" class="btn btn-light-success btn-icon-success btn-text-success">
      <i class="ki-duotone ki-double-check fs-1">
        <span class="path1"></span>
        <span class="path2"></span>
      </i>
      Create
    </RouterLink>
    <ul>
      <li v-for="floor in floors" :key="floor.id">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px">
          <button
            @click="deleteFloor(floor.id)"
            class="btn btn-light-danger btn-icon-danger btn-text-danger"
          >
            <i class="ki-duotone ki-trash fs-5">
              <span class="path1"></span>
              <span class="path2"></span>
              <span class="path3"></span>
              <span class="path4"></span>
              <span class="path5"></span>
            </i>
          </button>
          <RouterLink :to="'/edit/' + floor.id">
            {{ floor.name }}
          </RouterLink>
        </div>
      </li>
    </ul>
  </div>
</template>

<style></style>
