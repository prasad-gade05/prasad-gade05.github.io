import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, Download, X, FileText } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './ResumeViewer.css';

// Configure worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const ResumeViewer = ({ pdfUrl, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // Adjust initial scale based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setScale(0.6);
      } else if (width < 1024) {
        setScale(0.8);
      } else {
        setScale(1.0);
      }
      setContainerWidth(width);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="resume-viewer-container">
      <div className="resume-controls">
        <div className="zoom-controls">
          <button 
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="control-btn"
            title="Zoom Out"
          >
            <ZoomOut size={20}/>
          </button>
          <span className="scale-display">{Math.round(scale * 100)}%</span>
          <button 
            onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
            className="control-btn"
            title="Zoom In"
          >
            <ZoomIn size={20}/>
          </button>
        </div>

        <div className="viewer-title">
          <FileText size={20} />
          <h3>Resume</h3>
        </div>
        
        <div className="action-controls">
          <a 
            href={pdfUrl} 
            download="Prasad_Gade_Resume.pdf" 
            className="control-btn download-btn"
            title="Download PDF"
          >
            <Download size={20} />
            <span className="btn-text">Download</span>
          </a>
          {onClose && (
            <button 
              onClick={onClose}
              className="control-btn close-btn"
              title="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="resume-content">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="loading-spinner">Loading Resume...</div>}
          error={<div className="error-msg">Failed to load resume PDF.</div>}
          className="pdf-document"
        >
          {numPages && Array.from(new Array(numPages), (el, index) => (
            <Page 
              key={`page_${index + 1}`} 
              pageNumber={index + 1} 
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default ResumeViewer;
