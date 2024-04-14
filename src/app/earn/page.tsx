'use client'
import { useRouter } from "next/navigation";
import Layout from "../components/Layout/Layout";
import { useContext, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { PointsContext } from "../dataContext";
import Button from "../components/Button/Button";
import { Action } from "../components/Modal/Modal";

type Task = {
    id: string;
    title: string;
    timeChunksRequired: number;
}


export default function Earn() {
    const router = useRouter();
    const [data, setData] = useState<Task[]>();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<string>('');
    const [modalAction, setModalAction] = useState<Action>();
    const points = useContext(PointsContext);

    const getData = async () => {
        const res = await fetch('earn/api', {
            method: 'GET',
        });
        const data = await res.json();
        setData(data.data);
    };

    useEffect(() => {
        if (!data) {
            getData();
        }
    }, [data]);

    const handleGoBack = () => router.push("/");

    const updatePoints = async (newPoints: string) => {
        const newTotal = parseInt(newPoints) + parseInt(points);
        const res = await fetch('api/points', {
            method: 'POST',
            body: JSON.stringify({ points: newTotal }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error updating points');
            return;
        }
        setModalData('You now have ' + newTotal + ' points!');
    };

    const completeTask = async (task: Task) => {
        setModalData(`Earning ${task.timeChunksRequired} points...`);

        const res = await fetch('earn/api', {
            method: 'POST',
            body: JSON.stringify({ id: task.id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error completing task');
            return;
        }
        await updatePoints(task.timeChunksRequired.toString());
    };

    const handleEarnClick = async (task: Task) => {
        setModalData(`Complete task "${task.title}" for ${task.timeChunksRequired} points?`);
        setModalAction({ label: 'Complete', onAction: () => completeTask(task) });
        setModalOpen(true);
    }

    const handleModalClose = () => {
        window.location.reload();
    }

    if (!data || !points) return <div>loading</div>

    const tasksMarkup = data.flatMap((task: Task, index: number) => {
        const taskName = task.title;
        const taskPoints = task.timeChunksRequired;

        const newEntry = []
        newEntry.push(<Button key={`${index}earnButton`} label={`${taskPoints} pts`} onAction={() => handleEarnClick(task)} type="earn" />)
        newEntry.push(<div key={`${index}earnLabel`} >{taskName}</div>)
        return newEntry;
    });

    return <>
        <Layout horizontal>
            <h1>Earn</h1>
            <Button label="Go back" onAction={handleGoBack} />
        </Layout>

        <Layout twocolumn>

            {tasksMarkup}
        </Layout>
        <Modal open={modalOpen} title="Earn" onClose={handleModalClose} secondaryAction={modalAction}>{modalData}</Modal>
    </>
}