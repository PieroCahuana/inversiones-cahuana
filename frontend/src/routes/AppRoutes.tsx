import {
  Route,
  Routes,
} from "react-router";
import { lazy, Suspense } from "react";

import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminRoute } from "../components/auth/AdminRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { MainLayout } from "../layouts/MainLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { ProfilePage } from "../pages/account/ProfilePage";
import { OrderDetailPage } from "../pages/account/OrderDetailPage";
import { OrdersPage } from "../pages/account/OrdersPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { CartPage } from "../pages/shop/CartPage";
import { HomePage } from "../pages/shop/HomePage";
import { ProductDetailPage } from "../pages/shop/ProductDetailPage";
import { ProductsPage } from "../pages/shop/ProductsPage";
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminEntitiesPage = lazy(() => import("../pages/admin/AdminEntitiesPage").then((module) => ({ default: module.AdminEntitiesPage })));
const AdminInventoryPage = lazy(() => import("../pages/admin/AdminInventoryPage").then((module) => ({ default: module.AdminInventoryPage })));
const AdminOrderDetailPage = lazy(() => import("../pages/admin/AdminOrderDetailPage").then((module) => ({ default: module.AdminOrderDetailPage })));
const AdminOrdersPage = lazy(() => import("../pages/admin/AdminOrdersPage").then((module) => ({ default: module.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import("../pages/admin/AdminProductsPage").then((module) => ({ default: module.AdminProductsPage })));
const AdminCustomersPage = lazy(() => import("../pages/admin/AdminCustomersPage").then((module) => ({ default: module.AdminCustomersPage })));
const AdminStoreSettingsPage = lazy(() => import("../pages/admin/AdminStoreSettingsPage").then((module) => ({ default: module.AdminStoreSettingsPage })));
const AdminCommercePage = lazy(() => import("../pages/admin/AdminCommercePage").then((module) => ({ default: module.AdminCommercePage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-sm font-black text-[#249fd3]">Cargando módulo...</div>}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/products"
          element={<ProductsPage />}
        />
        <Route
          path="/products/:slug"
          element={<ProductDetailPage />}
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/cart"
            element={<CartPage />}
          />
          <Route
            path="/profile"
            element={<ProfilePage />}
          />
          <Route
            path="/checkout"
            element={<CheckoutPage />}
          />
          <Route
            path="/orders"
            element={<OrdersPage />}
          />
          <Route
            path="/orders/:orderNumber"
            element={<OrderDetailPage />}
          />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderNumber" element={<AdminOrderDetailPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="settings" element={<AdminStoreSettingsPage />} />
          <Route path="commerce" element={<AdminCommercePage />} />
          <Route path="brands" element={<AdminEntitiesPage kind="brands" />} />
          <Route path="categories" element={<AdminEntitiesPage kind="categories" />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
    </Suspense>
  );
}
