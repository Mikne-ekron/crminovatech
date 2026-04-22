<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="mt-3 mb-6">
    <div class="d-flex justify-space-between">
      <div class="d-flex py-0 align-center">
        <div>
          <h3 class="text-h5 card-title">{{ title }}</h3>
          <v-breadcrumbs 
            v-if="breadcrumbs.length > 0"
            :items="breadcrumbs" 
            class="text-subtitle-1 textSecondary pa-0 ml-n1"
          >
            <template v-slot:divider>
              <v-icon size="15">mdi-chevron-right</v-icon>
            </template>
            <template v-slot:title="{ item }">
              <p>{{ item.text }}</p>
            </template>
          </v-breadcrumbs>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-title {
  font-weight: 600;
}
</style>
