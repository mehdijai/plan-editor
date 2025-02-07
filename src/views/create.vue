<script lang="ts" setup>
  import { getAssetPath } from "@/utils/assets";
  import { FloorEditor } from "@/utils/FloorEditor";
  import { ref, onMounted } from "vue";
  import type { Ref } from "vue";
  import type { IFloor, ITable } from "@/types/tables.type";
  import TableForm from "@/components/TableForm.vue";
  import { useRouter } from "vue-router";
  import { createId } from "@paralleldrive/cuid2";
  import Snack from "@/components/Snack.vue";
  import { useFloorsStore } from "@/store/floor.store";
  import FloorForm from "@/components/FloorForm.vue";

  const floorsStore = useFloorsStore();
  const { createFloor } = floorsStore;

  const floorId = ref(createId());

  const floorObj = ref<IFloor>({
    id: floorId.value,
    name: "",
    plan: "",
    "plan-data": "",
  });

  const canvas: Ref<HTMLCanvasElement | undefined> = ref();
  const _floorEditor = ref<FloorEditor>();

  const tables = ref<ITable[]>([]);
  const selectedTable = ref<ITable>();

  const isDirty = ref(false);

  onMounted(async () => {
    if (!canvas.value) return;
    _floorEditor.value = new FloorEditor(canvas.value);

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

  const router = useRouter();

  function savePlan() {
    if (floorObj.value.name === "") {
      openFloorFormModel.value = true;
    } else {
      if (_floorEditor.value) {
        const { plan, schema } = _floorEditor.value.exportPlan();
        selectedTable.value = undefined;
        isDirty.value = false;
        floorObj.value.plan = plan;
        floorObj.value["plan-data"] = JSON.stringify(schema);
        createFloor(floorObj.value);
        // router.push("/flooreditor/" + floorId.value);
        router.push("/");
      }
    }
  }

  function deleteTable() {
    if (_floorEditor.value) {
      _floorEditor.value.removeSelectedTable();
    }
  }

  function quit() {
    router.push("/");
  }

  const openFloorFormModel = ref(false);

  function saveFloorName(name: string) {
    floorObj.value.name = name;
    closeFloorForm();
    savePlan();
  }

  function closeFloorForm() {
    openFloorFormModel.value = false;
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
    <FloorForm
      @close="closeFloorForm"
      @save="saveFloorName"
      :name="floorObj.name"
      v-if="openFloorFormModel"
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
