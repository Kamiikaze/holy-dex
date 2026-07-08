<template>
  <v-container fluid class="pt-0">
    <v-row>
      <!-- KPI Cards -->
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-header">🥤 Gesamt</div>

            <div class="stat-value">
              {{ totalDrinks }}
            </div>

            <div class="stat-subtitle">verschiedene Sorten</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-header">⭐ Bewertet</div>

            <div class="stat-value">
              {{ ratedDrinks.length }}
            </div>

            <div class="stat-subtitle">{{ unratedDrinks }} noch offen</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-header">💎 Limited Editions</div>

            <div class="stat-value">
              {{ limitedDrinks }}
            </div>

            <div class="stat-subtitle">
              {{ limitedPercentage }}% aller Sorten
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-header">🏆 Beste Bewertung</div>

            <div class="stat-value text-truncate">
              {{ bestDrink?.sorte ?? "☹" }}
            </div>

            <div class="stat-subtitle">
              <span v-if="bestDrink?.bewertung" >
                  ⭐ {{ bestDrink.bewertung }} -
                {{ bewertungMeta(bestDrink.bewertung!).label }}
              </span>
                <span v-else>
                    Hast wohl noch nichts probiert!
                </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Categories -->
      <v-col cols="12" md="6">
        <v-card class="stat-card">
          <v-card-title> 📦 Kategorien </v-card-title>

          <v-list bg-color="transparent">
            <v-list-item
              v-for="category in drinksPerCategory"
              :key="category.name"
            >
              <template #prepend>
                <v-avatar>
                  {{ category.count }}
                </v-avatar>
              </template>

              <v-list-item-title>
                {{ category.name }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ ((drinks.length / 100) * category.count).toFixed(1) }}%
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Rating distribution -->
      <v-col cols="12" md="6">
        <v-card class="stat-card">
          <v-card-title> 📊 Bewertungsverteilung </v-card-title>

          <v-card-text>
            <div
              v-for="rating in ratingDistribution"
              :key="rating.label"
              class="mb-3"
            >
              <div class="d-flex justify-space-between">
                <span>
                  {{ rating.value }} -  {{ rating.label }}
                </span>

                <span>
                  {{ rating.count }}
                </span>
              </div>

              <v-progress-linear
                :model-value="rating.percent"
                :color="rating.color"
                rounded
                height="10"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Best per category -->
      <v-col v-show="bestPerCategory.length > 0" cols="12">
          <h2 class="text-center">🏆 Kategorie Top #5</h2>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            v-for="item in bestPerCategory"
            :key="item.category"
          >
            <v-card class="mb-4">
              <v-card-title> 🏆 {{ item.category }} </v-card-title>

              <v-list bg-color="transparent">
                <v-list-item
                  v-for="(drink, index) in item.drinks"
                  :key="drink.id"
                >
                  <template #prepend>
                    <v-chip class="mr-2"> #{{ index + 1 }} </v-chip>
                  </template>

                  <v-list-item-title>
                    {{ drink.sorte }}
                  </v-list-item-title>

                  <template #append> ⭐ {{ drink.bewertung }} </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { BEWERTUNGEN, bewertungMeta, type Drink } from "../types/drink.ts";

export default defineComponent({
  name: "DrinkStats",
  methods: { bewertungMeta },

  props: {
    drinks: {
      type: Array as PropType<Drink[]>,
      required: true,
    },
  },

  computed: {
    totalDrinks(): number {
      return this.drinks.length;
    },

    limitedDrinks(): number {
      return this.drinks.filter((d) => d.limitiert).length;
    },

    ratedDrinks(): Drink[] {
      return this.drinks.filter((d) => d.bewertung !== null);
    },

    averageRating(): string {
      if (!this.ratedDrinks.length) return "-";

      const sum = this.ratedDrinks.reduce(
        (total, drink) =>
          total + Number(bewertungMeta(drink.bewertung!).weight),
        0,
      );

      const avg = (sum / this.ratedDrinks.length).toFixed();

      return (
        BEWERTUNGEN.find((b) => b.weight.toString() === avg)?.value ??
        "Nicht genug Bewertungen"
      );
    },

    drinksPerCategory() {
      const categories = new Map<string, number>();

      this.drinks.forEach((drink) => {
        const key = String(drink.kategorie);

        categories.set(key, (categories.get(key) ?? 0) + 1);
      });

      return [...categories.entries()].map(([name, count]) => ({
        name,
        count,
      }));
    },

    bestPerCategory() {
      const grouped = this.drinks.reduce(
        (acc, drink) => {
          const key = String(drink.kategorie);

          if (!acc[key]) acc[key] = [];

          acc[key].push(drink);

          return acc;
        },
        {} as Record<string, Drink[]>,
      );

      return Object.entries(grouped)
        .map(([category, drinks]) => {
          const rated = drinks
            .filter((d) => d.bewertung !== null)
            .sort(
              (a, b) =>
                Number(bewertungMeta(b.bewertung!).weight) -
                Number(bewertungMeta(a.bewertung!).weight),
            )
            .slice(0, 5);

          return {
            category,
            drinks: rated,
          };
        })
        .filter((x) => x.drinks.length);
    },

    unratedDrinks(): number {
      return this.drinks.length - this.ratedDrinks.length;
    },

    limitedPercentage(): string {
      if (!this.totalDrinks) return "0";

      return ((this.limitedDrinks / this.totalDrinks) * 100).toFixed(0);
    },

    bestDrink(): Drink | null {
      return (
        [...this.ratedDrinks].sort(
          (a, b) =>
            Number(bewertungMeta(b.bewertung!).weight) -
            Number(bewertungMeta(a.bewertung!).weight),
        )[0] ?? null
      );
    },

    drinksWithComments(): number {
      return this.drinks.filter((d) => d.kommentar.trim()).length;
    },

    ratingDistribution() {
      return BEWERTUNGEN.map((b) => {
        const count = this.ratedDrinks.filter(
          (d) => bewertungMeta(d.bewertung!).weight === b.weight,
        ).length;

        return {
          ...b,
          count,
          percent: this.ratedDrinks.length
            ? (count / this.ratedDrinks.length) * 100
            : 0,
        };
      });
    },
  },
});
</script>

<style scoped>
.stat-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.04)
  );

  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  height: 100%;
}

.stat-header {
  font-size: 1.1rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 3rem;
  font-weight: 900;
  margin-top: 8px;
}

.stat-subtitle {
  opacity: 0.6;
}
</style>
