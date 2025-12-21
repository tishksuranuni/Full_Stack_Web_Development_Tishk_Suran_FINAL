<script setup>
import { ref, onMounted } from 'vue';
import { itemService } from '../services/api';
import { useAuthStore } from '../stores/auth';
import ItemCard from '../components/ItemCard.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';

const authStore = useAuthStore();

// Update UI automatically.
const liveAuctions = ref([]);
const upcomingAuctions = ref([]);
const loading = ref(true);
const error = ref(null);

const loadAuctions = async () => {
    loading.value = true;
    error.value = null;

    try {
        const liveResponse = await itemService.search({ status: 'BID', limit: 8 });
        liveAuctions.value = liveResponse;
        
        const upcomingResponse = await itemService.search({ status: 'OPEN', limit: 4 });
        upcomingAuctions.value = upcomingResponse;
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};
onMounted(loadAuctions);


</script>

<template>
    <div>
        
    </div>
</template>