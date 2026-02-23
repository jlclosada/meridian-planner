import { create } from 'zustand'

interface ModalState {
  taskDetailId: string | null
  eventDetailId: string | null
  openTaskDetail: (id: string) => void
  closeTaskDetail: () => void
  openEventDetail: (id: string) => void
  closeEventDetail: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  taskDetailId: null,
  eventDetailId: null,
  openTaskDetail: (id) => set({ taskDetailId: id }),
  closeTaskDetail: () => set({ taskDetailId: null }),
  openEventDetail: (id) => set({ eventDetailId: id }),
  closeEventDetail: () => set({ eventDetailId: null }),
}))

