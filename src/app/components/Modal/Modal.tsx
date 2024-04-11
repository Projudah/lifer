import Button from "../Button/Button";

type Props = {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}
export default function Modal({ open, title, children, onClose }: Props) {
    if (!open) return null;

    return <div className="modalContainer">
        <div className="modalDiv">
            <div>
                <h2>{title}</h2>
            </div>
            {children}
            <Button label="Close" onAction={onClose} />
        </div>
    </div>
}