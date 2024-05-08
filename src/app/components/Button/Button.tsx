'use client';
import React, { useEffect } from 'react';
import style from './Button.module.css';
import classNames from 'classnames';

interface Props {
    label: string | React.ReactNode;
    onAction(): void;
    type?: 'use' | 'earn' | 'delete';
}

export default function Button({ label, onAction, type }: Props) {
    const [classes, setClasses] = React.useState<string[]>();

    const buttonClass = classNames({
        [style.Button]: true,
        [style.Use]: type === 'use',
        [style.Earn]: type === 'earn',
        [style.Delete]: type === 'delete',
    });

    return <button className={buttonClass} onClick={onAction}>{label}</button>
}