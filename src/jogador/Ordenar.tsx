import { useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Cartao({ id, texto, pos, travado }: { id: number; texto: string; pos: number; travado: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: travado })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes} {...listeners}
      className={`papel-arquivo flex min-h-16 touch-none items-center gap-3 rounded-sm p-3 ${isDragging ? 'z-10 scale-105 ring-4 ring-ouro' : ''}`}>
      <span className="font-titulo text-2xl font-bold text-redjohn">{pos + 1}</span>
      <span className="flex-1 font-dossie text-sm leading-snug">{texto}</span>
      <span aria-hidden className="text-xl text-tinta/50">⠿</span>
    </li>
  )
}

export default function Ordenar({ opcoes, travado, enviar }: { opcoes: string[]; travado: boolean; enviar: (ordem: number[]) => void }) {
  const [ordem, setOrdem] = useState(() => opcoes.map((_, i) => i))
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const soltar = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) setOrdem((o) => arrayMove(o, o.indexOf(Number(active.id)), o.indexOf(Number(over.id))))
  }
  return (
    <>
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={soltar}>
        <SortableContext items={ordem} strategy={verticalListSortingStrategy}>
          <ol className="mt-3 flex flex-1 flex-col gap-3">
            {ordem.map((id, pos) => <Cartao key={id} id={id} texto={opcoes[id]} pos={pos} travado={travado} />)}
          </ol>
        </SortableContext>
      </DndContext>
      <button disabled={travado} onClick={() => enviar(ordem)}
        className="mt-4 min-h-12 w-full rounded-sm bg-redjohn px-6 py-3 font-titulo text-xl text-papel disabled:opacity-40">
        Confirmar ordem
      </button>
    </>
  )
}
