import Button from "../Button/Button";
import Layout from "../Layout/Layout";

export type Action = {
    label: string;
    onAction: () => void;
}

type Props = {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void | Promise<void>;
    secondaryAction?: Action;
}
export default function Modal({ open, title, children, onClose, secondaryAction }: Props) {
    if (!open) return null;

    return <div className="modalContainer">
        <div className="modalDiv">
            <div>
                <h2>{title}</h2>
            </div>
            {children}
            <Layout horizontal>
                <Button label="Close" onAction={onClose} />
                {secondaryAction && <Button label={secondaryAction.label} onAction={secondaryAction.onAction} />}
            </Layout>
        </div>
    </div>
}