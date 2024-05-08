import { GoalType, Step } from "@/app/types";
import Layout from "../Layout/Layout";

export default function Goal({ name, steps }: GoalType) {

    const generateStep = (step: Step) => {
        return (
            <Layout key={step.name}>
                <h2>{step.name}</h2>
                <div>
                    {step.tasks.map(task => {
                        return (
                            <div key={task.title}>
                                <h3>{task.title}</h3>
                                <p>{task.timeChunksRequired} time chunks</p>
                            </div>
                        )
                    })}
                </div>
            </Layout>
        )
    }
    return (
        <Layout>
            <h1>{name}</h1>
            <Layout horizontal>
                {steps && Object.keys(steps).map((stepId) => {
                    return generateStep(steps[Number(stepId)]);
                })}
            </Layout>
        </Layout>
    )
}