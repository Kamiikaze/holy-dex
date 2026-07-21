<template>
  <v-dialog v-model="localOpen" max-width="600" persistent>
    <v-card>
      <v-card-title>Link zum teilen erstellen</v-card-title>
      <v-divider />
      <v-card-text>
        Gib ein Titel für deine Liste ein. (z.B. dein Name) <br />
        Andere die dein Link öffnen, sehen dann den Titel der Liste.

        <v-text-field
          v-model="shareTitle"
          class="mt-4"
          variant="outlined"
          label="Titel der Liste (optional)"
          hide-details
        />
      </v-card-text>
      <v-divider />
      <v-card-actions class="flex-wrap">
        <v-btn variant="text" @click="close">Abbrechen</v-btn>
        <v-spacer />
        <v-btn color="success" variant="flat" @click="shareUrl"
          >Erstellen</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { buildShareUrl } from "../services/share.ts";
import type { Drink } from "../types/drink.ts";

export default defineComponent({
  name: "ShareTitleDialog",
  props: {
    modelValue: { type: Boolean, required: true },
    shareList: { type: Array as PropType<Drink[]>, required: true },
  },
  emits: ["update:modelValue", "msg"],
  data() {
    return {
      shareTitle: "",
    };
  },
  methods: {
    close() {
      this.localOpen = false;
    },
    async shareUrl() {
      const url = buildShareUrl(this.shareList, this.shareTitle);
      try {
        await navigator.clipboard.writeText(url);
        this.$emit("msg", "Link in Zwischenablage kopiert");
        this.close();
      } catch {
        prompt("Link kopieren:", url);
      }
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
