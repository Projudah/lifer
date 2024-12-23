import classNames from "classnames";
import Layout from "../Layout/Layout";
import Button from "../Button/Button";
import { useState } from "react";

interface Props {
    children: React.ReactNode[];
    className?: string;
}

export default function Carousel({
    children,
    className
}: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const classes = classNames(
        className, {
        "carousel": true,
    });

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? children.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === children.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <Layout className={classes}>
            {/* render number out of total */}
            <div>{currentIndex + 1} / {children.length}</div>
            <Layout horizontal center>
                <Button onAction={handlePrevious} label="<" />
                <div className="carousel-item">
                    {children[currentIndex]}
                </div>
                <Button onAction={handleNext} label=">" />
            </Layout>
        </Layout>
    );
}