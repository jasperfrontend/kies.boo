<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import supabase from '@/lib/supabaseClient';
import NotificationComponent from '@/components/NotificationComponent.vue';
import { useAppStore } from '@/stores/app'

const tagsData = ref(null)
const tagsPerPage = ref(10)
const tagsPerPageArray = ref([10, 20, 50, 100, 'all'])
const notification = ref({
  show: false,
  type: 'warning',
  message: ''
});

const router = useRouter()

const appStore = useAppStore()

function handleSearchTag(tag) {
  appStore.setBookmarkSearch(tag)
  router.push('/')
}

function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  };
}

function closeNotification() {
  notification.value.show = false;
}

async function getTags(pagination) {
  // Bij -1 geen limiet toepassen
  const query = supabase.from('tags').select('id, title').order('title', {ascending: true});
  if (pagination !== 'all') {
    query.limit(pagination);
  }

  const { data, error } = await query;

  if (error) {
    console.log("Error retrieving tags: ", error);
    showNotification('error', 'Error retrieving tags!');
    return;
  }

  tagsData.value = data;
  showNotification('success', `Loaded ${data.length} tags`);
}

// Initial fetch
onMounted(() => {
  getTags(tagsPerPage.value)
})

// Fetch again when tagsPerPage changes
watch(tagsPerPage, (newVal) => {
  getTags(newVal)
})

</script>

<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col 
        cols="12" md="8" lg="6"
        class="bg-grey-darken-4"
      >
        <v-select
          v-model="tagsPerPage"
          label="Tags per page"
          :items="tagsPerPageArray"
        />
        <h2>Showing {{ tagsPerPage }} items</h2>
        <v-chip
          v-for="(tag, index) in tagsData"
          :key="index"
          size="small"
          variant="tonal"
          color="primary-lighten-3"
          class="cursor-pointer mr-1 mb-1"
          @click="handleSearchTag(tag.title)"
          :title="`Click to search for ${tag.title}`"
        >
          {{ tag.title }}
        </v-chip>

      </v-col>
    </v-row>
    <NotificationComponent
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />
  </v-container>
</template>