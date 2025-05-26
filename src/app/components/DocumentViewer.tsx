"use client";

import { useState, useEffect } from "react";

interface DocumentViewerProps {
    fileUrl: string;
    isOpen: boolean;
}

const DocumentViewer = ({ fileUrl, isOpen }: DocumentViewerProps) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen && !shouldRender) {
            setShouldRender(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!shouldRender) {
        return null;
    }

    return (
        <div className="border border-gray-200 p-2 mt-2">
            <embed src={fileUrl} width="100%" height="600px" type="application/pdf" />
        </div>
    );
};

export default DocumentViewer;
