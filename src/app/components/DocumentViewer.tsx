const DocumentViewer = ({ fileUrl }: { fileUrl: string }) => {
    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <div style={{ border: "1px solid #ddd", padding: "10px" }}>
                <embed src={fileUrl} width="100%" height="500px" type="application/pdf" />
            </div>
        </div>
    );
};

export default DocumentViewer;
