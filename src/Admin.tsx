import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, LogOut, Pencil, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { getEmployeeSession, loginEmployee, logoutEmployee, type EmployeeSession } from './auth';
import type { Product, SiteContent, Store, TransferInfo } from './data';
import { resetContent, saveContent } from './contentStore';

type AdminTab = 'products' | 'stores' | 'payment' | 'categories';

type AdminProps = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
  onExit: () => void;
  onLogout: () => void;
};

const emptyProduct = (categories: string[]): Product => ({
  id: Date.now(),
  name: '',
  description: '',
  price: 0,
  category: categories[0] ?? 'Pasteles',
  image: '',
  tag: '',
});

const emptyStore = (): Store => ({
  city: '',
  address: '',
  state: '',
  hours: 'Lun — Dom · 10:00 — 20:00',
  featured: false,
});

export function EmployeeLogin({ onSuccess, onCancel }: { onSuccess: (session: EmployeeSession) => void; onCancel: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const session = loginEmployee(username, password);
    if (!session) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }
    onSuccess(session);
  };

  return (
    <div className="admin-login">
      <button className="admin-back" type="button" onClick={onCancel}>
        <ArrowLeft size={16} /> Volver a la tienda
      </button>
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <img src="/images/logo.png" alt="Suspiros Cakes" className="admin-login-logo" />
        <p className="section-kicker">Acceso empleados</p>
        <h1>Iniciar sesión</h1>
        <p className="admin-login-copy">Área interna para editar productos, sucursales y datos de pago.</p>
        <label>
          Usuario
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button className="button button-dark" type="submit">Entrar al dashboard</button>
      </form>
    </div>
  );
}

