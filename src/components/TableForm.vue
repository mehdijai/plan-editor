<script lang="ts" setup>
  import type { ITable } from "@/types/tables.type";
  import { ref } from "vue";

  interface Props {
    tableData: ITable;
  }
  const props = defineProps<Props>();

  const table = ref({ ...props.tableData });

  interface Emits {
    (e: "close"): void;
    (e: "save", table: ITable): void;
  }

  const emits = defineEmits<Emits>();

  function saveTable() {
    emits("save", table.value);
  }
</script>

<template>
  <div class="modal">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-header">
        <h3 class="modal-title">Les informations de la table</h3>
      </div>

      <div class="modal-body">
        <form>
          <div class="mb-10">
            <label for="ref" class="required form-label">Ref</label>
            <input
              type="text"
              id="ref"
              maxlength="3"
              class="form-control form-control-solid"
              placeholder="A5"
              autofocus
              v-model="table.ref"
            />
          </div>
          <div class="mb-10">
            <label for="chairs" class="required form-label">Nb Chaises</label>
            <input
              disabled
              type="number"
              id="chairs"
              class="form-control form-control-solid"
              placeholder="5"
              v-model="table.max_count"
            />
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn btn-light" data-bs-dismiss="modal">
          Fermer
        </button>
        <button @click="saveTable" type="button" class="btn btn-primary">Enregistrer</button>
      </div>
    </div>
  </div>
</template>
