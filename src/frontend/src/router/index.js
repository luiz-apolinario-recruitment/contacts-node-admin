import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import AddContactView from '../views/AddContactView.vue';
import EditContactView from '../views/EditContactView.vue';
import ContactDetailView from '../views/ContactDetailView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/contacts/add', name: 'add-contact', component: AddContactView },
  { path: '/contacts/:id', name: 'contact-detail', component: ContactDetailView, props: true },
  { path: '/contacts/:id/edit', name: 'edit-contact', component: EditContactView, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const protectedRoutes = ['add-contact', 'edit-contact', 'contact-detail'];

  if (protectedRoutes.includes(to.name)) {
    const isAuth = await authStore.checkAuth();
    if (!isAuth) return next('/login');
  }

  next();
});

export default router;
