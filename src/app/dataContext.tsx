import { createContext } from "react";
import { Goals } from "./types";

export type Store = {
    points: string;
    goals: Goals;
}

export const DataContext = createContext<Store>({
    points: '',
    goals: {},
});