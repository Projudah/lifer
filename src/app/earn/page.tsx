'use client'
import { useRouter } from "next/navigation";
import Layout from "../components/Layout/Layout";
import { useEffect, useState } from "react";

export default function Earn() {
    const router = useRouter();
    const [data, setData] = useState<any>();

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

    if (!data) return <div>loading</div>

    const tasksMarkup = data.map((task: any, index: any) => {
        const taskName = task.title;
        const taskPoints = task.timeChunksRequired;

        return <Layout key={index} horizontal left>
            <button className="earnButton" onClick={() => { }}>{taskPoints} pts</button>
            <div>{taskName}</div>
        </Layout>
    });

    return <Layout>
        <h1>Earn</h1>
        {tasksMarkup}
        <button onClick={handleGoBack}>Go back</button>
    </Layout>
}