<template>
  <v-app>
    <v-app-bar flat scrollBehavior="elevate">
      <v-app-bar-title>
        🥤 HOLY Softdrinks
        <span
          v-if="viewingShared && shareTitle.length > 0"
          class="d-block mt-1 ml-2 text-mono text-title-medium"
        >
          Liste: {{ shareTitle }}
        </span>
      </v-app-bar-title>
      <v-spacer />
      <v-btn
        v-if="viewingShared"
        prepend-icon="mdi-arrow-left"
        @click="returnToOwnData"
        >Eigene Liste</v-btn
      >
      <v-btn
        prepend-icon="mdi-tray-arrow-up"
        :disabled="viewingShared"
        @click="triggerImport"
        >Import</v-btn
      >
      <v-btn prepend-icon="mdi-tray-arrow-down" @click="exportJson"
        >Export</v-btn
      >
      <v-btn
        prepend-icon="mdi-share-variant"
        @click="shareTitlePrompOpen = true"
        >Teilen</v-btn
      >

      <input
        ref="fileInput"
        type="file"
        accept="application/json"
        class="d-none"
        @change="onFileChosen"
      />
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-alert
          v-if="viewingShared"
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-4"
        >
          Geteilte Liste wird nur angezeigt. Deine gespeicherte Liste bleibt
          unverändert.
        </v-alert>

        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              label="Suche"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="kategorieFilter"
              :items="KATEGORIEN"
              label="Kategorie"
              clearable
              multiple
              chips
              hide-details
            />
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredDrinks"
          :search="search"
          item-key="id"
          items-per-page="25"
        >
          <template #item.bewertung="{ item }">
            <v-tooltip
              v-if="item.bewertung"
              :text="bewertungMeta(item.bewertung).label"
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <v-chip
                  v-bind="props"
                  :color="bewertungMeta(item.bewertung).color"
                  size="large"
                >
                  {{ item.bewertung }}
                </v-chip>
              </template>
            </v-tooltip>
          </template>
          <template #item.limitiert="{ item }">
            <v-icon
              v-if="item.limitiert"
              color="amber"
              icon="mdi-star"
              size="small"
            />
          </template>
          <template #item.kommentar="{ item }">
            <v-textarea
              v-if="item.kommentar"
              v-model="item.kommentar"
              class="ma-auto text-disabled"
              variant="outlined"
              density="compact"
              rows="1"
              max-rows="2"
              hide-details
              readonly
            ></v-textarea>
          </template>
          <template #item.actions="{ item }">
            <template v-if="!viewingShared">
              <v-tooltip text="Bearbeiten" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click="openEdit(item)"
                  />
                </template>
              </v-tooltip>
            </template>
          </template>
        </v-data-table>
      </v-container>
    </v-main>

    <DrinkFormDialog
      v-model="dialogOpen"
      :edit-drink="editing"
      @save="saveDrink"
    />

    <SharedImportDialog
      v-model="sharedPromptOpen"
      :count="sharedDrinks.length"
      :title="shareTitle"
      @view="viewShared"
      @merge="applySharedMerge"
      @replace="applySharedReplace"
      @discard="dismissShared"
    />

    <ShareTitleDialog
      v-model="shareTitlePrompOpen"
      @msg="notify"
      :shareList="drinks"
    />

    <v-snackbar v-model="snackbar.show" :timeout="2500">{{
      snackbar.text
    }}</v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DrinkFormDialog from "./components/DrinkFormDialog.vue";
import SharedImportDialog from "./components/SharedImportDialog.vue";
import {
  KATEGORIEN,
  bewertungMeta,
  type Drink,
  type Kategorie,
} from "./types/drink";
import {
  loadDrinks,
  saveDrinks,
  parseImportPayload,
  toExportPayload,
  PREDEFINED_DRINKS,
} from "./services/storage";
import {
  readSharedDrinksFromUrl,
  clearShareParamFromUrl,
} from "./services/share";
import ShareTitleDialog from "./components/ShareNameDialog.vue";

