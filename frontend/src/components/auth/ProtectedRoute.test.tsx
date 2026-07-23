import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

const auth = vi.fn();
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => auth() }));

describe("ProtectedRoute", () => {
  beforeEach(() => auth.mockReset());

  it("redirects anonymous visitors to login", () => {
    auth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(<MemoryRouter initialEntries={["/profile"]}><Routes><Route element={<ProtectedRoute />}><Route path="/profile" element={<p>Perfil privado</p>} /></Route><Route path="/login" element={<p>Inicio de sesión</p>} /></Routes></MemoryRouter>);
    expect(screen.getByText("Inicio de sesión")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    auth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(<MemoryRouter initialEntries={["/profile"]}><Routes><Route element={<ProtectedRoute />}><Route path="/profile" element={<p>Perfil privado</p>} /></Route></Routes></MemoryRouter>);
    expect(screen.getByText("Perfil privado")).toBeInTheDocument();
  });
});
