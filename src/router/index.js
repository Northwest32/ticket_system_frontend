import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/role-selection',
      name: 'role-selection',
      component: () => import('../views/RoleSelectionView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/forget-password',
      name: 'forget-password',
      component: () => import('../views/ForgetPasswordView.vue'),
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/EventsView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResultView.vue'),
    },
    {
      path: '/category/:category',
      name: 'category',
      component: () => import('../views/SearchResultView.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/HelpView.vue'),
    },
    {
      path: '/event/:id',
      name: 'event-detail',
      component: () => import('../views/EventDetailView.vue'),
    },
    {
      path: '/payment/:id',
      name: 'payment',
      component: () => import('../views/PaymentView.vue'),
    },
    {
      path: '/payment-success/:orderId?',
      name: 'payment-success',
      component: () => import('../views/PaymentSuccessView.vue'),
    },
    {
      path: '/order-details/:orderId',
      name: 'order-details',
      component: () => import('../views/OrderDetailsView.vue'),
    },
    {
      path: '/buyer-home',
      name: 'buyer-home',
      component: () => import('../views/BuyerHomeView.vue'),
    },
    {
      path: '/organizer-home',
      name: 'organizer-home',
      component: () => import('../views/OrganizerHomeView.vue'),
    },
    {
      path: '/organizer/:id',
      name: 'organizer-profile',
      component: () => import('../views/OrganizerProfileView.vue'),
    },
    {
      path: '/profile-edit',
      name: 'profile-edit',
      component: () => import('../views/ProfileEditView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/create-event',
      name: 'create-event',
      component: () => import('../views/CreateEventView.vue'),
    },
    {
      path: '/event-details/:id',
      name: 'event-details',
      component: () => import('../views/EventDetailView.vue'),
    },
    {
      path: '/manage-orders/:id',
      name: 'manage-orders',
      component: () => import('../views/ManageOrdersView.vue'),
    },
    {
      path: '/refund-request/:orderId',
      name: 'refund-request',
      component: () => import('../views/RefundRequestView.vue'),
    },
    {
      path: '/organizer-comments',
      name: 'organizer-comments',
      component: () => import('../views/OrganizerCommentView.vue'),
    },
  ],
})

export default router