export default defineComponent({
  name: "App",
  components: { ShareTitleDialog, DrinkFormDialog, SharedImportDialog },
  data() {
    return {
      KATEGORIEN,
      bewertungMeta,
      drinks: [] as Drink[],
      search: "",
      kategorieFilter: [] as Kategorie[],
      dialogOpen: false,
      editing: null as Drink | null,
      shareTitle: "",
      sharedPromptOpen: false,
      sharedDrinks: [] as Drink[],
      shareTitlePrompOpen: false,
      viewingShared: false,
      ownDrinks: [] as Drink[],
      snackbar: { show: false, text: "" },
      headers: [
        { title: "Kategorie", key: "kategorie" },
        { title: "Sorte", key: "sorte" },
        { title: "Geschmack", key: "geschmack" },
        {
          title: "Limitiert",
          key: "limitiert",
          sortable: false,
          align: "center" as const,
        },
        { title: "Bewertung", key: "bewertung", align: "center" as const },
        { title: "Kommentar", key: "kommentar", sortable: false },
        { title: "", key: "actions", sortable: false, align: "end" as const },
      ],
    };
  },
  computed: {
    filteredDrinks(): Drink[] {
      if (!this.kategorieFilter.length) return this.drinks;
      return this.drinks.filter((d) =>
        this.kategorieFilter.includes(d.kategorie),
      );
    },
  },
  mounted() {
    this.drinks = loadDrinks();
    const shared = readSharedDrinksFromUrl();
    if (shared && shared.drinks.length) {
      this.shareTitle = shared.shareTitle ?? "";
      this.sharedDrinks = shared.drinks;
      this.sharedPromptOpen = true;
    }
  },
  methods: {
    persist() {
      if (this.viewingShared) return;
      saveDrinks(this.drinks);
    },
    openEdit(drink: Drink) {
      if (this.viewingShared) return;
      this.editing = drink;
      this.dialogOpen = true;
    },
    saveDrink(drink: Drink) {
      if (this.viewingShared) return;
      const idx = this.drinks.findIndex((d) => d.id === drink.id);
      if (idx >= 0) this.drinks.splice(idx, 1, drink);
      else this.drinks.push(drink);
      this.persist();
      this.notify("Gespeichert");
    },
    triggerImport() {
      if (this.viewingShared) return;
      (this.$refs.fileInput as HTMLInputElement).click();
    },
    onFileChosen(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = parseImportPayload(String(reader.result));
          this.drinks = mergeById(this.drinks, imported.drinks);
          this.persist();
          this.notify(`${imported.drinks.length} Drinks importiert`);
        } catch (err) {
          this.notify(
            err instanceof Error ? err.message : "Import fehlgeschlagen",
          );
        }
      };
      reader.readAsText(file);
      (e.target as HTMLInputElement).value = "";
    },
    exportJson() {
      const payload = toExportPayload(this.drinks);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `holy-drinks-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    viewShared() {
      this.ownDrinks = this.drinks.map((drink) => ({ ...drink }));
      this.drinks = this.sharedDrinks.map((drink) => ({ ...drink }));
      this.viewingShared = true;
      this.dismissShared();
      this.notify("Geteilte Liste wird angezeigt");
    },
    returnToOwnData() {
      this.drinks = this.ownDrinks.map((drink) => ({ ...drink }));
      this.ownDrinks = [];
      this.viewingShared = false;
      this.notify("Eigene Liste wiederhergestellt");
    },
    applySharedMerge() {
      this.drinks = mergeById(this.drinks, this.sharedDrinks);
      this.persist();
      this.dismissShared();
      this.notify("Zusammengeführt");
    },
    applySharedReplace() {
      this.drinks = mergeById(PREDEFINED_DRINKS, this.sharedDrinks);
      this.persist();
      this.dismissShared();
      this.notify("Liste ersetzt");
    },
    dismissShared() {
      this.sharedPromptOpen = false;
      this.sharedDrinks = [];
      clearShareParamFromUrl();
    },
    notify(text: string) {
      this.snackbar = { show: true, text };
    },
  },
});

function mergeById(existing: Drink[], incoming: Drink[]): Drink[] {
  const map = new Map(existing.map((d) => [d.id, d]));
  for (const d of incoming) map.set(d.id, d);
  return [...map.values()];
}
</script>
