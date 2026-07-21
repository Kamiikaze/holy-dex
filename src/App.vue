<template>
  <v-app>
    <v-app-bar flat absolute>
      <v-app-bar-title>
        🥤 HolyDex
        <span class="d-block mt-1 ml-2 text-mono text-title-small">
          {{
            viewingShared && shareTitle.length > 0
              ? "Liste: " + shareTitle
              : "Trink sie alle!"
          }}
        </span>
      </v-app-bar-title>
      <v-spacer />
      <v-btn
        v-if="viewingShared"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        @click="returnToOwnData"
        >Eigene Liste</v-btn
      >
      <v-btn
        prepend-icon="mdi-tray-arrow-down"
        :disabled="viewingShared"
        @click="triggerImport"
        >Import</v-btn
      >
      <v-btn prepend-icon="mdi-tray-arrow-up" @click="exportJson">Export</v-btn>
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
      <v-container fluid class="mb-2">
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
          <v-col cols="3" sm="2" md="3" />
          <v-col cols="12" sm="8" md="6">
            <v-text-field
              v-model="search"
              label="Suche"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              persistentClear
            />
          </v-col>
          <v-col cols="3" sm="2" md="3" />
        </v-row>

        <v-row class="mb-8">
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="kategorieFilter"
              label="Kategorie"
              :items="KATEGORIEN"
              clearable
              multiple
              chips
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="bewertungFilter"
              label="Bewertungen"
              :items="BEWERTUNGEN()"
              item-title="value"
              item-value="value"
              clearable
              multiple
              chips
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="limitiertFilter"
              label="Limitiert"
              :items="limitiertFilterOptions"
              item-title="label"
              item-value="value"
              hide-details
            />
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredDrinks"
          :search="search"
          :sortBy="[{ key: 'bewertung', order: 'desc' }]"
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
              variant="plain"
              density="compact"
              rows="1"
              max-rows="2"
              auto-grow
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

        <v-btn
          class="d-flex w-auto mx-auto mt-8"
          variant="outlined"
          color="error"
          prepend-icon="mdi-eraser"
          @click="showResetDialog = !showResetDialog"
          >Zurücksetzen
        </v-btn>
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

    <ResetDataDialog v-model="showResetDialog" />

    <!-- DrinkStats -->
    <!-- Toggle button -->
    <v-btn
      class="stats-toggle"
      color="primary"
      rounded="pill"
      prepend-icon="mdi-chart-bar"
      @click="showStats = !showStats"
    >
      Statistiken {{ showStats ? "schließen" : "" }}
    </v-btn>

    <!-- Dock -->
    <v-expand-transition>
      <div
        class="stats-dock"
        :class="showStats ? '' : 'hidden'"
        v-click-outside="{
          handler: () => (showStats = false),
          include: outsideClickInclude,
        }"
      >
        <div class="drag-handle" @click="showStats = false"></div>
        <div class="stats-content">
          <DrinkStats :drinks="drinks" />
        </div>
      </div>
    </v-expand-transition>

    <v-snackbar v-model="snackbar.show" :timeout="2500">{{
      snackbar.text
    }}</v-snackbar>

    <div id="app-version" class="text-disabled text-title-small">
      v{{ version }}
    </div>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DrinkFormDialog from "./components/DrinkFormDialog.vue";
import SharedImportDialog from "./components/SharedImportDialog.vue";
import { version } from "../package.json";
import {
  KATEGORIEN,
  bewertungMeta,
  type Drink,
  type Kategorie,
  BEWERTUNGEN,
  type Bewertung,
} from "./types/drink";
import {
  loadDrinks,
  saveDrinks,
  parseImportPayload,
  toExportPayload,
  PREDEFINED_DRINKS,
} from "./services/storage";
import {
  clearShareParamFromUrl,
  readSharedDrinksFromUrl,
} from "./services/share";
import ShareTitleDialog from "./components/ShareNameDialog.vue";
import DrinkStats from "./components/DrinkStats.vue";
import ResetDataDialog from "./components/ResetDataDialog.vue";

export default defineComponent({
  name: "App",
  components: {
    ResetDataDialog,
    DrinkStats,
    ShareTitleDialog,
    DrinkFormDialog,
    SharedImportDialog,
  },
  data() {
    return {
      version,
      KATEGORIEN,
      bewertungMeta,
      drinks: [] as Drink[],
      search: "",
      showStats: false,
      showResetDialog: false,
      kategorieFilter: [] as Kategorie[],
      bewertungFilter: [] as Bewertung[],
      limitiertFilter: 0,
      limitiertFilterOptions: [
        { label: "Alle anzeigen", value: 0 },
        { label: "Nur limitierte", value: 1 },
        { label: "Nicht limitierte", value: 2 },
      ],
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
        { title: "Notiz", key: "kommentar", sortable: false },
        { title: "", key: "actions", sortable: false, align: "end" as const },
      ],
    };
  },
  methods: {
    BEWERTUNGEN() {
      return BEWERTUNGEN;
    },
    outsideClickInclude() {
      return [document.querySelector(".stats-toggle")];
    },
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
  computed: {
    filteredDrinks(): Drink[] {
      let filteredList = this.drinks;

      if (this.kategorieFilter.length) {
        filteredList = filteredList.filter((d) =>
          this.kategorieFilter.includes(d.kategorie),
        );
      }

      if (this.bewertungFilter.length) {
        filteredList = filteredList.filter((d) =>
          d.bewertung ? this.bewertungFilter.includes(d.bewertung) : false,
        );
      }

      if (this.limitiertFilter > 0) {
        filteredList = filteredList.filter((d) =>
          this.limitiertFilter === 1 ? d.limitiert : !d.limitiert,
        );
      }

      return filteredList;
    },
  },
  mounted() {
    this.drinks = loadDrinks();
    const shared = readSharedDrinksFromUrl();
    console.log("shared", shared);
    if (shared && shared.drinks.length) {
      this.shareTitle = shared.title ?? "";
      this.sharedDrinks = shared.drinks;
      this.sharedPromptOpen = true;
    }
  },
});

function mergeById(existing: Drink[], incoming: Drink[]): Drink[] {
  const map = new Map(existing.map((d) => [d.id, d]));
  for (const d of incoming) map.set(d.id, d);
  return [...map.values()];
}
</script>

<style scoped>
.stats-toggle {
  position: fixed;
  bottom: 24px;
  left: 32px;
  z-index: 100;
  box-shadow: 0 0 10px 2px rgb(255 255 255 / 10%);
}
.stats-toggle:hover {
  box-shadow: 0 0 10px 2px rgb(255 255 255 / 33%);
}

.stats-dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 80vh;
  z-index: 99;
  padding: 8px;
  margin: 0 24px;
  background: rgb(255 255 255 / 0.1);
  backdrop-filter: blur(10px);
  border-radius: 32px 32px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  transition:
    opacity 0.7s ease-in-out,
    transform 0.5s ease-in-out;
}
.stats-dock.hidden {
  opacity: 0;
  transform: translate(0, 100%) scale(0.9);
}

.stats-content {
  max-height: calc(80vh - 40px);
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 32px;
}
.stats-content::-webkit-scrollbar {
  width: 8px;
}

.stats-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}
.stats-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.75);
}

.stats-content::-webkit-scrollbar-track {
  background: transparent;
}

.drag-handle {
  width: 70px;
  height: 8px;
  margin: 0 auto 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
}
.drag-handle:hover {
  border: 1px solid rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 10px 2px rgb(255 255 255 / 33%);
}
</style>
