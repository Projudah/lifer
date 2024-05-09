'use client'
import { useRouter } from "next/navigation";
import Layout from "../components/Layout/Layout";
import { useContext, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { DataContext } from "../dataContext";
import Button from "../components/Button/Button";
import { Action } from "../components/Modal/Modal";
import { Task } from "../types";
import TaskModal from "../components/Task/TaskModal";


export default function Earn() {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<string>('');
    const [modalAction, setModalAction] = useState<Action>();
    const { points, tasks: data, goals } = useContext(DataContext);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);

    const handleGoBack = () => router.push("/");

    const updatePoints = async (newPoints: string) => {
        const newTotal = parseInt(newPoints) + parseInt(points);
        const res = await fetch('api/points', {
            method: 'POST',
            body: JSON.stringify({ points: newTotal }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error updating points');
            return;
        }
        setModalData('You now have ' + newTotal + ' points!');
    };

    const completeTask = async (task: Task) => {
        setModalData(`Earning ${task.timeChunksRequired} points...`);

        const res = await fetch('earn/api', {
            method: 'POST',
            body: JSON.stringify({ id: task.id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error completing task');
            return;
        }
        await updatePoints(task.timeChunksRequired.toString());
    };

    const handleEarnClick = async (task: Task) => {
        setModalData(`Complete task "${task.title}" for ${task.timeChunksRequired} points?`);
        setModalAction({ label: 'Complete', onAction: () => completeTask(task) });
        setModalOpen(true);
    }

    const handleModalClose = () => {
        window.location.reload();
    }

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setEditTaskModalOpen(true);
    };

    const handleTaskModalClose = () => {
        setEditTaskModalOpen(false);
    };

    const addTaskToGoal = async (task: Task, selectedGoal: string, selectedStep: number) => {
        const taskGoal = { ...goals[selectedGoal] };
        const taskStep = taskGoal.steps[selectedStep];
        taskStep.tasks.push(task.id);

        taskGoal.steps[selectedStep] = taskStep;

        const res = await fetch('api/goals', {
            method: 'POST',
            body: JSON.stringify({ [selectedGoal]: taskGoal }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            return false;
        }
        return true;
    }

    const handleSubmitTask = async (task: Task, selectedGoal: string, selectedStep: number) => {
        setModalOpen(true);
        handleTaskModalClose();
        const res = await fetch('api/tasks', {
            method: 'PUT',
            body: JSON.stringify(task),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error saving task');
            return;
        }
        const res2 = addTaskToGoal(task, selectedGoal, selectedStep);
        if (!res2) {
            setModalData('Error saving task to goal');
            return;
        }
        setModalData('Task saved');
    };

    if (!data || !points) return <div>loading</div>

    const tasksMarkup = Object.values(data).filter((task: Task) => task.status !== "ARCHIVED").map((task: Task, index: number) => {
        const taskName = task.title;
        const taskPoints = task.timeChunksRequired;
        const hasGoal = task.notes && task.notes.includes('goal');

        const earnB = <Button key={`${index}earnButton`} label={`${taskPoints} pts`} onAction={() => handleEarnClick(task)} type="earn" />
        const taskLabelMarkup = <div key={`${index}earnLabel`} >{taskName}</div>
        const entry = <Layout key={`${index}earnLayout`} horizontal>
            {earnB}
            {taskLabelMarkup}
            <Button key={`${index}earnEditButton`} label={hasGoal ? "Edit" : "Add goal"} onAction={() => handleEdit(task)} />
        </Layout>
        return entry;
    });

    return <>
        <Layout horizontal>
            <h1>Earn</h1>
            <Button label="Go back" onAction={handleGoBack} />
        </Layout>

        <Layout left>
            {tasksMarkup}
        </Layout>
        <Modal open={modalOpen} title="Earn" onClose={handleModalClose} secondaryAction={modalAction}>{modalData}</Modal>
        <TaskModal task={selectedTask} open={editTaskModalOpen} onClose={handleTaskModalClose} onSubmit={handleSubmitTask} />
    </>
}