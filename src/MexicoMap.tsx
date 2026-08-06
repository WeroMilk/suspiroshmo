import { mexicoStates, mexicoViewBox, saguaroPoints, storePins } from './mexicoPaths';

type StorePin = { city: string; state: string };

type MexicoMapProps = {
  stores: StorePin[];
  selectedCity: string;
  activeState: string;
  onSelectCity: (city: string) => void;
  onSelectState?: (state: string) => void;
};

function Saguaro({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.88}>
      <g className="saguaro" style={{ animationDelay: `${delay}s` }}>
        <path d="M9.5 50 V17 C9.5 10.5 13 8 15.5 8 C18 8 21.5 10.5 21.5 17 V50 Z" fill="#5a6644" />
        <path d="M9.5 27 H4 C1.8 27 1.2 29 1.2 31.2 V38.5 C1.2 41.2 3 42.2 5 42.2 H7.8 V31" fill="#667350" />
        <path d="M21.5 21 H27 C29.2 21 29.8 23 29.8 25.2 V32.5 C29.8 35.2 28 36.2 26 36.2 H23.2 V25" fill="#667350" />
        <circle cx="15.5" cy="10" r="1" fill="#84906a" />
        <circle cx="4.8" cy="34.5" r="0.8" fill="#84906a" />
        <circle cx="26.2" cy="28.5" r="0.8" fill="#84906a" />
      </g>
    </g>
  );
}

export function MexicoMap({ stores, selectedCity, activeState, onSelectCity, onSelectState }: MexicoMapProps) {
  const unitedPath = mexicoStates.map((s) => s.d).join(' ');

  return (
    <svg className="mexico-map" viewBox={mexicoViewBox} role="img" aria-label="Mapa de México con sucursales Suspiros">
      <defs>
        <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8e0d4" />
          <stop offset="55%" stopColor="#dfd5c7" />
          <stop offset="100%" stopColor="#d5cab9" />
        </linearGradient>
        <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0e8dd" />
          <stop offset="100%" stopColor="#ddd1c1" />
        </linearGradient>
        <linearGradient id="storeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2d0bc" />
          <stop offset="100%" stopColor="#d0b79f" />
        </linearGradient>
        <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a090" />
          <stop offset="100%" stopColor="#a85a4c" />
        </linearGradient>
        <filter id="mapShadow" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#3a2a24" floodOpacity=".18" />
        </filter>
        <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#6b2e28" floodOpacity=".35" />
        </filter>
      </defs>

      <rect className="map-ocean" width="1000" height="680" fill="url(#oceanGrad)" />
      <circle className="map-haze" cx="220" cy="180" r="120" fill="rgba(255,255,255,.22)" />
      <circle className="map-haze" cx="720" cy="420" r="150" fill="rgba(255,255,255,.16)" />

      {/* Country silhouette shadow / base */}
      <path className="mx-nation" d={unitedPath} filter="url(#mapShadow)" fill="url(#landGrad)" stroke="#a89886" strokeWidth="1.4" strokeLinejoin="round" />

      <g className="mx-states">
        {mexicoStates.map((state) => {
          const active = state.id === activeState;
          const classes = ['mx-state', state.hasStore ? 'has-store' : '', active ? 'active' : '']
            .filter(Boolean)
            .join(' ');

          return (
            <path
              key={state.id}
              d={state.d}
              className={classes}
              fill={active ? 'url(#activeGrad)' : state.hasStore ? 'url(#storeGrad)' : 'url(#landGrad)'}
              onClick={() => state.hasStore && onSelectState?.(state.id)}
            >
              <title>{state.id}</title>
            </path>
          );
        })}
      </g>

      <text className="map-title" x="580" y="305">
        MÉXICO
      </text>
      <text className="map-region" x="210" y="150">
        SONORA
      </text>

      {saguaroPoints.map((item, index) => (
        <Saguaro key={index} x={item.x} y={item.y} scale={item.scale} delay={item.delay} />
      ))}

      {stores.map((store) => {
        const pin = storePins[store.city as keyof typeof storePins];
        if (!pin) return null;
        const active = selectedCity === store.city;
        const labelWidth = store.city.length * 6.4 + 22;
        return (
          <g
            key={store.city}
            className={`svg-pin${active ? ' active' : ''}`}
            transform={`translate(${pin.x} ${pin.y})`}
            onClick={() => onSelectCity(store.city)}
            role="button"
            tabIndex={0}
            aria-label={store.city}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onSelectCity(store.city);
            }}
          >
            <circle className="svg-pin-halo" r={active ? 22 : 0} />
            <path
              className="svg-pin-marker"
              filter="url(#pinGlow)"
              d="M0 -22 C-9 -22 -14 -14 -14 -7 C-14 4 0 14 0 14 C0 14 14 4 14 -7 C14 -14 9 -22 0 -22 Z"
            />
            <circle className="svg-pin-dot" cx="0" cy="-10" r="3.5" />
            <g className="svg-pin-label" transform="translate(0 -42)">
              <rect x={-labelWidth / 2} y="-11" width={labelWidth} height="22" rx="5" />
              <text textAnchor="middle" dy="5">
                {store.city}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
