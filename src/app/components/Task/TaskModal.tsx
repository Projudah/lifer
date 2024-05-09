import { GoalType, Step, Task } from "@/app/types";
import Layout from "../Layout/Layout";
import Modal from "../Modal";
import { useContext, useEffect, useState } from "react";
import { DataContext } from "@/app/dataContext";

type Props = {
    task?: Task;
    open: boolean;
    onClose: () => void;
    onSubmit: (task: Task, selectedGoal: string, selectedStep: number) => void;
}

const emptyTask: Task = {
    id: "",
    title: "",
    eventColor: null,
    eventCategory: "",
    timeChunksRequired: 0,
    minChunkSize: 0,
    maxChunkSize: 0,
    notes: "",
    alwaysPrivate: false,
    timeSchemeId: "",
    priority: "",
    snoozeUntil: null,
    due: "",
    onDeck: false,
}


export default function TaskModal({ task, open, onClose, onSubmit }: Props) {

    const { goals } = useContext(DataContext)

    const [newTask, setNewTask] = useState<Task>(task || emptyTask);
    const [goalOptions, setGoalOptions] = useState<string[]>(Object.keys(goals));
    const [stepOptions, setStepOptions] = useState<number[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<string>('');
    const [selectedStep, setSelectedStep] = useState<number>(0);

    useEffect(() => {
        if (task) {
            setNewTask(task);
            setStepOptions([])
        }
    }, [task]);

    useEffect(() => {
        if (goals && Object.keys(goals).length > 0) {
            let selectedGoalId;
            let selectedStepId;

            if (newTask?.notes?.includes('goal')) {
                const goalNote = JSON.parse(newTask.notes);
                selectedGoalId = goalNote.goal;
                selectedStepId = parseInt(goalNote.step);
            } else {
                let options = goalOptions
                if (options.length === 0) {
                    options = Object.keys(goals);
                    setGoalOptions(Object.keys(goals));
                }
                selectedGoalId = options[0];
                selectedStepId = 0; // Default to the first step
            }

            if (goals[selectedGoalId] === undefined) {
                selectedGoalId = Object.keys(goals)[0];
                selectedStepId = 0;
            }

            setSelectedGoal(selectedGoalId);
            setStepOptions(goals[selectedGoalId]?.steps.map((_step, index) => index));
            setSelectedStep(selectedStepId);
        }
    }, [goalOptions, goals, newTask]);

    const handleSetGoal = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const goalName = event.target.value;
        setSelectedGoal(goalName);
        setStepOptions(goals[goalName].steps.map((_step, index) => index));
    }

    const handleSetStep = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const stepIndex = parseInt(event.target.value);
        setSelectedStep(stepIndex);
    }

    const handleSetDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = event.target.value;
        setNewTask({ ...newTask, due: dateString });
    }

    const handleSubmit = () => {
        const goalNote = `{"goal": "${selectedGoal}", "step": "${selectedStep}"}`;

        const retTask = { ...newTask, notes: goalNote };
        setNewTask(retTask);
        onSubmit(retTask, selectedGoal, selectedStep);
    };

    function convertToDate(input: string): string {
        if (!input) return ''
        const date = new Date(input);
        return date.toISOString().split('T')[0];
    }

    return (
        <Modal
            open={open}
            title={"Edit Task"}
            onClose={onClose}
            secondaryAction={{
                label: "Save",
                onAction: handleSubmit,
            }}
        >
            <Layout>
                <Layout horizontal>
                    <label>Title</label>
                    <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                        }
                    />
                </Layout>
                <Layout horizontal>
                    <label>Points</label>
                    <input
                        type="number"
                        value={newTask.timeChunksRequired}
                        onChange={(e) =>
                            setNewTask({
                                ...newTask,
                                timeChunksRequired: parseInt(e.target.value),
                            })
                        }
                    />
                </Layout>

                <Layout horizontal>
                    <label>Due Date</label>
                    <input
                        type="date"
                        value={convertToDate(newTask.due)}
                        onChange={handleSetDate}
                    />
                </Layout>

                <Layout horizontal>
                    <label>Goal</label>
                    <select value={selectedGoal} onChange={handleSetGoal}>
                        {goalOptions.map((goal) => (
                            <option key={goal} value={goal}>
                                {goal}
                            </option>
                        ))}
                    </select>
                </Layout>

                <Layout horizontal>
                    <label>Step</label>
                    <select value={selectedStep} onChange={handleSetStep}>
                        {stepOptions?.map((step) => (
                            <option key={step} value={step}>
                                {goals[selectedGoal].steps[step].name}
                            </option>
                        ))}
                    </select>
                </Layout>
            </Layout>
        </Modal>
    );
}