<script lang="ts" setup>
  import { ref, onMounted, computed } from "vue";
  import type { Ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { getAssetPath } from "@/utils/assets";
  import { FloorEditor } from "@/utils/FloorEditor";
  import type { IFloor, ITable } from "@/types/tables.type";
  import TableForm from "@/components/TableForm.vue";
  import { useFloorsStore } from "@/store/floor.store";
  import Snack from "@/components/Snack.vue";

  const floorsStore = useFloorsStore();
  const { getFloor, updateFloor } = floorsStore;

  const canvas: Ref<HTMLCanvasElement | undefined> = ref();
  const _floorEditor = ref<FloorEditor>();

  const tables = ref<ITable[]>([]);
  const selectedTable = ref<ITable>();

  const isDirty = ref(false);
  const router = useRouter();
  const route = useRoute();

  const floorId = computed(() => String(route.params.id));

  const floorObj = ref<IFloor>();

  onMounted(async () => {
    floorObj.value = await getFloor(floorId.value);

    if (!canvas.value) return;
    _floorEditor.value = new FloorEditor(canvas.value);

    if (!floorObj.value) {
      router.push("/404");
      return;
    }

    const data = _floorEditor.value.importFloor(floorObj.value["plan-data"]);
    tables.value = data.map((el) => {
      return {
        ref: el.ref,
        floor_id: floorId.value,
        max_count: el.chairs,
        id: el.id,
      };
    });

    _floorEditor.value?.onIsClicked((ref: string | null) => {
      if (ref) {
        selectedTable.value = tables.value.find((table) => table.ref === ref);
      } else {
        selectedTable.value = undefined;
      }
    });

    _floorEditor.value?.onDeleted((ref: string | null) => {
      tables.value = tables.value.filter((it) => it.ref !== ref);
      selectedTable.value = undefined;
    });

    _floorEditor.value?.onIsDirty((value: boolean) => {
      isDirty.value = value;
    });

    const draggableElements = document.querySelectorAll(".draggable");
    draggableElements.forEach((element) => {
      element.addEventListener("dragstart", handleDragStart);
    });

    canvas.value.addEventListener("dragover", handleDragOver);
    canvas.value.addEventListener("drop", handleDrop);
  });

  function importTable(chairsCount: number, offsetX: number, offsetY: number) {
    isDirty.value = false;
    if (!_floorEditor.value) return;
    _floorEditor.value.insertTable(chairsCount, offsetX, offsetY)?.then((data) => {
      tables.value = data.map((el) => {
        return {
          ref: el.ref,
          floor_id: floorId.value,
          max_count: el.chairs,
          id: el.id,
        };
      });
    });
  }

  function handleDragStart(event: any) {
    event.dataTransfer.setData("chairs", event.target.dataset.chairs);
  }

  function handleDragOver(event: any) {
    event.preventDefault();
  }

  function handleDrop(event: any) {
    event.preventDefault();
    const chairsCount = parseInt(event.dataTransfer.getData("chairs"));
    const { offsetX, offsetY } = event;
    importTable(chairsCount, offsetX, offsetY);
  }

  const openTableFormModel = ref(false);

  function openTableForm() {
    openTableFormModel.value = true;
  }

  function closeTableForm() {
    openTableFormModel.value = false;
    // selectedTable.value = undefined;
  }

  function saveTableForm(table: ITable) {
    const matchTable = tables.value.find((tb) => tb.id === table.id);
    if (matchTable) {
      matchTable.max_count = table.max_count;
      const oldRef = structuredClone(matchTable.ref);
      matchTable.ref = table.ref;
      _floorEditor.value?.updateRef(oldRef, table.ref);
    }
    closeTableForm();
  }

  const submitting = ref(false);

  async function savePlan() {
    submitting.value = true;
    if (_floorEditor.value && floorObj.value) {
      const { plan, schema } = _floorEditor.value.exportPlan();
      selectedTable.value = undefined;
      isDirty.value = false;
      floorObj.value.plan = plan;
      floorObj.value["plan-data"] = JSON.stringify(schema);
      updateFloor(floorObj.value);
    }
    submitting.value = false;
  }

  function deleteTable() {
    if (_floorEditor.value) {
      _floorEditor.value.removeSelectedTable();
    }
  }

  function quit() {
    router.push("/");
  }

  const helped = ref(localStorage.getItem("rotation-help") !== null);

  function closeHelpSnack() {
    helped.value = true;
    localStorage.setItem("rotation-help", "1");
  }
</script>
<template>
  <section class="plan-editor">
    <Snack v-if="!helped" @close="closeHelpSnack" />
    <TableForm
      @close="closeTableForm"
      @save="saveTableForm"
      :table-data="selectedTable"
      v-if="selectedTable && openTableFormModel"
    />
    <aside class="toolbar">
      <ul>
        <li class="controllers-wrapper">
          <div class="controllers">
            <button @click="quit" class="btn btn-danger d-flex" style="color: red">
              <span class="material-symbols-outlined" style="color: red"> logout </span>
              Quitter
            </button>
            <button
              :disabled="!isDirty"
              @click="savePlan"
              class="btn d-flex"
              :style="isDirty ? 'color: green;' : ''"
              :class="isDirty ? 'btn-success' : 'btn-dark'"
            >
              <span class="material-symbols-outlined" :style="isDirty ? 'color: green;' : ''">
                done_all
              </span>
              Enregistrer
            </button>
            <button
              v-if="selectedTable"
              @click="openTableForm"
              class="btn btn-primary d-flex"
              style="color: #646cff"
            >
              <span class="material-symbols-outlined" style="color: #646cff"> edit </span>
              Modifier les info
            </button>
            <button
              v-if="selectedTable"
              @click="deleteTable"
              class="btn btn-danger d-flex"
              style="color: red"
            >
              <span class="material-symbols-outlined" style="color: red"> delete </span>
              Supprimer
            </button>
          </div>
        </li>

        <li>
          <img
            draggable
            class="draggable"
            data-chairs="2"
            :src="getAssetPath('tables/table-2.svg')"
          />
        </li>
        <li>
          <img
            draggable
            class="draggable"
            data-chairs="4"
            :src="getAssetPath('tables/table-4.svg')"
          />
        </li>
        <li>
          <img
            draggable
            class="draggable"
            data-chairs="6"
            :src="getAssetPath('tables/table-6.svg')"
          />
        </li>
      </ul>
    </aside>
    <div class="wrapper">
      <canvas ref="canvas"></canvas>
    </div>
  </section>
</template>
