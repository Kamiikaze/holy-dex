<template>
  <v-dialog v-model="localOpen" max-width="520" persistent>
    <v-card>
      <v-card-title>
          Drink bearbeiten
      </v-card-title>
        <v-divider />
      <v-card-text>
        <v-form ref="formRef" v-model="valid">

          <div id="bewertung-chip-group" class="d-flex flex-row align-center ga-4 mb-2">
            <h2 class="text-title-medium my-0>">Bewertung:</h2>
            <v-chip-group v-model="form.bewertung" :items="BEWERTUNGEN">
              <div v-for="(item, index) in BEWERTUNGEN" :key="index">
                <v-tooltip :text="item.label" location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-chip
                      v-bind="props"
                      :baseColor="item.color"
                      :value="item.value"
                      variant="outlined"
                    >
                      {{ item.value }}
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
            </v-chip-group>
          </div>

          <v-textarea
            v-model="form.kommentar"
            label="Kommentar"
            variant="outlined"
            rounded="lg"
            rows="3"
            auto-grow
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">Abbrechen</v-btn>
        <v-btn color="success" variant="flat" @click="save">Speichern</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { BEWERTUNGEN, type Drink } from "../types/drink";
import { makeId } from "../services/storage";

function emptyDrink(): Drink {
  return {
    id: makeId(),
    kategorie: "Energy",
    sorte: "",
    geschmack: "",
    limitiert: false,
    bewertung: null,
    kommentar: "",
  };
}

export default defineComponent({
  name: "DrinkFormDialog",
  props: {
    modelValue: { type: Boolean, required: true },
    editDrink: { type: Object as PropType<Drink | null>, default: null },
  },
  emits: ["update:modelValue", "save"],
  data() {
    return {
      BEWERTUNGEN,
      valid: true,
      form: emptyDrink(),
    };
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
    isEdit(): boolean {
      return !!this.editDrink;
    },
  },
  watch: {
    modelValue(open: boolean) {
      if (open) {
        this.form = this.editDrink ? { ...this.editDrink } : emptyDrink();
      }
    },
  },
  methods: {
    cancel() {
      this.localOpen = false;
    },
    save() {
      this.$emit("save", { ...this.form });
      this.localOpen = false;
    },
  },
});
</script>
