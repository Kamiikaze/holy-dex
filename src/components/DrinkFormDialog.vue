<template>
  <v-dialog v-model="localOpen" max-width="520" persistent>
    <v-card>
      <v-card-title>{{ isEdit ? 'Drink bearbeiten' : 'Neuer Drink' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="valid">
          <v-select
            v-model="form.kategorie"
            :items="KATEGORIEN"
            label="Kategorie"
            :rules="[required]"
          />
          <v-text-field v-model="form.sorte" label="Sorte" :rules="[required]" />
          <v-text-field v-model="form.geschmack" label="Geschmack" />
          <v-select
            v-model="form.bewertung"
            :items="BEWERTUNGEN"
            item-title="label"
            item-value="value"
            label="Bewertung"
            :rules="[required]"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-chip :color="(item as any).raw.color" size="small" class="mr-2">{{ (item as any).raw.value }}</v-chip>
                </template>
              </v-list-item>
            </template>
          </v-select>
          <v-switch v-model="form.limitiert" label="Limitiert" color="primary" />
          <v-textarea v-model="form.kommentar" label="Kommentar" rows="3" auto-grow />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">Abbrechen</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!valid" @click="save">Speichern</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { KATEGORIEN, BEWERTUNGEN, type Drink } from '../types/drink'
import { makeId } from '../services/storage'

function emptyDrink(): Drink {
  return {
    id: makeId(),
    kategorie: 'Energy',
    sorte: '',
    geschmack: '',
    limitiert: false,
    bewertung: 'C',
    kommentar: '',
  }
}

export default defineComponent({
  name: 'DrinkFormDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    editDrink: { type: Object as PropType<Drink | null>, default: null },
  },
  emits: ['update:modelValue', 'save'],
  data() {
    return {
      KATEGORIEN,
      BEWERTUNGEN,
      valid: false,
      form: emptyDrink(),
      required: (v: string) => !!v || 'Pflichtfeld',
    }
  },
  computed: {
    localOpen: {
      get(): boolean {
        return this.modelValue
      },
      set(v: boolean) {
        this.$emit('update:modelValue', v)
      },
    },
    isEdit(): boolean {
      return !!this.editDrink
    },
  },
  watch: {
    modelValue(open: boolean) {
      if (open) {
        this.form = this.editDrink ? { ...this.editDrink } : emptyDrink()
      }
    },
  },
  methods: {
    cancel() {
      this.localOpen = false
    },
    save() {
      this.$emit('save', { ...this.form })
      this.localOpen = false
    },
  },
})
</script>
