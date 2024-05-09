import React from 'react';
import classNames from 'classnames';


import styles from './Layout.module.css';

interface LayoutItemProps {
    children: React.ReactNode;
    fill?: boolean;
    left?: boolean;
}
interface Props {
    className?: string;
    horizontal?: boolean;
    center?: boolean;
    left?: boolean;
    twocolumn?: boolean;
    children: React.ReactNode | React.ReactNode[];
}

function isLayoutItem(node: any) {
    if (typeof node === 'string') {
        return false
    }
    return node ? node.type === LayoutItem : false;
}
export default function Layout({ className, horizontal, center, left, twocolumn, children }: Props) {
    const LayoutItems = Array.isArray(children) ? children : [children]
    const classParent = horizontal ? styles.LayoutParentHorizontal : styles.LayoutParentVertical;
    const centerLayout = center ? styles.LayoutParentCenter : undefined;

    const classes = classNames(
        className,
        {
            [styles.LayoutParentHorizontal]: horizontal,
            [styles.LayoutParentVertical]: !horizontal,
            [styles.LayoutParentCenter]: center,
            [styles.LayoutParentLeft]: left,
            [styles.TwoColumn]: twocolumn
        }
    );
    return <div className={classes}>
        {LayoutItems.map((node, index) => {
            if (isLayoutItem(node)) return node;
            return <LayoutItem key={index} left={left}>{node}</LayoutItem>
        }
        )}
    </div>
}

export function LayoutItem({ children, fill, left }: LayoutItemProps) {
    const classNames = `
    ${fill ? styles.LayoutChildFill : styles.LayoutChild}
    ${left ? styles.LayoutChildLeft : undefined} `;

    return <div className={classNames}>{children}</div>

}