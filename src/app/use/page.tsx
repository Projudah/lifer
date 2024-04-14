'use client'
import { useRouter } from "next/navigation";
import Layout from "../components/Layout/Layout";
import { useContext, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { PointsContext } from "../dataContext";
import Button from "../components/Button/Button";
import { Action } from "../components/Modal/Modal";

type Reward = {
    name: string;
    cost: string;
}

export default function Use() {
    const router = useRouter();
    const [data, setData] = useState<Reward[] | string>();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<string>('');
    const [modalAction, setModalAction] = useState<Action>();
    const [addRewardModalOpen, setAddRewardModalOpen] = useState(false);

    const [newRewardName, setNewRewardName] = useState<string>('');
    const [newRewardCost, setNewRewardCost] = useState<string>('');

    const points = useContext(PointsContext);

    const getData = async () => {
        const res = await fetch('use/api', {
            method: 'GET',
        });
        const data = await res.json();
        if (data == 'no rewards found') {
            setData(data);
            return;
        }
        const rewards = Object.entries<string>(data).map(([name, cost]) => ({ name, cost }));
        setData(rewards);
    };

    useEffect(() => {
        if (!data) {
            getData();
        }
    }, [data]);

    const handleGoBack = () => router.push("/");

    const claimReward = async (reward: Reward) => {
        setModalData(`Claiming ${reward.name}...`);
        setModalAction(undefined);

        const newTotal = parseInt(points) - parseInt(reward.cost);
        const res = await fetch('api/points', {
            method: 'POST',
            body: JSON.stringify({ points: newTotal.toString() }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error updating points');
            return;
        }
        setModalData('You now have ' + newTotal + ' points left');
    };

    const handleRewardClick = async (reward: Reward) => {
        setModalData(`Claim "${reward.name}" for ${reward.cost} points?`);
        setModalAction({ label: 'Complete', onAction: () => claimReward(reward) });
        setModalOpen(true);
    }

    const handleDeleteReward = async (reward: Reward) => {
        setModalData(`Deleting ${reward.name}...`);
        setModalAction(undefined);

        const res = await fetch('use/api', {
            method: 'DELETE',
            body: JSON.stringify({
                name: reward.name,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error deleting reward');
            return;
        }
        setModalData('Reward deleted!');
    };

    const handleDeleteClick = async (reward: Reward) => {
        setModalData(`Delete "${reward.name}"?`);
        setModalAction({ label: 'Delete', onAction: () => handleDeleteReward(reward) });
        setModalOpen(true);
    }

    const handleModalClose = () => {
        window.location.reload();
    }

    const handleAddReward = async () => {
        setAddRewardModalOpen(false);
        setModalData(`Adding ${newRewardName} for ${newRewardCost} points...`);
        setModalOpen(true);

        const res = await fetch('use/api', {
            method: 'POST',
            body: JSON.stringify({
                name: newRewardName,
                cost: newRewardCost,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            setModalData('Error adding reward');
            return;
        }
        setModalData('Reward added!');
    };

    const addRewardMarkup = <>
        <Button label="Add Reward" onAction={() => setAddRewardModalOpen(true)} type='use' />
        <Modal open={addRewardModalOpen} title="Add Reward" onClose={handleAddRewardModalClose} secondaryAction={{ label: "Add", onAction: handleAddReward }}>
            <Layout>
                <input type="text" placeholder="Reward name" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} />
                <input type="text" placeholder="Reward cost" value={newRewardCost} onChange={(e) => setNewRewardCost(e.target.value)} />
            </Layout>
        </Modal>
    </>

    function handleAddRewardModalClose(): void {
        setAddRewardModalOpen(false);
    }

    if (!data || !points) return <div>loading</div>

    if (!Array.isArray(data)) {
        return <Layout>{"No rewards available"}{addRewardMarkup}</Layout>
    }

    const rewardsMarkup = data.flatMap((reward: Reward, index: number) => {
        const rewardName = reward.name;
        const rewardCost = reward.cost;

        const newEntry = []
        newEntry.push(<Button key={`${index}useButton`} label={`${rewardCost} pts`} onAction={() => handleRewardClick(reward)} type="use" />)
        newEntry.push(
            <Layout horizontal>
                <div key={`${index}useLabel`} >{rewardName}</div>
                <Button key={`${index}deleteButton`} label="x" onAction={() => handleDeleteClick(reward)} type="delete" />
            </Layout>);
        return newEntry;
    });

    const hasRewardsMarkup =
        <>
            <Layout>
                <h1>{points} pts</h1>
                <Layout horizontal left>
                    <Button label="Go back" onAction={handleGoBack} />
                    {addRewardMarkup}
                </Layout>
            </Layout>
            <Layout twocolumn>
                {rewardsMarkup}
            </Layout>
        </>


    return <>
        {hasRewardsMarkup}
        <Modal open={modalOpen} title="Earn" onClose={handleModalClose} secondaryAction={modalAction}>{modalData}</Modal>
    </>
}