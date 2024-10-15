import { useState } from "react";
import Layout from "../Layout/Layout";
import Modal from "../Modal";
import { Action } from "../Modal/Modal";
import { GoalType } from "@/app/types";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (goal: GoalType) => void;
}

const calculateDueDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

export default function AIModal({ open, onClose, onSubmit }: Props) {
    const [goalDescription, setGoalDescription] = useState<string>("");
    const [response, setResponse] = useState<string>('Enter a goal description to generate a response');
    const [dueDate, setDueDate] = useState<string>(calculateDueDate());
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleGoalDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setGoalDescription(event.target.value);
    }

    async function checkStatus(runId: string, threadId: string) {
        const response = await fetch(`/api/assistant?runId=${runId}&threadId=${threadId}`);
        const data = await response.json();

        if (data.status === 'completed') {
            const responseText = data.messages.data[0].content[0].text.value;
            setResponse(prettifyJSON(responseText));
            setIsCompleted(true);
            setLoading(false);
        } else {
            setResponse(data.status);
            setTimeout(() => checkStatus(runId, threadId), 3000); // Poll every 5 seconds

        }
    }


    const handleGenerateGoal = async () => {
        if (loading) {
            return;
        }
        if (!goalDescription) {
            setResponse("Please enter a goal description...");
            return;
        }
        setIsCompleted(false);
        setLoading(true);
        setResponse("Loading...");
        // add `due dueDate` to the goal description
        const bodyValue = `${goalDescription} due ${dueDate}`;
        const response = await fetch("/api/assistant", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyValue)
        })

        if (!response.ok) {
            console.error("Failed to generate response");
            setResponse("Failed to generate response");
            return;
        }

        const data = await response.json();
        checkStatus(data.runId, data.threadId);
    }

    const prettifyJSON = (json: string) => {
        try {
            return JSON.stringify(JSON.parse(json), null, 2);
        } catch (e) {
            return json;
        }
    }

    const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDueDate(event.target.value);
    }

    const handleSubmit = () => {
        const parsedJSON = JSON.parse(response);
        onSubmit(parsedJSON);
    }

    const getAction = (): Action => {
        if (isCompleted) {
            return {
                label: "Add Goal",
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
                <label>Describe goal</label>
                <textarea className="jsonTextArea"
                    value={goalDescription}
                    onChange={handleGoalDescriptionChange}
                />
                <label>Due</label>
                <input type="date" value={dueDate}
                    onChange={handleDueDateChange}
                />
            </Layout>
            <Layout>
                <label>Response</label>
                <div className="responseArea">{response}</div>
            </Layout>
        </Modal>
    )
}