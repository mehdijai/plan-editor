import { ref } from "vue";
import { defineStore } from "pinia";
import { IFloor } from "@/types/tables.type";

export const useFloorsStore = defineStore("floors", () => {
  const floors = ref<IFloor[]>([]);

  function updateFloor(data: IFloor) {
    const match = floors.value.find((fl) => fl.id === data.id);
    if (match) {
      match.name = data.name;
      match.plan = data.plan;
      match["plan-data"] = data["plan-data"];
      match.tables = data.tables;
      saveData();
    }
  }

  function createFloor(data: IFloor) {
    floors.value.push(data);
    saveData();
  }

  function getFloor(id: string) {
    fetchFloors();
    return floors.value.find((floor) => floor.id === id);
  }

  function removeFloor(id: string) {
    floors.value = floors.value.filter((el) => el.id !== id);
    saveData();
  }

  function fetchFloors() {
    const saved = localStorage.getItem("floors");
    if (saved) {
      floors.value = JSON.parse(saved);
    }
  }

  function saveData() {
    localStorage.setItem("floors", JSON.stringify(floors.value));
  }

  return {
    floors,
    updateFloor,
    createFloor,
    getFloor,
    fetchFloors,
    removeFloor,
  };
});
