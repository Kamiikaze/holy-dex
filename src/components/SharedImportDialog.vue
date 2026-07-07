<template>
  <v-dialog v-model="localOpen" max-width="600" persistent>
    <v-card>
      <v-card-title>Geteilte Liste gefunden</v-card-title>
      <v-divider />
      <v-card-text>
        Die geteilte Liste <v-code v-if="title">{{ title }}</v-code> enthält
        {{ count }} Drink(s).<br /><br />
        Wie möchtest du sie übernehmen?
      </v-card-text>
      <v-divider />
      <v-card-actions class="flex-wrap">
        <v-btn variant="text" @click="$emit('discard')">Ignorieren</v-btn>
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('view')">Nur ansehen</v-btn>
        <v-btn variant="outlined" @click="$emit('merge')">Zusammenführen</v-btn>
        <v-btn color="warning" variant="flat" @click="$emit('replace')"
          >Ersetzen</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SharedImportDialog",
  props: {
    modelValue: { type: Boolean, required: true },
    count: { type: Number, required: true },
    title: { type: String, required: false },
  },
  emits: ["update:modelValue", "view", "merge", "replace", "discard"],
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
