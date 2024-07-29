import { useState } from "react";
import Layout from "../Layout/Layout";
import Modal from "../Modal";

type Props = {
    open: boolean;
    onClose: () => void;
}

const calculateDueDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

export default function AIModal({ open, onClose }: Props) {
    const [goalDescription, setGoalDescription] = useState<string>("");
    const [response, setResponse] = useState<string>('Enter a goal description to generate a response');
    const [dueDate, setDueDate] = useState<string>(calculateDueDate());

    const handleGoalDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGoalDescription(event.target.value);
    }

    const handleSubmit = async () => {
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
        const responseText = data?.data?.[0]?.content?.[0]?.text?.value;
        setResponse(prettifyJSON(responseText));
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
    return (
        <Modal
            open={open}
            title={"AI"}
            onClose={onClose}
            secondaryAction={{
                label: "Generate",
                onAction: handleSubmit
            }
            }
        >
            <Layout>
                <label>Describe goal</label>
                <input type="text"
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
                <textarea
                    className="jsonTextArea"
                    value={response}
                    readOnly
                />
            </Layout>
        </Modal>
    )
}