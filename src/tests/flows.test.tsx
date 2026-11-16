import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppProviders as Provider } from "../context/AppProviders";
import { StaffLayout } from "../layouts/StaffLayout";
import { StoreLayout } from "../layouts/StoreLayout";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { PaymentPage } from "../pages/checkout/PaymentPage";
import { CatalogPage } from "../pages/store/CatalogPage";
const product = {
  id: 1,
  sku: "QA-1",
  nombre: "Teclado compacto",
  precioVenta: "24.50",
  categoria: { id: 1, nombre: "Tecnología" },
  inventario: { stock: 5 },
};
function mock(
  handler?: (path: string, method: string, body: unknown) => unknown,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const path = String(input).replace("http://localhost:3000", "");
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      const value = handler?.(path, init?.method || "GET", body);
      const data =
        value !== undefined
          ? value
          : path === "/products"
            ? [product]
            : path === "/categories"
              ? [product.categoria]
              : path === "/carts/me"
                ? { id: 1, detalles: [{ producto: product, cantidad: 1 }] }
                : path === "/addresses"
                  ? [
                      {
                        id: 1,
                        alias: "Casa",
                        destinatario: "David",
                        ciudad: "Santa Cruz",
                        direccion: "Calle 1",
                        telefono: "70000000",
                        esPrincipal: true,
                      },
                    ]
                  : [];
      return { ok: true, status: 200, json: async () => data } as Response;
    }),
  );
}
function client() {
  sessionStorage.setItem("comerzia.token", "test");
  sessionStorage.setItem(
    "comerzia.user",
    JSON.stringify({
      id: 3,
      nombre: "David",
      email: "david@example.test",
      rol: "CLIENTE",
    }),
  );
}
function mount(content: React.ReactNode, path = "/") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Provider>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route path="*" element={content} />
          </Route>
        </Routes>
      </Provider>
    </MemoryRouter>,
  );
}
describe("Flujos del frontend", () => {
  it("renderiza el catálogo real y conserva el cambio de tema", async () => {
    mock();
    mount(<CatalogPage />);
    expect(
      await screen.findByRole("heading", { name: product.nombre }),
    ).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("dark");
    await userEvent.click(
      screen.getByRole("button", { name: "Activar modo claro" }),
    );
    expect(localStorage.getItem("comerzia.theme")).toBe("light");
    expect(
      screen.getByRole("button", { name: "Activar modo oscuro" }),
    ).toBeInTheDocument();
  });
  it("solicita login al agregar como visitante sin enviar una compra", async () => {
    mock();
    mount(<CatalogPage />);
    await userEvent.click(
      await screen.findByRole("button", { name: `Agregar ${product.nombre}` }),
    );
    expect(
      screen.getByRole("dialog", { name: "Bienvenido de nuevo" }),
    ).toBeInTheDocument();
    expect(
      vi.mocked(fetch).mock.calls.some(([, init]) => init?.method === "POST"),
    ).toBe(false);
  });
  it("muestra rechazo confirmado por el backend y envía solo el número ficticio", async () => {
    client();
    const order = {
      id: 8,
      estado: "PENDIENTE",
      totalProductos: "24.50",
      detalles: [{ producto: product, cantidad: 1 }],
      destinatario: "David",
      direccionDestino: "Calle 1",
      ciudadDestino: "Santa Cruz",
    };
    mock((path) =>
      path === "/orders/my"
        ? [order]
        : path.includes("/payments/simulate")
          ? { pagoEstado: "RECHAZADO", pedidoEstado: "CANCELADO" }
          : undefined,
    );
    render(
      <MemoryRouter initialEntries={["/pago/8"]}>
        <Provider>
          <Routes>
            <Route path="/pago/:id" element={<PaymentPage />} />
          </Routes>
        </Provider>
      </MemoryRouter>,
    );
    const input = await screen.findByLabelText("Número de tarjeta ficticia");
    await userEvent.type(input, "5555");
    await userEvent.click(screen.getByRole("button", { name: "Simular pago" }));
    expect(
      await screen.findByRole("dialog", { name: "Pago de prueba rechazado" }),
    ).toBeInTheDocument();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.find(([p]) => String(p).includes("/payments/simulate"))?.[1]
        ?.body,
    ).toBe(JSON.stringify({ numeroTarjeta: "5555" }));
    expect(input).toHaveValue("");
  });
  it("checkout envía solo el ID de dirección sin precios del cliente", async () => {
    client();
    let sent: unknown;
    mock((path, method, body) => {
      if (path === "/orders/checkout") {
        sent = body;
        return { pedidoId: 8 };
      }
    });
    mount(<CheckoutPage />, "/checkout");
    const button = await screen.findByRole("button", {
      name: "Continuar al pago de prueba",
    });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    await waitFor(() => expect(sent).toEqual({ direccionId: 1 }));
  });
  it("impide acceso al panel para un CLIENTE", async () => {
    client();
    mock();
    render(
      <MemoryRouter initialEntries={["/panel"]}>
        <Provider>
          <Routes>
            <Route path="/panel" element={<StaffLayout />} />
            <Route
              path="/403"
              element={<div>Acceso denegado verificado</div>}
            />
          </Routes>
        </Provider>
      </MemoryRouter>,
    );
    expect(
      await screen.findByText("Acceso denegado verificado"),
    ).toBeInTheDocument();
  });
  it("ofrece reintentar sin insertar catálogo ficticio ante error de conexión", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    mount(<CatalogPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos confirmar",
    );
    expect(
      screen.queryByRole("heading", { name: product.nombre }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });
});

