import { createContext } from "react";
import { Goals, Task } from "./types";

export type Store = {
    points: string;
    goals: Goals;
    tasks: Record<string, Task>;
    fetchAll: () => Promise<void>;
}

export const DataContext = createContext<Store>({
    points: '',
    goals: {},
    tasks: {},
    fetchAll: async () => { },
});