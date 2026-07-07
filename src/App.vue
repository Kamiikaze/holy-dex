<template>
  <v-app>
    <v-app-bar flat color="surface">
      <v-app-bar-title>🥤 HOLY Softdrinks</v-app-bar-title>
      <v-spacer />
      <v-btn prepend-icon="mdi-plus" @click="openAdd">Neu</v-btn>
      <v-btn prepend-icon="mdi-tray-arrow-up" @click="triggerImport">Import</v-btn>
      <v-btn prepend-icon="mdi-tray-arrow-down" @click="exportJson">Export</v-btn>
      <v-btn prepend-icon="mdi-share-variant" @click="shareUrl">Teilen</v-btn>
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
        <v-row class="mb-2">
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="search" label="Suche" prepend-inner-icon="mdi-magnify" clearable hide-details />
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
        >
          <template #item.bewertung="{ item }">
            <v-chip :color="bewertungMeta(item.bewertung).color" size="small">
              {{ item.bewertung }}
            </v-chip>
          </template>
          <template #item.limitiert="{ item }">
            <v-icon v-if="item.limitiert" color="amber" icon="mdi-star" size="small" />
          </template>
          <template #item.actions="{ item }">
            <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
            <v-btn icon="mdi-delete" variant="text" size="small" @click="remove(item.id)" />
          </template>
        </v-data-table>
      </v-container>
    </v-main>

    <DrinkFormDialog v-model="dialogOpen" :edit-drink="editing" @save="saveDrink" />

    <SharedImportDialog
      v-model="sharedPromptOpen"
      :count="sharedDrinks.length"
      @merge="applySharedMerge"
      @replace="applySharedReplace"
      @discard="dismissShared"
    />

    <v-snackbar v-model="snackbar.show" :timeout="2500">{{ snackbar.text }}</v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DrinkFormDialog from './components/DrinkFormDialog.vue'
import SharedImportDialog from './components/SharedImportDialog.vue'
import { KATEGORIEN, bewertungMeta, type Drink, type Kategorie } from './types/drink'
import { loadDrinks, saveDrinks, parseImportPayload, toExportPayload } from './services/storage'
import { buildShareUrl, readSharedDrinksFromUrl, clearShareParamFromUrl } from './services/share'

export default defineComponent({
  name: 'App',
  components: { DrinkFormDialog, SharedImportDialog },
  data() {
    return {
      KATEGORIEN,
      bewertungMeta,
      drinks: [] as Drink[],
      search: '',
      kategorieFilter: [] as Kategorie[],
      dialogOpen: false,
      editing: null as Drink | null,
      sharedPromptOpen: false,
      sharedDrinks: [] as Drink[],
      snackbar: { show: false, text: '' },
      headers: [
        { title: 'Kategorie', key: 'kategorie' },
        { title: 'Sorte', key: 'sorte' },
        { title: 'Geschmack', key: 'geschmack' },
        { title: 'Limitiert', key: 'limitiert', sortable: false },
        { title: 'Bewertung', key: 'bewertung' },
        { title: 'Kommentar', key: 'kommentar', sortable: false },
        { title: '', key: 'actions', sortable: false, align: 'end' as const },
      ],
    }
  },
  computed: {
    filteredDrinks(): Drink[] {
      if (!this.kategorieFilter.length) return this.drinks
      return this.drinks.filter((d) => this.kategorieFilter.includes(d.kategorie))
    },
  },
  mounted() {
    this.drinks = loadDrinks()
    const shared = readSharedDrinksFromUrl()
    if (shared && shared.length) {
      this.sharedDrinks = shared
      this.sharedPromptOpen = true
    }
  },
  methods: {
    persist() {
      saveDrinks(this.drinks)
    },
    openAdd() {
      this.editing = null
      this.dialogOpen = true
    },
    openEdit(drink: Drink) {
      this.editing = drink
      this.dialogOpen = true
    },
    saveDrink(drink: Drink) {
      const idx = this.drinks.findIndex((d) => d.id === drink.id)
      if (idx >= 0) this.drinks.splice(idx, 1, drink)
      else this.drinks.push(drink)
      this.persist()
      this.notify('Gespeichert')
    },
    remove(id: string) {
      this.drinks = this.drinks.filter((d) => d.id !== id)
      this.persist()
      this.notify('Gelöscht')
    },
    triggerImport() {
      ;(this.$refs.fileInput as HTMLInputElement).click()
    },
    onFileChosen(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const imported = parseImportPayload(String(reader.result))
          this.drinks = mergeById(this.drinks, imported)
          this.persist()
          this.notify(`${imported.length} Drinks importiert`)
        } catch (err) {
          this.notify(err instanceof Error ? err.message : 'Import fehlgeschlagen')
        }
      }
      reader.readAsText(file)
      ;(e.target as HTMLInputElement).value = ''
    },
    exportJson() {
      const payload = toExportPayload(this.drinks)
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `holy-drinks-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    async shareUrl() {
      const url = buildShareUrl(this.drinks)
      try {
        await navigator.clipboard.writeText(url)
        this.notify('Link in Zwischenablage kopiert')
      } catch {
        prompt('Link kopieren:', url)
      }
    },
    applySharedMerge() {
      this.drinks = mergeById(this.drinks, this.sharedDrinks)
      this.persist()
      this.dismissShared()
      this.notify('Zusammengeführt')
    },
    applySharedReplace() {
      this.drinks = this.sharedDrinks
      this.persist()
      this.dismissShared()
      this.notify('Liste ersetzt')
    },
    dismissShared() {
      this.sharedPromptOpen = false
      this.sharedDrinks = []
      clearShareParamFromUrl()
    },
    notify(text: string) {
      this.snackbar = { show: true, text }
    },
  },
})

function mergeById(existing: Drink[], incoming: Drink[]): Drink[] {
  const map = new Map(existing.map((d) => [d.id, d]))
  for (const d of incoming) map.set(d.id, d)
  return [...map.values()]
}
</script>
