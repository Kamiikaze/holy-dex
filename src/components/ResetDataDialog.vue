<template>
  <v-dialog v-model="localOpen" max-width="600" persistent>
    <v-card>
      <v-card-title>Liste zurücksetzen?</v-card-title>
      <v-divider />
      <v-card-text> Willst du wirklich deine Liste zurücksetzen? </v-card-text>
      <v-divider />
      <v-card-actions class="flex-wrap">
        <v-spacer />
        <v-btn variant="outlined" @click="cancel">Abbrechen</v-btn>
        <v-btn variant="flat" color="error" @click="resetData"
          >Zurücksetzen</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {resetDrinks} from "../services/storage.ts";

export default defineComponent({
  name: "ResetDataDialog",
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ["update:modelValue"],
  methods: {
    cancel() {
      this.localOpen = false;
    },
      resetData() {
          resetDrinks()
          this.localOpen = false;
          window.location.reload()
      },
  },
  computed: {
    localOpen: {
      get(): boolean {
        return this.modelValue;
      },
      set(v: boolean) {
        this.$emit("update:modelValue", v);
      },
    },
  },
});
</script>