export function AdminDashboard({ content, onChange, onExit, onLogout }: AdminProps) {
  const session = useMemo(() => getEmployeeSession(), []);
  const [tab, setTab] = useState<AdminTab>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStoreIndex, setEditingStoreIndex] = useState<number | null>(null);
  const [storeDraft, setStoreDraft] = useState<Store>(emptyStore());
  const [transferDraft, setTransferDraft] = useState<TransferInfo>(content.transferInfo);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [savedFlash, setSavedFlash] = useState('');

  const persist = (next: SiteContent, message = 'Cambios guardados') => {
    saveContent(next);
    onChange(next);
    setSavedFlash(message);
    window.setTimeout(() => setSavedFlash(''), 2200);
  };

  const handleLogout = () => {
    logoutEmployee();
    onLogout();
  };

  const saveProduct = (product: Product) => {
    const clean: Product = {
      ...product,
      name: product.name.trim(),
      description: product.description.trim(),
      image: product.image.trim(),
      tag: product.tag?.trim() || undefined,
      price: Number(product.price) || 0,
    };
    if (!clean.name) return;
    const exists = content.products.some((item) => item.id === clean.id);
    const products = exists
      ? content.products.map((item) => (item.id === clean.id ? clean : item))
      : [...content.products, clean];
    persist({ ...content, products });
    setEditingProduct(null);
  };

  const deleteProduct = (id: number) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    persist({ ...content, products: content.products.filter((item) => item.id !== id) });
    if (editingProduct?.id === id) setEditingProduct(null);
  };

  const saveStore = () => {
    const clean: Store = {
      ...storeDraft,
      city: storeDraft.city.trim(),
      address: storeDraft.address.trim(),
      state: storeDraft.state.trim(),
      hours: storeDraft.hours.trim(),
    };
    if (!clean.city || !clean.address) return;
    const stores = [...content.stores];
    if (editingStoreIndex === null) stores.push(clean);
    else stores[editingStoreIndex] = clean;
    persist({ ...content, stores });
    setEditingStoreIndex(null);
    setStoreDraft(emptyStore());
  };

  const deleteStore = (index: number) => {
    if (!window.confirm('¿Eliminar esta sucursal?')) return;
    persist({ ...content, stores: content.stores.filter((_, i) => i !== index) });
    if (editingStoreIndex === index) {
      setEditingStoreIndex(null);
      setStoreDraft(emptyStore());
    }
  };

  const saveTransfer = () => {
    persist({ ...content, transferInfo: { ...transferDraft } }, 'Datos de pago guardados');
  };

  const addCategory = () => {
    const name = categoryDraft.trim();
    if (!name || content.categories.includes(name)) return;
    persist({ ...content, categories: [...content.categories, name] });
    setCategoryDraft('');
  };

  const removeCategory = (name: string) => {
    if (!window.confirm(`¿Quitar la categoría “${name}”?`)) return;
    persist({ ...content, categories: content.categories.filter((item) => item !== name) });
  };

  const handleReset = () => {
    if (!window.confirm('Esto restaura productos, sucursales y pago a los valores originales. ¿Continuar?')) return;
    const next = resetContent();
    onChange(next);
    setTransferDraft(next.transferInfo);
    setEditingProduct(null);
    setEditingStoreIndex(null);
    setSavedFlash('Contenido restaurado');
    window.setTimeout(() => setSavedFlash(''), 2200);
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="section-kicker">Dashboard Suspiros</p>
          <h1>Hola, {session?.name ?? 'equipo'}</h1>
        </div>
        <div className="admin-header-actions">
          {savedFlash && <span className="admin-saved">{savedFlash}</span>}
          <button type="button" className="admin-ghost" onClick={onExit}>
            <ArrowLeft size={16} /> Ver tienda
          </button>
          <button type="button" className="admin-ghost" onClick={handleReset}>
            <RotateCcw size={16} /> Restaurar
          </button>
          <button type="button" className="button button-dark" onClick={handleLogout}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Secciones del dashboard">
        {(
          [
            ['products', 'Productos'],
            ['stores', 'Sucursales'],
            ['payment', 'Pago'],
            ['categories', 'Categorías'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <div className="admin-body">
        {tab === 'products' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Productos</h2>
                <p>{content.products.length} en el catálogo</p>
              </div>
              <button
                type="button"
                className="button button-dark"
                onClick={() => setEditingProduct(emptyProduct(content.categories))}
              >
                <Plus size={16} /> Nuevo producto
              </button>
            </div>

            {editingProduct && (
              <div className="admin-form-card">
                <h3>{content.products.some((p) => p.id === editingProduct.id) ? 'Editar producto' : 'Nuevo producto'}</h3>
                <div className="admin-form-grid">
                  <label>
                    Nombre
                    <input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                  </label>
                  <label>
                    Precio (MXN)
                    <input
                      type="number"
                      min={0}
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    Categoría
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    >
                      {content.categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Etiqueta (opcional)
                    <input
                      value={editingProduct.tag ?? ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })}
                      placeholder="Favorito, Nuevo…"
                    />
                  </label>
                  <label className="admin-span-2">
                    Descripción
                    <textarea
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                  </label>
                  <label className="admin-span-2">
                    URL de imagen
                    <input
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://…"
                    />
                  </label>
                </div>
                {editingProduct.image && (
                  <div className="admin-image-preview">
                    <img src={editingProduct.image} alt="" />
                  </div>
                )}
                <div className="admin-form-actions">
                  <button type="button" className="admin-ghost" onClick={() => setEditingProduct(null)}>Cancelar</button>
                  <button type="button" className="button button-dark" onClick={() => saveProduct(editingProduct)}>
                    <Save size={16} /> Guardar producto
                  </button>
                </div>
              </div>
            )}

            <div className="admin-table">
              {content.products.map((product) => (
                <article key={product.id} className="admin-row">
                  <img src={product.image} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}{product.tag ? ` · ${product.tag}` : ''}</span>
                    <p>{product.description}</p>
                  </div>
                  <em>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(product.price)}</em>
                  <div className="admin-row-actions">
                    <button type="button" aria-label="Editar" onClick={() => setEditingProduct({ ...product })}><Pencil size={16} /></button>
                    <button type="button" aria-label="Eliminar" onClick={() => deleteProduct(product.id)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'stores' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Sucursales</h2>
                <p>{content.stores.length} ubicaciones</p>
              </div>
              <button
                type="button"
                className="button button-dark"
                onClick={() => {
                  setEditingStoreIndex(null);
                  setStoreDraft(emptyStore());
                }}
              >
                <Plus size={16} /> Nueva sucursal
              </button>
            </div>

            <div className="admin-form-card">
              <h3>{editingStoreIndex === null ? 'Nueva sucursal' : 'Editar sucursal'}</h3>
              <div className="admin-form-grid">
                <label>
                  Ciudad
                  <input value={storeDraft.city} onChange={(e) => setStoreDraft({ ...storeDraft, city: e.target.value })} />
                </label>
                <label>
                  Estado
                  <input value={storeDraft.state} onChange={(e) => setStoreDraft({ ...storeDraft, state: e.target.value })} />
                </label>
                <label className="admin-span-2">
                  Dirección
                  <input value={storeDraft.address} onChange={(e) => setStoreDraft({ ...storeDraft, address: e.target.value })} />
                </label>
                <label className="admin-span-2">
                  Horario
                  <input value={storeDraft.hours} onChange={(e) => setStoreDraft({ ...storeDraft, hours: e.target.value })} />
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(storeDraft.featured)}
                    onChange={(e) => setStoreDraft({ ...storeDraft, featured: e.target.checked })}
                  />
                  Destacada
                </label>
              </div>
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-ghost"
                  onClick={() => {
                    setEditingStoreIndex(null);
                    setStoreDraft(emptyStore());
                  }}
                >
                  Limpiar
                </button>
                <button type="button" className="button button-dark" onClick={saveStore}>
                  <Save size={16} /> Guardar sucursal
                </button>
              </div>
            </div>

            <div className="admin-table">
              {content.stores.map((store, index) => (
                <article key={`${store.city}-${index}`} className="admin-row admin-row-store">
                  <div>
                    <strong>{store.city}</strong>
                    <span>{store.state}{store.featured ? ' · Destacada' : ''}</span>
                    <p>{store.address}</p>
                    <p>{store.hours}</p>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      aria-label="Editar"
                      onClick={() => {
                        setEditingStoreIndex(index);
                        setStoreDraft({ ...store });
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button type="button" aria-label="Eliminar" onClick={() => deleteStore(index)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'payment' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Datos de transferencia</h2>
                <p>Se muestran al cliente en el checkout</p>
              </div>
            </div>
            <div className="admin-form-card">
              <div className="admin-form-grid">
                <label>
                  Banco
                  <input value={transferDraft.bank} onChange={(e) => setTransferDraft({ ...transferDraft, bank: e.target.value })} />
                </label>
                <label>
                  Titular
                  <input value={transferDraft.holder} onChange={(e) => setTransferDraft({ ...transferDraft, holder: e.target.value })} />
                </label>
                <label>
                  CLABE
                  <input value={transferDraft.clabe} onChange={(e) => setTransferDraft({ ...transferDraft, clabe: e.target.value })} />
                </label>
                <label>
                  Concepto
                  <input value={transferDraft.concept} onChange={(e) => setTransferDraft({ ...transferDraft, concept: e.target.value })} />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="button button-dark" onClick={saveTransfer}>
                  <Save size={16} /> Guardar datos de pago
                </button>
              </div>
            </div>
          </section>
        )}

        {tab === 'categories' && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Categorías</h2>
                <p>Filtros del catálogo</p>
              </div>
            </div>
            <div className="admin-form-card">
              <div className="admin-inline-add">
                <input
                  value={categoryDraft}
                  onChange={(e) => setCategoryDraft(e.target.value)}
                  placeholder="Nueva categoría"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCategory();
                    }
                  }}
                />
                <button type="button" className="button button-dark" onClick={addCategory}>
                  <Plus size={16} /> Agregar
                </button>
              </div>
              <ul className="admin-chip-list">
                {content.categories.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                    <button type="button" aria-label={`Quitar ${item}`} onClick={() => removeCategory(item)}>
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
