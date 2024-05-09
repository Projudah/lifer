"use client"

import { useRouter } from "next/navigation";
import Button from "./components/Button/Button";
import Layout from "./components/Layout/Layout";
import { useContext, useEffect, useState } from "react";
import { DataContext } from "./dataContext";
import Goal from "./components/Goal";
import GoalModal from "./components/Goal/GoalModal";
import { GoalType, Goals } from "./types";


export default function Home() {
  const router = useRouter();
  const { points, goals: initialGoals } = useContext(DataContext);
  const [goals, setGoals] = useState<Goals>(initialGoals);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalType | undefined>(undefined);

  useEffect(() => {
    if (initialGoals) {
      setGoals(initialGoals);
    }
  }, [initialGoals]);


  const goalsMarkup = goals && Object.keys(goals).map((goalId) => {
    const goalObject = goals[goalId];
    return <Goal key={goalObject.name} name={goalObject.name} steps={goalObject.steps} />;
  });
  const pointsMarkup = <h1>{points ? points : 'loading'} pts</h1>

  const handleEarn = () => router.push("/earn");

  const handleUse = () => router.push("/use");

  const handleCloseGoalModal = () => setGoalModalOpen(false);

  const handleOpenGoalModal = () => setGoalModalOpen(true);

  const handleNewGoal = async (newGoal: GoalType) => {
    const updatedGoals = {
      ...goals,
      [newGoal.name]: newGoal,
    }

    const res = await fetch("api/goals", {
      method: "POST",
      body: JSON.stringify(updatedGoals),
    });

    const response = await res.json();
    if (response) {
      setGoals(updatedGoals)
    }
    handleCloseGoalModal()
  };

  return (
    <Layout>
      <Button label="Add Goal" onAction={handleOpenGoalModal} />
      {goalsMarkup}
      {pointsMarkup}
      <Button label="Use" onAction={handleUse} type="use" />
      <Button label="Earn" onAction={handleEarn} type="earn" />
      <GoalModal goal={currentGoal} open={goalModalOpen} onClose={handleCloseGoalModal} onSubmit={handleNewGoal} />
    </Layout>
  );
}
