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
    const [data, setData] = useState<any>();
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
        const rewards = Object.entries(data).map(([name, cost]) => ({ name, cost }));
        setData(rewards);
    };

    if (!data) {
        getData();
    }

    const handleGoBack = () => router.push("/");

    const claimReward = async (reward: Reward) => {
        setModalData(`Claiming ${reward.name}...`);
        setModalAction(undefined);

        const newTotal = parseInt(points) - parseInt(reward.cost);
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
        setModalData('You now have ' + newTotal + ' points left');
    };

    const handleRewardClick = async (reward: Reward) => {
        setModalData(`Claim "${reward.name}" for ${reward.cost} points?`);
        setModalAction({ label: 'Complete', onAction: () => claimReward(reward) });
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
        <Button label="Add Reward" onAction={() => setAddRewardModalOpen(true)} />
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

    const hasRewards = data == 'no rewards found' ? false : true;


    const rewardsMarkup = hasRewards && data.map((reward: Reward, index: number) => {
        const rewardName = reward.name;
        const rewardCost = reward.cost;

        return <Layout key={index} horizontal left>
            <button className="earnButton" onClick={() => handleRewardClick(reward)}>{rewardCost} pts</button>
            <div>{rewardName}</div>
        </Layout>
    });


    return <>
        {hasRewards ? <Layout>
            <h1>{points} pts</h1>
            <Layout horizontal left>
                <Button label="Go back" onAction={handleGoBack} />
                {addRewardMarkup}
            </Layout>
            {rewardsMarkup}
        </Layout> : <Layout>{"No rewards available"}{addRewardMarkup}</Layout>
        }
        <Modal open={modalOpen} title="Earn" onClose={handleModalClose} secondaryAction={modalAction}>{modalData}</Modal>
    </>
}