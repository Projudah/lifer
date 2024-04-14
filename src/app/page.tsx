"use client"

import { useRouter } from "next/navigation";
import Button from "./components/Button/Button";
import Layout from "./components/Layout/Layout";
import { useContext, useEffect, useState } from "react";
import { PointsContext } from "./dataContext";

export default function Home() {
  const router = useRouter();
  const points = useContext(PointsContext);

  const pointsMarkup = <h1>{points ? points : 'loading'} pts</h1>
  const handleEarn = () => router.push("/earn");
  const handleUse = () => router.push("/use");
  return (
    <Layout>
      {pointsMarkup}
      <Button label="Use" onAction={handleUse} type="use" />
      <Button label="Earn" onAction={handleEarn} type="earn" />
    </Layout>
  );
}
