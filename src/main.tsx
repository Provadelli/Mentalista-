import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Inicio from './host/Inicio'

// Host e jogador em pacotes separados: o celular só baixa a parte dele.
const HostLobby = lazy(() => import('./host/Lobby'))
const Entrar = lazy(() => import('./jogador/Entrar'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="grid min-h-dvh place-items-center font-dossie">Abrindo o arquivo…</div>}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/host/:sala" element={<HostLobby />} />
          <Route path="/entrar" element={<Entrar />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
