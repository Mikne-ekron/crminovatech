<script setup>
import { RouterLink } from 'vue-router';
import LogoIcon from '@/assets/logoPortal.png';
</script>
<template>
    <div class="logo">
        <RouterLink to="/">
            <img :src="LogoIcon" alt="home" style="height: 40px; width: auto; object-fit: contain;" />
        </RouterLink>
    </div>
</template>
