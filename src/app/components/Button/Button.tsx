'use client';
import React from 'react';
import style from './Button.module.css';

interface Props {
    label: string | React.ReactNode;
    onAction(): void;
}

export default function Button({ label, onAction }: Props) {
    return <div className={style.Button} onClick={onAction}>{label}</div>
}