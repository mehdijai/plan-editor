import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const _routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/views/floors.vue"),
  },
  {
    path: "/create",
    component: () => import("@/views/create.vue"),
  },
  {
    path: "/edit/:id",
    component: () => import("@/views/edit.vue"),
  },
  {
    path: "/404",
    component: () => import("@/views/Error404.vue"),
    meta: {
      pageTitle: "Error 404",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: _routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 80,
        behavior: "smooth",
      };
    } else {
      return {
        top: 0,
        left: 0,
        behavior: "smooth",
      };
    }
  },
});

export default router;
