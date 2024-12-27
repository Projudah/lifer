import { Task, GoalType } from "@/app/types";
import Layout from "../Layout/Layout";
import Modal from "../Modal";
import { error } from "console";
import { useContext, useState } from "react";
import { DataContext } from "@/app/dataContext";
import Button from "../Button/Button";

interface Props {
    task: Task;
    viewGoal?: (goal: GoalType) => void;
    skipGoal?: (goal: GoalType) => void;
}
export default function TaskView({
    task,
    viewGoal,
    skipGoal
}: Props) {
    const [dialogState, setDialogState] = useState<string>();
    const [error, setError] = useState<string>();
    const { tasks, fetchAll } = useContext(DataContext);


    const completeTask = async () => {

        setDialogState('loading');

        const res = await fetch('earn/api', {
            method: 'POST',
            body: JSON.stringify({ id: task.id }),
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

    const renderDialog = () => {
        switch (dialogState) {
            case "error":
                return <Modal open={true} title="Error" onClose={handleCloseConfirmModal}><p>{error}</p></Modal>
            case "confimComplete":
                return <Modal open={true} title="Complete Task" onClose={() => { setDialogState(undefined) }} secondaryAction={{ label: "Yes", onAction: completeTask }}><p>Complete task {task?.title}?</p></Modal>
            case "success":
                return <Modal open={true} title="Success" onClose={handleCloseConfirmModal}><p>{'Task completed successfully'}</p></Modal>
            case "loading":
                return <Modal open={true} title="Loading" onClose={() => { }}><p>Loading...</p></Modal>
            default:
                return null;

        }
    }

    const handleCloseConfirmModal = () => {
        if (error) {
            setError(undefined);
        }
        setDialogState(undefined);
        fetchAll();
    }

    return (
        <Layout>
            <p>{task.title}</p>
            <Layout horizontal>
                <p>{task.notes}</p>
                <p>{task.status}</p>
            </Layout>
            <Button label="Complete" onAction={() => setDialogState('confimComplete')} />
            {renderDialog()}
        </Layout>
    );
}