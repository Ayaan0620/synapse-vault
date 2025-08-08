// src/components/QuillEditor.tsx

import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import katex from 'katex';
import 'katex/dist/katex.min.css';

window.katex = katex;

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: EditorProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'formula'],
      ['clean']
    ],
  };

  return (
    <div className="bg-background text-foreground rounded-md h-full">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="h-[calc(100% - 42px)]"
      />
      {/* THIS STYLESHEET IS NOW FULLY THEME-AWARE */}
      <style jsx global>{`
        .ql-toolbar {
          background-color: hsl(var(--muted));
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: hsl(var(--border)) !important;
        }
        .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-color: hsl(var(--border)) !important;
          font-size: 1rem;
        }
        .ql-editor {
          color: hsl(var(--foreground));
        }
        .ql-snow .ql-stroke { stroke: hsl(var(--foreground)); }
        .ql-snow .ql-picker-label { color: hsl(var(--foreground)) !important; }
        .ql-snow .ql-active .ql-stroke { stroke: hsl(var(--primary)); }
        .ql-snow .ql-active .ql-picker-label { color: hsl(var(--primary)) !important; }
      `}</style>
    </div>
  );
}