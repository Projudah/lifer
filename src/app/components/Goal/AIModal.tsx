import { useState } from "react";
import Layout from "../Layout/Layout";
import Modal from "../Modal";
import { Action } from "../Modal/Modal";
import { GoalType, Task } from "@/app/types";
import Button from "../Button/Button";


type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (goals: GoalType[]) => void;
}

const calculateDueDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

export default function AIModal({ open, onClose, onSubmit }: Props) {
    const [goals, setGoals] = useState<{ description: string, dueDate: string, completed: boolean }[]>([{ description: "", dueDate: calculateDueDate(), completed: false }]); // Initialize with one empty goal
    const [responses, setResponses] = useState<{ [key: number]: string }>({});
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleGoalDescriptionChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newGoals = [...goals];
        newGoals[index].description = event.target.value;
        setGoals(newGoals);
    }

    const handleDueDateChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newGoals = [...goals];
        newGoals[index].dueDate = event.target.value;
        setGoals(newGoals);
    }

    const handleToggleCompleted = (index: number) => {
        const newGoals = [...goals];
        newGoals[index].completed = !newGoals[index].completed;
        setGoals(newGoals);
    }

    const handleAddGoal = () => {
        setGoals([...goals, { description: "", dueDate: calculateDueDate(), completed: false }]);
    }

    const handleRemoveGoal = (index: number) => {
        const newGoals = goals.filter((_, i) => i !== index);
        const newResponses = { ...responses };
        delete newResponses[index];
        setGoals(newGoals);
        setResponses(newResponses);
    }

    function completeTask(task: Task): Task {
        const completedTask: Task = {
            ...task,
            status: "ARCHIVED",
            timeChunksRequired: 0,
            timeChunksSpent: Number(task.timeChunksRequired), // Assume all required time is spent
            timeChunksRemaining: 0,
            finished: new Date().toISOString(), // Mark as finished now
        };

        return completedTask;
    }

    async function checkStatus(runId: string, threadId: string, index: number) {
        const response = await fetch(`/api/assistant?runId=${runId}&threadId=${threadId}`);
        const data = await response.json();

        if (data.status === 'completed') {
            const responseText = data.messages.data[0].content[0].text.value;
            setResponses(prevResponses => ({
                ...prevResponses,
                [index]: prettifyJSON(responseText)
            }));
            setIsCompleted(true);
            setLoading(false);
        } else if (data.status === 'failed') {
            setResponses(prevResponses => ({
                ...prevResponses,
                [index]: "Failed to generate response"
            }));
            setLoading(false);
        } else {
            setResponses(prevResponses => ({
                ...prevResponses,
                [index]: data.status
            }));
            setTimeout(() => checkStatus(runId, threadId, index), 3000); // Poll every 3 seconds
        }
    }

    const handleGenerateGoal = async () => {
        if (loading) {
            return;
        }
        if (goals.some(goal => !goal.description)) {
            setResponses({ 0: "Please enter all goal descriptions..." });
            return;
        }
        setIsCompleted(false);
        setLoading(true);
        setResponses(goals.reduce((acc, _, index) => ({ ...acc, [index]: "Loading..." }), {}));

        try {
            await Promise.all(goals.map(async (goal, index) => {
                const bodyValue = `${goal.description} due: ${goal.dueDate} completed: ${goal.completed}`;
                const response = await fetch("/api/assistant", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(bodyValue)
                });

                if (!response.ok) {
                    throw new Error("Failed to generate response");
                }

                const data = await response.json();
                checkStatus(data.runId, data.threadId, index);
            }));

        } catch (error) {
            console.error(error);
            setResponses({ 0: "Failed to generate response" });
        } finally {
            setLoading(false);
        }
    }

    const prettifyJSON = (json: string) => {
        try {
            return JSON.stringify(JSON.parse(json), null, 2);
        } catch (e) {
            return json;
        }
    }

    const handleSubmit = () => {
        const parsedJSON = Object.values(responses).map(response => JSON.parse(response));
        onSubmit(parsedJSON);
    }

    const getAction = (): Action => {
        if (isCompleted) {
            return {
                label: "Add Goals",
                onAction: handleSubmit
            }
        } else {
            return {
                label: "Generate",
                onAction: handleGenerateGoal
            }
        }
    }

    return (
        <Modal
            open={open}
            title={"AI"}
            onClose={onClose}
            secondaryAction={getAction()}
        >
            <Layout>
                <label>Describe goals</label>
                {goals.map((goal, index) => (
                    <Layout horizontal key={index} center>
                        <label>Goal {index + 1}</label>
                        <textarea
                            className="jsonTextArea"
                            value={goal.description}
                            onChange={(e) => handleGoalDescriptionChange(index, e)}
                        />
                        <label>Due</label>
                        <input
                            type="date"
                            value={goal.dueDate}
                            onChange={(e) => handleDueDateChange(index, e)}
                        />
                        <input className="checkBox" type="checkbox" checked={goal.completed} onChange={() => handleToggleCompleted(index)} />
                        {index > 0 && (
                            <Button onAction={() => handleRemoveGoal(index)} label="-" />
                        )}
                        <div className="responseArea">{responses[index]}</div>
                    </Layout>
                ))}
                <Button onAction={handleAddGoal} label="Add Goal" />
            </Layout>
        </Modal>
    )
}