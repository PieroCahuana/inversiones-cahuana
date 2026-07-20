import {
  Route,
  Routes,
} from "react-router";

import { MainLayout } from "../layouts/MainLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { CartPage } from "../pages/shop/CartPage";
import { HomePage } from "../pages/shop/HomePage";
import { ProductsPage } from "../pages/shop/ProductsPage";

export function AppRoutes() {
  return (
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
          path="/cart"
          element={<CartPage />}
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}