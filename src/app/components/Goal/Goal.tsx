import { GoalType, Step } from "@/app/types";
import Layout from "../Layout/Layout";
import { useContext, useState } from "react";
import { DataContext } from "@/app/dataContext";
import Button from "../Button/Button";
import GoalModal from "./GoalModal";
import Modal from "../Modal";

export function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="progressBarContainer">
            <div className="progressBar" style={{ width: `${progress}%` }}></div>
        </div>
    )
}

export default function Goal({ name, steps }: GoalType) {
    const [expanded, setExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [error, setError] = useState<string>();
    const { tasks } = useContext(DataContext);

    const toggleSteps = () => {
        setExpanded(!expanded);
    }

    const calculateProgress = () => {
        let totalTasks = 0;
        let completedTasks = 0;
        steps.forEach(step => {
            step.tasks.forEach(taskId => {
                totalTasks++;
                if (taskId.id && tasks[taskId.id]?.status === "ARCHIVED") {
                    completedTasks++;
                }
            })
        })
        const progress = Math.round((completedTasks / totalTasks) * 100);
        return progress;
    }

    const generateStep = (step: Step) => {
        return (
            <Layout key={step.name} className="stepColumn">
                <p className='stepTitle'>{step.name}</p>
                <div>
                    {step.tasks.map(taskId => {
                        const task = taskId.id && tasks[taskId.id];
                        if (!task) return null;
                        return (
                            <Layout className="stepTaskEntry" key={task.title} horizontal>
                                <input type="checkbox" checked={task.status === "ARCHIVED"} readOnly />
                                <p>{task.title}</p>
                            </Layout>
                        )
                    })}
                </div>
            </Layout>
        )
    }

    const closeModal = () => {
        setModalOpen(false);
    }

    const handleEditGoal = () => {
        setModalOpen(true);
    }

    const handleModalSubmit = async (goal: GoalType) => {
        closeModal();

        const res = await fetch("api/goals", {
            method: "POST",
            body: JSON.stringify({
                [goal.name]: goal
            })
        });

        const response = await res.json();
        if (response) {
            window.location.reload();
        }
    }

    const confirmDeleteGoal = () => {
        closeModal();
        setConfirmModalOpen(true)
    }

    const handleDeleteGoal = () => {
        const res = fetch("api/goals", {
            method: "DELETE",
            body: JSON.stringify({
                id: name
            })
        });

        res.then(response => {
            if (response.ok) {
                setConfirmModalOpen(false);
                window.location.reload();
            } else {
                setError("Error deleting goal");
            }
        })
    }

    const handleCloseConfirmModal = () => {
        if (error) {
            setError(undefined);
        }
        setConfirmModalOpen(false);
    }
    return (
        <>
            <ProgressBar progress={calculateProgress()} />

            <Layout className="goalContainer">
                <p className="goalTitle" onClick={toggleSteps}>{name}</p>
                {expanded &&
                    <div className="stepsContainer">
                        <Layout horizontal className="stepsLayout">
                            {steps && Object.keys(steps).map((stepId) => {
                                return generateStep(steps[Number(stepId)]);
                            })}
                        </Layout>
                        <Button onAction={handleEditGoal} label="Edit" />
                    </div>
                }
            </Layout>
            <GoalModal open={modalOpen} goal={{ name, steps }} onClose={closeModal} onSubmit={handleModalSubmit} onDelete={confirmDeleteGoal} />
            <Modal open={confirmModalOpen} title="Delete Goal" onClose={handleCloseConfirmModal} secondaryAction={error ? undefined : { label: "Yes", onAction: handleDeleteGoal }}>
                {error ? <p>{error}</p> : <p>Are you sure you want to delete this goal?</p>}
            </Modal>
        </>

    )
}