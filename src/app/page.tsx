"use client"

import { useRouter } from "next/navigation";
import Button from "./components/Button/Button";
import Layout from "./components/Layout/Layout";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const pointsMarkup = <h1>12 pts</h1>
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
