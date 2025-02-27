import React from 'react';
import classNames from 'classnames';


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

function isLayoutItem(node: string | React.ReactNode) {
    if (typeof node === 'string') {
        return false
    }
    return React.isValidElement(node) ? node.type === LayoutItem : false;
}
export default function Layout({ className, horizontal, center, left, twocolumn, children }: Props) {
    const LayoutItems = Array.isArray(children) ? children : [children]
    const classParent = horizontal ? "LayoutParentHorizontal" : "LayoutParentVertical";
    const centerLayout = center ? "LayoutParentCenter" : undefined;

    const classes = classNames(
        className,
        {
            ["LayoutParentHorizontal"]: horizontal,
            ["LayoutParentVertical"]: !horizontal,
            ["LayoutParentCenter"]: center && !horizontal,
            ["LayoutParentCenterHorizontal"]: center && horizontal,
            ["LayoutParentLeft"]: left,
            ["TwoColumn"]: twocolumn
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

    const classes = classNames({
        ["LayoutChildFill"]: fill,
        ["LayoutChild"]: !fill,
        ["LayoutChildLeft"]: left
    });

    return <div className={classes}>{children}</div>

}