describe("Regresiones de autenticación y separación de servicios", () => {
  it("retoma el producto pendiente después del login y muestra su cantidad en el carrito", async () => {
    mock((path, method, body) =>
      path === "/auth/login"
        ? {
            access_token: "session-test",
            usuario: {
              id: 3,
              nombre: "David",
              email: "david@example.test",
              rol: "CLIENTE",
            },
          }
        : path === "/carts/items"
          ? { id: 1, detalles: [{ producto: product, cantidad: 1 }] }
          : undefined,
    );
    mount(<CatalogPage />);
    await userEvent.click(
      await screen.findByRole("button", { name: `Agregar ${product.nombre}` }),
    );
    await userEvent.type(
      screen.getByLabelText("Correo electrónico"),
      "david@example.test",
    );
    await userEvent.type(screen.getByLabelText("Contraseña"), "password-test");
    await userEvent.click(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Tu carrito · 1" }),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem("comerzia.token")).toBe("session-test");
    const calls = vi
      .mocked(fetch)
      .mock.calls.filter(([p]) => String(p).endsWith("/carts/items"));
    expect(calls).toHaveLength(1);
    expect(calls[0][1]?.body).toBe(
      JSON.stringify({ productoId: 1, cantidad: 1 }),
    );
  });
  it("valida confirmación de contraseña sin enviar el registro", async () => {
    mock();
    mount(<CatalogPage />);
    await userEvent.click(screen.getByRole("button", { name: "Cuenta" }));
    await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await userEvent.type(screen.getByLabelText("Nombre completo"), "David");
    await userEvent.type(
      screen.getByLabelText("Correo electrónico"),
      "david@example.test",
    );
    await userEvent.type(
      screen.getByLabelText("Contraseña", { exact: true }),
      "password-a",
    );
    await userEvent.type(
      screen.getByLabelText("Confirmar contraseña"),
      "password-b",
    );
    await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Las contraseñas no coinciden",
    );
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([p]) => String(p).includes("/users/register")),
    ).toBe(false);
  });
  it("crea un cliente con datos tipados y vuelve al login sin inventar una sesión", async () => {
    mock((path) =>
      path === "/users/register"
        ? {
            id: 5,
            nombre: "David",
            email: "david@example.test",
            rol: "CLIENTE",
          }
        : undefined,
    );
    mount(<CatalogPage />);
    await userEvent.click(screen.getByRole("button", { name: "Cuenta" }));
    await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await userEvent.type(screen.getByLabelText("Nombre completo"), "David");
    await userEvent.type(
      screen.getByLabelText("Correo electrónico"),
      "david@example.test",
    );
    await userEvent.type(
      screen.getByLabelText("Contraseña", { exact: true }),
      "password-a",
    );
    await userEvent.type(
      screen.getByLabelText("Confirmar contraseña"),
      "password-a",
    );
    await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(
      await screen.findByRole("dialog", { name: "Bienvenido de nuevo" }),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem("comerzia.token")).toBeNull();
    const call = vi
      .mocked(fetch)
      .mock.calls.find(([p]) => String(p).includes("/users/register"));
    expect(call?.[1]?.body).toBe(
      JSON.stringify({
        nombre: "David",
        email: "david@example.test",
        password: "password-a",
      }),
    );
  });
});

it("no cierra el editor ni muestra éxito cuando el servicio rechaza crear un producto", async () => {
  sessionStorage.setItem("comerzia.token", "admin-test");
  sessionStorage.setItem(
    "comerzia.user",
    JSON.stringify({
      id: 1,
      nombre: "Admin",
      email: "admin@example.test",
      rol: "ADMIN",
    }),
  );
  mock((path) => (path === "/products/manage" ? [] : undefined));
  const original = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    if (String(input).endsWith("/products") && init?.method === "POST")
      return {
        ok: false,
        status: 409,
        json: async () => ({ message: "SKU duplicado" }),
      } as Response;
    return original(input, init);
  });
  const { CatalogManager } =
    await import("../components/catalog/CatalogManager");
  mount(<CatalogManager kind="productos" />);
  await userEvent.click(screen.getByRole("button", { name: "Nuevo producto" }));
  await userEvent.type(screen.getByLabelText("SKU"), "QA-NEW");
  await userEvent.type(
    screen.getByLabelText("Nombre", { exact: true }),
    "Producto QA",
  );
  await waitFor(() =>
    expect(
      within(screen.getByRole("dialog")).getByRole("option", { name: "Tecnología" }),
    ).toBeInTheDocument(),
  );
  await userEvent.selectOptions(within(screen.getByRole("dialog")).getByLabelText("Categoría"), "1");
  await userEvent.click(
    screen.getByRole("button", { name: "Guardar cambios" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("SKU duplicado");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.queryByText("Cambios guardados")).not.toBeInTheDocument();
});
