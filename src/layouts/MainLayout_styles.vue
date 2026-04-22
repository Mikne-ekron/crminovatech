<style scoped>
/* Sidebar Styles */
.leftSidebar {
  box-shadow: 1px 0 20px rgba(0, 0, 0, 0.08);
}

.profile {
  padding-bottom: 16px;
}

.profile-img {
  text-align: center;
}

.profile-name {
  margin-top: -10px;
}

.scrollnavbar {
  height: calc(100vh - 200px);
}

/* Fix para mini-sidebar - ocultar texto cuando está contraído */
:deep(.v-navigation-drawer--rail) .v-list-item-title {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

:deep(.v-navigation-drawer--rail) .profile-name {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Mostrar texto en hover */
:deep(.v-navigation-drawer--rail:hover) .v-list-item-title {
  opacity: 1;
  width: auto;
}

:deep(.v-navigation-drawer--rail:hover) .profile-name {
  opacity: 1;
  width: auto;
}
</style>
