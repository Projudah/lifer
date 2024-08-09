import { GoalType, Step, Task } from "@/app/types";
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
    const [error, setError] = useState<string>();
    const [dialogState, setDialogState] = useState<string>();
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const { tasks, fetchAll } = useContext(DataContext);
    const [progress, setProgress] = useState(0);

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

    const completeTask = async () => {

        if (!selectedTask) return;
        setDialogState('loading');

        const res = await fetch('earn/api', {
            method: 'POST',
            body: JSON.stringify({ id: selectedTask.id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setDialogState('error');
            const error = await res.json();
            setError(error.message);
            return;
        }
        setDialogState('success');
        // update points
    };

    const completeAllTasks = async () => {
        setDialogState('loadingCompleteAll');
        const goalTasks = Object.values(steps).flatMap(step => step.tasks.map(task => task.id));
        const totalTasks = goalTasks.length;
        let currentProgress = 0;
        for (const taskId of goalTasks) {
            if (!taskId) continue;
            if (tasks[taskId]?.status === "ARCHIVED") {
                currentProgress++;
                const progressPercentage = Math.round((currentProgress / totalTasks) * 100);
                setProgress(progressPercentage);

                continue;
            };
            const res = await fetch('earn/api', {
                method: 'POST',
                body: JSON.stringify({ id: taskId }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                setDialogState('error');
                const error = await res.json();
                setError(error.message);
                return;
            }

            currentProgress++;
            const progressPercentage = Math.round((currentProgress / totalTasks) * 100);
            setProgress(progressPercentage);

        }
        setDialogState('success');
    };

    const generateStep = (step: Step) => {
        return (
            <Layout key={step.name} className="stepColumn">
                <p className='stepTitle'>{step.name}</p>
                <div>
                    {step.tasks.map(taskId => {
                        const task = taskId.id && tasks[taskId.id];
                        if (!task) return null;
                        const isCompleted = task.status === "ARCHIVED";
                        return (
                            <Layout className="stepTaskEntry" key={task.title} horizontal>
                                <input type="checkbox" checked={isCompleted} onClick={() => {
                                    if (isCompleted) return;
                                    setSelectedTask(task);
                                    setDialogState('confimComplete')
                                }} readOnly />
                                <p>{task.title}</p>
                            </Layout>
                        )
                    })}
                </div>
            </Layout>
        )
    }

    const closeModal = () => {
        setDialogState(undefined);
    }

    const handleEditGoal = () => {
        setDialogState('goal');
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
            return
        }
        setError("Error updating goal");
    }

    const confirmDeleteGoal = () => {
        setDialogState('confirmDelete');
    }

    const confirmCompleteAll = () => {
        setDialogState('confirmCompleteAll');
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
        setDialogState(undefined);
        fetchAll();
    }


    const renderDialog = () => {
        switch (dialogState) {
            case "goal":
                return <GoalModal open={true} goal={{ name, steps }} onClose={() => setDialogState(undefined)} onSubmit={handleModalSubmit} onDelete={confirmDeleteGoal} />
            case "error":
                return <Modal open={true} title="Error" onClose={handleCloseConfirmModal}><p>{error}</p></Modal>
            case "confirmDelete":
                return <Modal open={true} title="Delete Goal" onClose={() => { setDialogState(undefined) }} secondaryAction={{ label: "Yes", onAction: handleDeleteGoal }}><p>Are you sure you want to delete this goal?</p></Modal>
            case "confimComplete":
                return <Modal open={true} title="Complete Task" onClose={() => { setDialogState(undefined) }} secondaryAction={{ label: "Yes", onAction: completeTask }}><p>Complete task {selectedTask?.title}?</p></Modal>
            case "confirmCompleteAll":
                return <Modal open={true} title="Complete All Tasks" onClose={() => { setDialogState(undefined) }} secondaryAction={{ label: "Yes", onAction: completeAllTasks }}><p>Are you sure you want to complete all tasks?</p></Modal>
            case "success":
                return <Modal open={true} title="Success" onClose={handleCloseConfirmModal}><p>{'Task completed successfully (Points not yet updated)'}</p></Modal>
            case "loading":
                return <Modal open={true} title="Loading" onClose={() => { }}><p>Loading...</p></Modal>
            case "loadingCompleteAll":
                return <Modal title="Loading..." open onClose={() => { }} ><ProgressBar progress={progress} />{progress}%</Modal>
            default:
                return null;

        }
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
                        <Layout horizontal>
                            <Button onAction={handleEditGoal} label="Edit" />
                            <Button onAction={confirmCompleteAll} label="Mark all complete" />
                        </Layout>
                    </div>
                }
            </Layout>
            {renderDialog()}
        </>

    )
}