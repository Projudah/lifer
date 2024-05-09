'use client'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { DataContext } from "./dataContext";
import { Goals, Task } from "./types";

const inter = Inter({ subsets: ["latin"] });

const tempGoals: Goals = {
  "Goal 1": {
    name: "Goal 1",
    steps: [
      {
        name: "Step 1",
        tasks: [],
      },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [points, setPoints] = useState<string>();
  const [goals, setGoals] = useState<Goals>();
  const [tasks, setTasks] = useState<Record<string, Task>>();

  const getPoints = async () => {
    const res = await fetch("api/points", {
      method: "GET",
    });
    const data = await res.json();
    setPoints(data);
  };

  const getGoals = async () => {
    const res = await fetch("api/goals", {
      method: "GET",
    });
    const data = await res.json();
    setGoals(data);
  };

  const getTasks = async () => {
    const res = await fetch("api/tasks", {
      method: "GET",
    });
    const data = await res.json();
    const tasksArray = data.data;
    const tasksObject: Record<string, Task> = {};
    tasksArray.forEach((task: Task) => {
      tasksObject[task.id] = task;
    });
    setTasks(tasksObject);
  };

  useEffect(() => {
    getGoals();
    getPoints();
    getTasks();
  }, []);


  return (
    <html lang="en">
      <body className={inter.className}>
        <DataContext.Provider value={{
          points: points || '',
          goals: goals || {},
          tasks: tasks || {},
        }}>
          {children}
        </DataContext.Provider>
      </body>
    </html>
  );
}
