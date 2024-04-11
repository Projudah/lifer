"use client"

import { useRouter } from "next/navigation";
import Button from "./components/Button/Button";
import Layout from "./components/Layout/Layout";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [points, setPoints] = useState<string>();

  const getPoints = async () => {
    const res = await fetch("api/points", {
      method: "GET",
    });
    const data = await res.json();
    setPoints(data);
  };

  useEffect(() => {
    if (!points) {
      getPoints();
    }
  }, [points]);


  const pointsMarkup = <h1>{points ? points : 'loading'} pts</h1>
  const handleEarn = () => router.push("/earn");
  const handleUse = () => router.push("/use");
  return (
    <Layout>
      {pointsMarkup}
      <Button label="Use" onAction={handleUse} />
      <Button label="Earn" onAction={handleEarn} />
    </Layout>
  );
}
