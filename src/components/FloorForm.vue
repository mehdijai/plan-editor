<script lang="ts" setup>
  import { ref } from "vue";

  interface Props {
    name: string;
  }
  const props = defineProps<Props>();

  const floor = ref(props.name);

  interface Emits {
    (e: "close"): void;
    (e: "save", name: string): void;
  }

  const emits = defineEmits<Emits>();

  function saveTable() {
    emits("save", floor.value);
  }
</script>

<template>
  <div class="modal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title">Les informations d'étage</h3>
      </div>

      <div class="modal-body">
        <form>
          <div class="mb-10">
            <label for="ref" class="required form-label">Nom</label>
            <input
              type="text"
              id="ref"
              class="form-control form-control-solid"
              placeholder="RDC"
              autofocus
              v-model="floor"
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
