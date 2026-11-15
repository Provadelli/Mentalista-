import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Inicio from './host/Inicio'

// Host e jogador em pacotes separados: o celular só baixa a parte dele.
const HostPartida = lazy(() => import('./host/Partida'))
const Jogador = lazy(() => import('./jogador/Jogador'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Suspense fallback={<div className="grid min-h-dvh place-items-center font-dossie">Abrindo o arquivo…</div>}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/host/:sala" element={<HostPartida />} />
          <Route path="/entrar" element={<Jogador />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
