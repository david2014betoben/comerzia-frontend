import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from './context';
import { StoreLayout, StaffLayout } from './components/layout';
import { Catalog } from './pages/store';
import { Checkout, PaymentPage } from './pages/checkout';
const product = {
  id: 1,
  sku: 'QA-1',
  nombre: 'Teclado compacto',
  precioVenta: '24.50',
  categoria: { id: 1, nombre: 'Tecnología' },
  inventario: { stock: 5 },
};
function mock(handler?: (path: string, method: string, body: any) => unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: RequestInit) => {
      const path = String(input).replace('http://localhost:3000', '');
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      const value = handler?.(path, init?.method || 'GET', body);
      const data =
        value !== undefined
          ? value
          : path === '/products'
            ? [product]
            : path === '/categories'
              ? [product.categoria]
              : path === '/carts/me'
                ? { id: 1, detalles: [{ producto: product, cantidad: 1 }] }
                : path === '/addresses'
                  ? [
                      {
                        id: 1,
                        alias: 'Casa',
                        destinatario: 'David',
                        ciudad: 'Santa Cruz',
                        direccion: 'Calle 1',
                        telefono: '70000000',
                        esPrincipal: true,
                      },
                    ]
                  : [];
      return { ok: true, status: 200, json: async () => data } as Response;
    }),
  );
}
function client() {
  sessionStorage.setItem('comerzia.token', 'test');
  sessionStorage.setItem(
    'comerzia.user',
    JSON.stringify({
      id: 3,
      nombre: 'David',
      email: 'david@example.test',
      rol: 'CLIENTE',
    }),
  );
}
function mount(content: React.ReactNode, path = '/') {
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
describe('Flujos del frontend', () => {
  it('renderiza el catálogo real y conserva el cambio de tema', async () => {
    mock();
    mount(<Catalog />);
    expect(
      await screen.findByRole('heading', { name: product.nombre }),
    ).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
    await userEvent.click(
      screen.getByRole('button', { name: 'Activar modo claro' }),
    );
    expect(localStorage.getItem('comerzia.theme')).toBe('light');
    expect(
      screen.getByRole('button', { name: 'Activar modo oscuro' }),
    ).toBeInTheDocument();
  });
  it('solicita login al agregar como visitante sin enviar una compra', async () => {
    mock();
    mount(<Catalog />);
    await userEvent.click(
      await screen.findByRole('button', { name: `Agregar ${product.nombre}` }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Bienvenido de nuevo' }),
    ).toBeInTheDocument();
    expect(
      vi.mocked(fetch).mock.calls.some(([, init]) => init?.method === 'POST'),
    ).toBe(false);
  });
  it('muestra rechazo confirmado por el backend y envía solo el número ficticio', async () => {
    client();
    const order = {
      id: 8,
      estado: 'PENDIENTE',
      totalProductos: '24.50',
      detalles: [{ producto: product, cantidad: 1 }],
      destinatario: 'David',
      direccionDestino: 'Calle 1',
      ciudadDestino: 'Santa Cruz',
    };
    mock((path) =>
      path === '/orders/my'
        ? [order]
        : path.includes('/payments/simulate')
          ? { pagoEstado: 'RECHAZADO', pedidoEstado: 'CANCELADO' }
          : undefined,
    );
    render(
      <MemoryRouter initialEntries={['/pago/8']}>
        <Provider>
          <Routes>
            <Route path="/pago/:id" element={<PaymentPage />} />
          </Routes>
        </Provider>
      </MemoryRouter>,
    );
    const input = await screen.findByLabelText('Número de tarjeta ficticia');
    await userEvent.type(input, '5555');
    await userEvent.click(screen.getByRole('button', { name: 'Simular pago' }));
    expect(
      await screen.findByRole('dialog', { name: 'Pago de prueba rechazado' }),
    ).toBeInTheDocument();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.find(([p]) => String(p).includes('/payments/simulate'))?.[1]
        ?.body,
    ).toBe(JSON.stringify({ numeroTarjeta: '5555' }));
    expect(input).toHaveValue('');
  });
  it('checkout envía solo el ID de dirección sin precios del cliente', async () => {
    client();
    let sent: unknown;
    mock((path, method, body) => {
      if (path === '/orders/checkout') {
        sent = body;
        return { pedidoId: 8 };
      }
    });
    mount(<Checkout />, '/checkout');
    const button = await screen.findByRole('button', {
      name: 'Continuar al pago de prueba',
    });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    await waitFor(() => expect(sent).toEqual({ direccionId: 1 }));
  });
  it('impide acceso al panel para un CLIENTE', async () => {
    client();
    mock();
    render(
      <MemoryRouter initialEntries={['/panel']}>
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
      await screen.findByText('Acceso denegado verificado'),
    ).toBeInTheDocument();
  });
  it('ofrece reintentar sin insertar catálogo ficticio ante error de conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    mount(<Catalog />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos confirmar',
    );
    expect(
      screen.queryByRole('heading', { name: product.nombre }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
  });
});
