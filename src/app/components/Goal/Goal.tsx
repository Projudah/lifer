import { GoalType, Step } from "@/app/types";
import Layout from "../Layout/Layout";
import { useContext, useState } from "react";
import { DataContext } from "@/app/dataContext";

function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="progressBarContainer">
            <div className="progressBar" style={{ width: `${progress}%` }}></div>
        </div>
    )
}

export default function Goal({ name, steps }: GoalType) {
    const [expanded, setExpanded] = useState(false);
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
                if (tasks[taskId]?.status === "ARCHIVED") {
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
                        const task = tasks[taskId];
                        return (
                            <Layout className="stepTaskEntry" key={task.title} horizontal>
                                <input type="checkbox" checked={task.status === "ARCHIVED"} />
                                <p>{task.title}</p>
                            </Layout>
                        )
                    })}
                </div>
            </Layout>
        )
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
                    </div>
                }
            </Layout>
        </>

    )
}