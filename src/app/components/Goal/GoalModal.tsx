import { GoalType, Step } from "@/app/types";
import Layout from "../Layout/Layout";
import Modal from "../Modal";
import { useState } from "react";
import Button from "../Button/Button";

type Props = {
    goal?: GoalType;
    open: boolean;
    onClose: () => void;
    onSubmit: (goal: GoalType) => void;
    onDelete?: () => void;
}

type StepProps = {
    index: number;
    onChange: (value: string, index: number) => void;
    initialValue?: string;
}

const emptyGoal: GoalType = {
    name: "New Goal",
    steps: [{
        name: "New Step",
        tasks: []
    }
    ]
}

function StepInput({ index, onChange, initialValue }: StepProps) {

    const [stepValue, setStepValue] = useState(initialValue || `New Step ${index}+1`);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setStepValue(value);
        onChange(value, index);
    }

    return (
        <Layout horizontal>
            <label>Step Name</label>
            <input type="text" id={index.toString()} value={stepValue} onChange={handleChange} />
        </Layout>
    );
}

export default function GoalModal({ goal, open, onClose, onSubmit, onDelete }: Props) {
    const goalData = goal || emptyGoal;

    const [newGoal, setNewGoal] = useState(goalData);
    const [newSteps, setNewSteps] = useState<string[]>(goalData.steps.map(step => step.name));
    const [useJSON, setUseJSON] = useState<boolean>(false);
    const [jsonValue, setJSONValue] = useState<string>(JSON.stringify(newGoal));

    const handleGoalNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewGoal({
            ...newGoal,
            name: event.target.value,
        });
    }

    const handleAddStep = () => {
        const tempSteps = [...newSteps];
        tempSteps.push(`New Step ${tempSteps.length + 1}`);
        setNewSteps(tempSteps);
    };

    const handleStepNameChange = (value: string, index: number) => {
        const tempSteps = [...newSteps];
        tempSteps[index] = value;
        setNewSteps(tempSteps);
    }

    const stepMarkup = newSteps.map((step, index) => {
        return (
            <StepInput key={index} index={index} onChange={handleStepNameChange} initialValue={step} />
        );
    });

    const handleSubmit = () => {
        if (useJSON) {
            const parsedJSON = JSON.parse(jsonValue);
            onSubmit(parsedJSON);
            return;
        }
        newGoal.steps = newSteps.map(step => {
            return {
                name: step,
                tasks: []
            }
        });
        onSubmit(newGoal);
    };

    const handleJSONChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJSONValue(event.target.value);
    }

    return (
        <Modal
            open={open}
            title={"Goal"}
            onClose={onClose}
            secondaryAction={{
                label: "Save",
                onAction: handleSubmit,
            }}
        >
            {!useJSON && <Layout>
                <Layout>
                    <label>Goal Name</label>
                    <input type="text" value={newGoal.name} onChange={handleGoalNameChange} />
                    {stepMarkup}
                </Layout>
                <Button onAction={handleAddStep} label="Add Step" type="default" />
                {onDelete && <Button onAction={onDelete} label="Delete" type="delete" />}
            </Layout>}
            {useJSON && <Layout>
                <label>JSON</label>
                <textarea className="jsonTextArea" value={jsonValue} onChange={handleJSONChange} />
            </Layout>}
            <Button onAction={() => setUseJSON(!useJSON)} label={useJSON ? "Use Form" : "Use JSON"} type="default" />
        </Modal>
    );
}