<template>
  <v-dialog v-model="localOpen" max-width="440" persistent>
    <v-card>
      <v-card-title>Geteilte Liste gefunden</v-card-title>
      <v-card-text>
        Der Link enthält {{ count }} Drink(s). Wie möchtest du sie übernehmen?
      </v-card-text>
      <v-card-actions class="flex-wrap">
        <v-btn variant="text" @click="$emit('discard')">Ignorieren</v-btn>
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('merge')">Zusammenführen</v-btn>
        <v-btn color="primary" variant="flat" @click="$emit('replace')">Ersetzen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SharedImportDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    count: { type: Number, required: true },
  },
  emits: ['update:modelValue', 'merge', 'replace', 'discard'],
  computed: {
    localOpen: {
      get(): boolean {
        return this.modelValue
      },
      set(v: boolean) {
        this.$emit('update:modelValue', v)
      },
    },
  },
})
</script>
