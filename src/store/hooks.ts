
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Hook con tipo de dispatch automático
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook selector tipado
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
