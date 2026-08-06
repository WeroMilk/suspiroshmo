import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Banknote, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Crosshair, MapPin, Minus, Plus, Search, ShoppingBag, Sparkles, Upload, X } from 'lucide-react';
import { MexicoMap } from './MexicoMap';
import './styles.css';

type Product = { id: number; name: string; description: string; price: number; category: string; image: string; tag?: string };
type Store = { city: string; address: string; state: string; hours: string; featured?: boolean };
type CheckoutStep = 'cart' | 'store' | 'day' | 'time' | 'payment' | 'done';
type PaymentMethod = 'cash' | 'transfer';

const checkoutFlow: CheckoutStep[] = ['store', 'day', 'time', 'payment'];
const checkoutBack: Partial<Record<CheckoutStep, CheckoutStep>> = {
  store: 'cart',
  day: 'store',
  time: 'day',
  payment: 'time',
};

const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const transferInfo = {
  bank: 'BBVA México',
  holder: 'Suspiros Cakes S.A. de C.V.',
  clabe: '012 180 001234567890',
  concept: 'Pedido Suspiros',
};

const products: Product[] = [
  { id: 1, name: 'Chocolate Suspiro', description: 'Bizcocho de chocolate, mousse y ganache semiamargo.', price: 495, category: 'Pasteles', tag: 'Favorito', image: 'https://images.pexels.com/photos/17939219/pexels-photo-17939219.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 2, name: 'Fresas & Crema', description: 'Vainilla ligera, crema batida y fresas de temporada.', price: 465, category: 'Pasteles', image: 'https://images.pexels.com/photos/9329433/pexels-photo-9329433.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 3, name: 'Cheesecake de la casa', description: 'Textura sedosa, base de galleta y frutos rojos.', price: 420, category: 'Cheesecakes', tag: 'Nuevo', image: 'https://images.pexels.com/photos/35225556/pexels-photo-35225556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 4, name: 'Caja de Suspiros', description: 'Seis bocados suaves para compartir el momento.', price: 265, category: 'Bollitos', image: 'https://images.pexels.com/photos/8498186/pexels-photo-8498186.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 5, name: 'Brownie intenso', description: 'Chocolate oscuro, nuez tostada y sal de mar.', price: 195, category: 'Brownies', image: 'https://images.pexels.com/photos/18874692/pexels-photo-18874692.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 6, name: 'Tarta de almendra', description: 'Crema de almendra, mantequilla y un acabado crujiente.', price: 310, category: 'Temporada', image: 'https://images.pexels.com/photos/34844491/pexels-photo-34844491.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

const stores: Store[] = [
  { city: 'Hermosillo', address: 'Blvd. Morelos 220, Col. Centro', state: 'Sonora', hours: 'Lun — Dom · 10:00 — 20:00', featured: true },
  { city: 'Mexicali', address: 'Gral. Santiago Vidaurri 460, Jardines de Calafia', state: 'Baja California', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Tijuana', address: 'Av. Colina de San Pablo, Colinas de la Presa', state: 'Baja California', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Saltillo', address: 'Blvd. Isidro López Zertuche 1275', state: 'Coahuila', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Monterrey', address: 'Av. Suspiroblo II 245, Riberas de las Puentes', state: 'Nuevo León', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'San José del Cabo', address: 'Calle Forjadores, Col. Santa Rosa', state: 'Baja California Sur', hours: 'Lun — Dom · 10:00 — 20:00' },
  { city: 'Querétaro', address: 'Plaza Real, Camino Real 307, Valle Real', state: 'Querétaro', hours: 'Lun — Dom · 10:00 — 20:00' },
];

const milestones = [
  { year: '2004', title: 'El primer suspiro', copy: 'Abrimos nuestra primera cocina en Hermosillo con una idea simple: que cada pastel se sintiera hecho para alguien.' },
  { year: '2012', title: 'Más allá de Sonora', copy: 'Llegamos a Baja California y empezamos a compartir la misma receta en nuevas ciudades.' },
  { year: '2018', title: 'Una familia más grande', copy: 'Abrimos en el norte y el centro del país. Misma esencia, nuevas mesas para celebrar.' },
  { year: 'Hoy', title: 'Momentos en todo México', copy: 'Siete sucursales y una sola intención: convertir un día cualquiera en un recuerdo dulce.' },
];

const values = [
  { title: 'Hecho a mano', copy: 'Cada pieza sale de nuestra cocina, con tiempos reales y detalle paciente.' },
  { title: 'Ingredientes honestos', copy: 'Elegimos lo mejor de temporada para que el sabor hable por sí solo.' },
  { title: 'Cerca de ti', copy: 'Desde Hermosillo hasta Cabo, queremos estar donde se celebra.' },
];

const money = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);

type AppView = 'home' | 'products' | 'stores' | 'historia';

function App() {
  const [view, setView] = useState<AppView>('home');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(stores[0]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [receiptName, setReceiptName] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptIsImage, setReceiptIsImage] = useState(true);
  const [orderId, setOrderId] = useState('');
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const cartItems = useMemo(() => products.filter((product) => cart[product.id]), [cart]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0);
  const categories = ['Todos', 'Pasteles', 'Brownies', 'Cheesecakes', 'Bollitos', 'Temporada'];
  const filteredProducts = products.filter((product) => (category === 'Todos' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()));
  const pickupDays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + index + 1);
      return { value: date.toISOString().slice(0, 10), label: formatter.format(date) };
    });
  }, []);

  useEffect(() => () => { if (receiptPreview && receiptIsImage) URL.revokeObjectURL(receiptPreview); }, [receiptPreview, receiptIsImage]);

  const addToCart = (id: number) => { setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 })); setCheckoutStep('cart'); setCartOpen(true); };
  const updateQuantity = (id: number, delta: number) => setCart((current) => { const next = Math.max(0, (current[id] ?? 0) + delta); const copy = { ...current }; if (next === 0) delete copy[id]; else copy[id] = next; return copy; });
  const navigate = (nextView: AppView) => { setView(nextView); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const selectState = (state: string) => {
    const match = stores.find((store) => store.state === state);
    if (match) setSelectedStore(match);
  };

  const resetCheckout = () => {
    setCheckoutStep('cart');
    setPickupDate('');
    setPickupTime('');
    setPaymentMethod(null);
    setReceiptName('');
    if (receiptPreview && receiptIsImage) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
    setReceiptIsImage(true);
    setOrderId('');
  };

  const closeCart = () => {
    setCartOpen(false);
    if (checkoutStep === 'done') {
      setCart({});
      resetCheckout();
    } else if (checkoutStep !== 'cart') {
      setCheckoutStep('cart');
    }
  };

  const canConfirmPayment = paymentMethod === 'cash' || (paymentMethod === 'transfer' && Boolean(receiptPreview));

  const handleReceipt = (file?: File | null) => {
    if (!file) return;
    if (receiptPreview && receiptIsImage) URL.revokeObjectURL(receiptPreview);
    const isImage = file.type.startsWith('image/');
    setReceiptIsImage(isImage);
    setReceiptName(file.name);
    setReceiptPreview(isImage ? URL.createObjectURL(file) : 'uploaded');
  };

  const goToPayment = () => {
    if (!orderId) setOrderId(`OC-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`);
    setCheckoutStep('payment');
  };

  const confirmOrder = () => {
    if (!canConfirmPayment) return;
    setCheckoutStep('done');
  };

  const stepTitle = {
    cart: { kicker: 'Tu selección', title: <>Tu carrito <sup>{cartCount}</sup></> },
    store: { kicker: 'Paso 1 de 4', title: <>Sucursal</> },
    day: { kicker: 'Paso 2 de 4', title: <>Día</> },
    time: { kicker: 'Paso 3 de 4', title: <>Hora</> },
    payment: { kicker: 'Paso 4 de 4', title: <>Pago</> },
    done: { kicker: 'Pedido listo', title: <>¡Listo!</> },
  }[checkoutStep];

  const pickupLabel = pickupDays.find((day) => day.value === pickupDate)?.label ?? pickupDate;
  const progressIndex = checkoutFlow.indexOf(checkoutStep);

  return <div className="app-shell">
    <header className="site-header">
      <button className="wordmark" onClick={() => navigate('home')} aria-label="Ir al inicio"><img src="/images/logo.png" alt="Suspiros Cakes" /></button>
      <nav className="desktop-nav" aria-label="Navegación principal"><button onClick={() => navigate('products')}>Pasteles</button><button onClick={() => navigate('stores')}>Ubicaciones</button><button onClick={() => navigate('historia')}>Nuestra historia</button></nav>
      <div className="header-actions"><button className="location-pill" onClick={() => navigate('stores')}><MapPin size={15} /> {selectedStore.city}<ChevronDown size={14} /></button><button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Abrir carrito"><ShoppingBag size={19} /><span>{cartCount}</span></button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú"><span></span><span></span></button></div>
    </header>

    <AnimatePresence>{menuOpen && <motion.div className="mobile-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><button onClick={() => navigate('products')}>Pasteles <ArrowRight size={18} /></button><button onClick={() => navigate('stores')}>Ubicaciones <ArrowRight size={18} /></button><button onClick={() => navigate('historia')}>Nuestra historia <ArrowRight size={18} /></button></motion.div>}</AnimatePresence>

    <main>
      <AnimatePresence mode="wait">
        {view === 'home' && <motion.div key="home" className="home-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="hero-section"><div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div><div className="hero-content"><p className="eyebrow"><Sparkles size={14} /> Hecho para celebrar</p><h1>Un momento<br /><em>merece</em> Suspiros.</h1><p className="hero-copy">Pasteles que convierten cualquier día<br className="desktop-break" /> en una historia para recordar.</p><div className="hero-actions"><button className="button button-dark" onClick={() => navigate('products')}>Descubrir pasteles <ArrowRight size={17} /></button><button className="button button-quiet" onClick={() => navigate('stores')}>Encuentra tu sucursal</button></div></div><div className="hero-cake"><div className="cake-halo"></div><img src="https://images.pexels.com/photos/17939219/pexels-photo-17939219.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Pastel de chocolate Suspiros con fresas" /><div className="hero-caption"><span>01</span><div><strong>El pastel de la temporada</strong><small>Chocolate · Fresa · 8 porciones</small></div><button onClick={() => addToCart(1)} aria-label="Agregar pastel de temporada"><Plus size={18} /></button></div></div><div className="hero-scroll"><span>Desliza para descubrir</span><div className="scroll-line"></div></div></section>
          <section className="intro-section"><div className="section-kicker">01 / La esencia</div><div><h2>Elaboramos momentos,<br /><span>no solo pasteles.</span></h2><p>Desde Hermosillo para todo México. Cada receta nace en nuestra cocina y llega a tu mesa con una intención: hacer que hoy se sienta especial.</p><button className="text-link" onClick={() => navigate('products')}>Conoce nuestra selección <ArrowRight size={17} /></button></div><div className="intro-stat"><strong>20</strong><span>años creando<br />momentos dulces</span></div></section>
          <section className="feature-section"><div className="feature-heading"><div><div className="section-kicker">02 / La selección</div><h2>Algo para<br /><em>cada suspiro.</em></h2></div><button className="circle-link" onClick={() => navigate('products')} aria-label="Ver todos los productos"><ArrowRight size={22} /></button></div><div className="feature-grid"><button className="feature-card feature-large" onClick={() => navigate('products')}><img src="https://images.pexels.com/photos/9329433/pexels-photo-9329433.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Pastel de fresas y crema" /><div className="feature-overlay"><span>01 — Pasteles</span><strong>Los clásicos,<br />hechos inolvidables.</strong><ArrowRight size={20} /></div></button><button className="feature-card feature-small" onClick={() => navigate('products')}><img src="https://images.pexels.com/photos/35225556/pexels-photo-35225556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Cheesecake de la casa" /><div className="feature-overlay"><span>02 — Cheesecakes</span><strong>Suave por fuera.<br />Imposible de olvidar.</strong></div></button></div></section>
          <section className="quote-section"><span className="quote-mark">“</span><blockquote>La vida es demasiado corta<br />para no pedir <em>postre.</em></blockquote><span className="quote-source">— Suspiros, desde 2004</span></section>
        </motion.div>}
        {view === 'products' && <motion.div key="products" className="catalog-view page-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><div className="catalog-header"><div><div className="section-kicker">La selección Suspiros</div><h1>Hecho para<br /><em>compartir.</em></h1></div><p>Recetas que empiezan con los mejores ingredientes y terminan en tu momento favorito.</p></div><div className="catalog-toolbar"><div className="category-tabs">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar un antojo" /></label></div><div className="product-grid">{filteredProducts.map((product, index) => <motion.article className="product-card" key={product.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }}><div className="product-image"><img src={product.image} alt={product.name} />{product.tag && <span className="product-tag">{product.tag}</span>}<button className="add-circle" onClick={() => addToCart(product.id)} aria-label={`Agregar ${product.name}`}><Plus size={20} /></button></div><div className="product-info"><div><span className="product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price)}</strong></div></motion.article>)}</div></motion.div>}
        {view === 'stores' && (
          <motion.div key="stores" className="stores-view page-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="stores-heading">
              <div>
                <div className="section-kicker">Estamos cerca de ti</div>
                <h1>Encuentra tu<br /><em>momento.</em></h1>
              </div>
              <p>Elige una sucursal para consultar horarios, dirección y comenzar tu pedido de recogida.</p>
            </div>

            <div className="stores-layout">
              <div className="stores-list">
                <div className="store-list-top">
                  <div>
                    <span className="store-count">{stores.length}</span>
                    <span>sucursales en México</span>
                  </div>
                  <button type="button"><Crosshair size={15} /> Cerca de mí</button>
                </div>

                <div className="store-rows">
                  {stores.map((store) => (
                    <button
                      className={`store-row ${selectedStore.city === store.city ? 'selected' : ''}`}
                      key={store.city}
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className="store-dot"><MapPin size={16} /></div>
                      <div className="store-details">
                        <div>
                          <h3>{store.city}</h3>
                          <span>{store.state}</span>
                        </div>
                        <p>{store.address}</p>
                        <small><Clock3 size={13} /> {store.hours}</small>
                      </div>
                      <ChevronRight size={17} className="store-chevron" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="map-panel">
                <div className="map-canvas">
                  <MexicoMap
                    stores={stores}
                    selectedCity={selectedStore.city}
                    activeState={selectedStore.state}
                    onSelectCity={(city) => {
                      const match = stores.find((store) => store.city === city);
                      if (match) setSelectedStore(match);
                    }}
                    onSelectState={selectState}
                  />
                </div>

                <div className="map-card">
                  <span className="mini-kicker">Sucursal seleccionada</span>
                  <strong>{selectedStore.city}</strong>
                  <span className="map-card-state">{selectedStore.state}</span>
                  <p>{selectedStore.address}</p>
                  <div className="map-card-meta"><Clock3 size={13} /> {selectedStore.hours}</div>
                  <button onClick={() => { setCheckoutStep('cart'); addToCart(1); }}>
                    Ordenar aquí <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {view === 'historia' && (
          <motion.div key="historia" className="historia-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <section className="historia-hero">
              <div className="historia-hero-copy">
                <div className="section-kicker">Desde 2004 · Hermosillo</div>
                <h1>Nacimos de un<br /><em>suspiro</em> dulce.</h1>
                <p>Suspiros Cakes empezó en una cocina pequeña de Sonora, con recetas de familia y la certeza de que un pastel puede cambiar el tono de un día.</p>
              </div>
              <div className="historia-hero-media">
                <img src="https://images.pexels.com/photos/2693447/pexels-photo-2693447.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Manos elaborando un pastel en la cocina" />
                <span className="historia-year-badge">20 años</span>
              </div>
            </section>

            <section className="historia-origin">
              <div className="section-kicker">01 / El origen</div>
              <div className="historia-origin-grid">
                <h2>No buscábamos una pastelería.<br /><span>Buscábamos un momento.</span></h2>
                <div>
                  <p>En 2004 abrimos las puertas en Hermosillo con una mesa, un horno y la idea de que la celebración no necesita una gran ocasión: basta con algo bien hecho y compartido.</p>
                  <p>Con el tiempo, ese suspiro se volvió tradición. Hoy seguimos horneando con la misma paciencia, ahora en más ciudades de México.</p>
                </div>
              </div>
            </section>

            <section className="historia-timeline">
              <div className="historia-timeline-head">
                <div className="section-kicker">02 / El camino</div>
                <h2>Una historia escrita<br /><em>pastel a pastel.</em></h2>
              </div>
              <ol className="timeline-list">
                {milestones.map((item) => (
                  <li key={item.year}>
                    <span className="timeline-year">{item.year}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="historia-values">
              <div className="section-kicker">03 / Lo que nos define</div>
              <h2>Tres promesas<br />en cada caja.</h2>
              <div className="values-grid">
                {values.map((item) => (
                  <article key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="historia-cta">
              <blockquote>Hoy seguimos en la misma búsqueda:<br />hacer que hoy se sienta <em>especial.</em></blockquote>
              <div className="historia-cta-actions">
                <button className="button button-dark" onClick={() => navigate('products')}>Probar nuestros pasteles <ArrowRight size={17} /></button>
                <button className="button button-quiet" onClick={() => navigate('stores')}>Visítanos en tu ciudad</button>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>

    <footer className="site-footer">
      <div className="footer-brand">
        <button className="footer-logo" onClick={() => navigate('home')} aria-label="Ir al inicio"><img src="/images/logo.png" alt="Suspiros Cakes" /></button>
        <p>Momentos que se quedan.</p>
        <address className="footer-contact">
          <a href="mailto:contacto@suspiroscakes.com">contacto@suspiroscakes.com</a>
          <a href="tel:+526621234567">+52 (662) 123 4567</a>
        </address>
      </div>
      <div className="footer-links">
        <div><span>Descubre</span><button onClick={() => navigate('products')}>Pasteles</button><button onClick={() => navigate('stores')}>Sucursales</button><button onClick={() => navigate('historia')}>Nuestra historia</button></div>
        <div><span>Ayuda</span><button>Preguntas frecuentes</button><button>Facturación</button><button>Contacto</button><button>Devoluciones</button></div>
        <div><span>Legal</span><button>Aviso de privacidad</button><button>Términos y condiciones</button><button>Política de cookies</button><button>Aviso legal</button><button>Derechos ARCO</button></div>
      </div>
      <div className="footer-bottom">
        <div className="footer-legal-meta">
          <span>© 2026 Suspiros Cakes. Todos los derechos reservados.</span>
          <span>Hecho en Hermosillo, Sonora, México · Uso exclusivo para consumo personal</span>
        </div>
        <nav className="footer-legal-links" aria-label="Enlaces legales">
          <button>Aviso de privacidad</button>
          <button>Términos y condiciones</button>
          <button>Política de cookies</button>
          <button>Aviso legal</button>
        </nav>
      </div>
    </footer>

    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} />
          <motion.aside className="cart-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28 }}>
            <div className="drawer-head">
              <div>
                {checkoutBack[checkoutStep] && (
                  <button className="checkout-back" onClick={() => setCheckoutStep(checkoutBack[checkoutStep]!)}>
                    <ChevronLeft size={16} /> Regresar
                  </button>
                )}
                <span className="section-kicker">{stepTitle.kicker}</span>
                <h2>{stepTitle.title}</h2>
              </div>
              <button className="close-button" onClick={closeCart} aria-label="Cerrar"><X size={20} /></button>
            </div>

            {progressIndex >= 0 && (
              <div className="checkout-progress" aria-hidden="true">
                {checkoutFlow.map((step, index) => (
                  <span key={step} className={index <= progressIndex ? 'active' : ''} />
                ))}
              </div>
            )}

            {cartItems.length === 0 && checkoutStep !== 'done' ? (
              <div className="empty-cart">
                <ShoppingBag size={30} />
                <h3>Tu carrito está esperando.</h3>
                <p>Agrega algo dulce para comenzar.</p>
                <button className="button button-dark" onClick={() => { setCartOpen(false); navigate('products'); }}>Ver pasteles <ArrowRight size={17} /></button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {checkoutStep === 'cart' && (
                  <motion.div key="step-cart" className="checkout-pane" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="cart-items">
                      {cartItems.map((item) => (
                        <div className="cart-item" key={item.id}>
                          <img src={item.image} alt={item.name} />
                          <div className="cart-item-copy">
                            <h3>{item.name}</h3>
                            <span>{money(item.price)}</span>
                            <div className="quantity">
                              <button onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button>
                              <span>{cart[item.id]}</span>
                              <button onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pickup-box">
                      <div>
                        <MapPin size={18} />
                        <div>
                          <span>Recoger en</span>
                          <strong>{selectedStore.city}</strong>
                        </div>
                      </div>
                      <button onClick={() => setCheckoutStep('store')} aria-label="Elegir sucursal"><ChevronRight size={17} /></button>
                    </div>
                    <div className="cart-summary">
                      <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                      <div><span>Impuestos incluidos</span><strong>—</strong></div>
                      <div className="summary-total"><span>Total</span><strong>{money(subtotal)}</strong></div>
                      <button className="button button-dark checkout-button" onClick={() => setCheckoutStep('store')}>
                        Continuar con mi pedido <ArrowRight size={17} />
                      </button>
                      <small>Solo recogida en tienda · Pago al confirmar</small>
                    </div>
                  </motion.div>
                )}

                {checkoutStep === 'store' && (
                  <motion.div key="step-store" className="checkout-pane" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="checkout-scroll">
                      <div className="checkout-block">
                        <p className="checkout-hint">Elige en qué sucursal quieres recoger tu pedido.</p>
                        <div className="pickup-store-list">
                          {stores.map((store) => (
                            <button
                              key={store.city}
                              className={`pickup-store ${selectedStore.city === store.city ? 'selected' : ''}`}
                              onClick={() => setSelectedStore(store)}
                            >
                              <MapPin size={16} />
                              <div>
                                <strong>{store.city}</strong>
                                <span>{store.address}</span>
                                <small>{store.state} · {store.hours}</small>
                              </div>
                              {selectedStore.city === store.city && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="cart-summary checkout-footer">
                      <button className="button button-dark checkout-button" onClick={() => setCheckoutStep('day')}>
                        Continuar al día <ArrowRight size={17} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {checkoutStep === 'day' && (
                  <motion.div key="step-day" className="checkout-pane" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="checkout-scroll">
                      <div className="checkout-block">
                        <p className="checkout-hint">Sucursal: <strong>{selectedStore.city}</strong>. Ahora elige el día de recogida.</p>
                        <div className="day-list">
                          {pickupDays.map((day) => (
                            <button
                              key={day.value}
                              className={`day-option ${pickupDate === day.value ? 'selected' : ''}`}
                              onClick={() => setPickupDate(day.value)}
                            >
                              <span>{day.label}</span>
                              {pickupDate === day.value && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="cart-summary checkout-footer">
                      <button className="button button-dark checkout-button" disabled={!pickupDate} onClick={() => setCheckoutStep('time')}>
                        Continuar a la hora <ArrowRight size={17} />
                      </button>
                      {!pickupDate && <small>Selecciona un día para continuar</small>}
                    </div>
                  </motion.div>
                )}

                {checkoutStep === 'time' && (
                  <motion.div key="step-time" className="checkout-pane" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="checkout-scroll">
                      <div className="checkout-block">
                        <p className="checkout-hint">
                          <strong>{selectedStore.city}</strong> · {pickupLabel}. Elige la hora de recogida.
                        </p>
                        <div className="chip-grid time-grid">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              className={`chip time-chip ${pickupTime === slot ? 'selected' : ''}`}
                              onClick={() => setPickupTime(slot)}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="cart-summary checkout-footer">
                      <button className="button button-dark checkout-button" disabled={!pickupTime} onClick={goToPayment}>
                        Continuar al pago <ArrowRight size={17} />
                      </button>
                      {!pickupTime && <small>Selecciona una hora para continuar</small>}
                    </div>
                  </motion.div>
                )}

                {checkoutStep === 'payment' && (
                  <motion.div key="step-payment" className="checkout-pane" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <div className="checkout-scroll">
                      <div className="purchase-order">
                        <div className="purchase-order-head">
                          <div>
                            <span className="mini-kicker">Orden de compra</span>
                            <strong>{orderId}</strong>
                          </div>
                          <span className="purchase-order-badge">Pendiente</span>
                        </div>
                        <div className="purchase-order-meta">
                          <div><MapPin size={14} /><span>{selectedStore.city}</span></div>
                          <div><Clock3 size={14} /><span>{pickupLabel} · {pickupTime}</span></div>
                        </div>
                        <div className="purchase-order-lines">
                          {cartItems.map((item) => (
                            <div className="purchase-order-line" key={item.id}>
                              <div>
                                <strong>{item.name}</strong>
                                <span>x{cart[item.id]}</span>
                              </div>
                              <strong>{money(item.price * (cart[item.id] ?? 0))}</strong>
                            </div>
                          ))}
                        </div>
                        <div className="purchase-order-total">
                          <span>Total</span>
                          <strong>{money(subtotal)}</strong>
                        </div>
                      </div>

                      <div className="checkout-block">
                        <h3>Método de pago</h3>
                        <div className="pay-options">
                          <button className={`pay-option ${paymentMethod === 'cash' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cash')}>
                            <Banknote size={20} />
                            <div>
                              <strong>Efectivo al recoger</strong>
                              <span>Pagas en caja cuando retires tu pedido</span>
                            </div>
                            {paymentMethod === 'cash' && <Check size={16} />}
                          </button>
                          <button className={`pay-option ${paymentMethod === 'transfer' ? 'selected' : ''}`} onClick={() => setPaymentMethod('transfer')}>
                            <Upload size={20} />
                            <div>
                              <strong>Transferencia</strong>
                              <span>Sube la foto de tu comprobante</span>
                            </div>
                            {paymentMethod === 'transfer' && <Check size={16} />}
                          </button>
                        </div>
                      </div>

                      {paymentMethod === 'cash' && (
                        <div className="pay-note">
                          <p>Presenta tu orden <strong>{orderId}</strong> en caja y paga el total al recoger.</p>
                        </div>
                      )}

                      {paymentMethod === 'transfer' && (
                        <div className="transfer-box">
                          <div className="transfer-details">
                            <div><span>Banco</span><strong>{transferInfo.bank}</strong></div>
                            <div><span>Beneficiario</span><strong>{transferInfo.holder}</strong></div>
                            <div><span>CLABE</span><strong>{transferInfo.clabe}</strong></div>
                            <div><span>Monto</span><strong>{money(subtotal)}</strong></div>
                            <div><span>Concepto</span><strong>{orderId}</strong></div>
                          </div>
                          <input
                            ref={receiptInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            hidden
                            onChange={(event) => handleReceipt(event.target.files?.[0])}
                          />
                          <button className="upload-zone" onClick={() => receiptInputRef.current?.click()}>
                            {receiptPreview ? (
                              <div className="receipt-preview">
                                {receiptIsImage ? <img src={receiptPreview} alt="Comprobante subido" /> : <div className="receipt-file"><Upload size={22} /></div>}
                                <div>
                                  <strong>Comprobante listo</strong>
                                  <span>{receiptName}</span>
                                  <small>Toca para cambiar el archivo</small>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload size={22} />
                                <strong>Subir foto del comprobante</strong>
                                <span>Usa el concepto {orderId}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="cart-summary checkout-footer">
                      <div className="summary-total"><span>Total a pagar</span><strong>{money(subtotal)}</strong></div>
                      <button className="button button-dark checkout-button" disabled={!canConfirmPayment} onClick={confirmOrder}>
                        Confirmar orden de compra <ArrowRight size={17} />
                      </button>
                      {!canConfirmPayment && (
                        <small>
                          {paymentMethod === 'transfer' ? 'Sube tu comprobante para confirmar' : 'Elige un método de pago'}
                        </small>
                      )}
                    </div>
                  </motion.div>
                )}

                {checkoutStep === 'done' && (
                  <motion.div key="step-done" className="checkout-pane done-pane" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <div className="done-icon"><Check size={28} /></div>
                    <h3>Orden confirmada</h3>
                    <p>Tu orden de compra es <strong>{orderId}</strong>. Te esperamos en {selectedStore.city} el {pickupLabel} a las {pickupTime}.</p>
                    <div className="done-summary">
                      <div><span>Orden</span><strong>{orderId}</strong></div>
                      <div><span>Sucursal</span><strong>{selectedStore.city}</strong></div>
                      <div><span>Recogida</span><strong>{pickupLabel} · {pickupTime}</strong></div>
                      <div><span>Pago</span><strong>{paymentMethod === 'cash' ? 'Efectivo al recoger' : 'Transferencia enviada'}</strong></div>
                      <div><span>Total</span><strong>{money(subtotal)}</strong></div>
                    </div>
                    <button className="button button-dark checkout-button" onClick={closeCart}>
                      Listo <ArrowRight size={17} />
                    </button>
                    <small>Simulación de pasarela · No se procesó un cargo real</small>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  </div>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
