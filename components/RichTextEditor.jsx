'use client';

export default function RichTextEditor({ value, onChange }) {
  // Simple rich text editor using contentEditable with a toolbar
  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val);
  };

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) execCommand('insertImage', url);
  };

  const toolbarBtns = [
    { label: 'B', cmd: 'bold', title: 'Bold' },
    { label: 'I', cmd: 'italic', title: 'Italic' },
    { label: 'U', cmd: 'underline', title: 'Underline' },
    { label: 'H2', cmd: 'formatBlock', val: 'h2', title: 'Heading 2' },
    { label: 'H3', cmd: 'formatBlock', val: 'h3', title: 'Heading 3' },
    { label: 'P', cmd: 'formatBlock', val: 'p', title: 'Paragraph' },
    { label: '• List', cmd: 'insertUnorderedList', title: 'Bullet List' },
    { label: '1. List', cmd: 'insertOrderedList', title: 'Numbered List' },
    { label: '"', cmd: 'formatBlock', val: 'blockquote', title: 'Quote' },
  ];

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-gray-900/50">
      <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-white/5">
        {toolbarBtns.map((btn) => (
          <button
            key={btn.cmd + (btn.val || '')}
            type="button"
            onClick={() => execCommand(btn.cmd, btn.val)}
            title={btn.title}
            className="px-2.5 py-1 text-xs font-medium text-gray-300 rounded hover:bg-white/10 hover:text-white transition-colors"
          >
            {btn.label}
          </button>
        ))}
        <button type="button" onClick={insertImage} title="Insert Image" className="px-2.5 py-1 text-xs font-medium text-gray-300 rounded hover:bg-white/10 hover:text-white transition-colors">
          🖼 Image
        </button>
        <button type="button" onClick={() => { const url = prompt('Enter URL:'); if (url) execCommand('createLink', url); }} title="Insert Link" className="px-2.5 py-1 text-xs font-medium text-gray-300 rounded hover:bg-white/10 hover:text-white transition-colors">
          🔗 Link
        </button>
      </div>
      <div
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[300px] p-4 text-gray-200 prose prose-invert prose-sm max-w-none focus:outline-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-200 [&_p]:text-gray-300 [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-indigo-400 [&_img]:rounded-lg [&_img]:max-w-full"
        suppressContentEditableWarning
      />
    </div>
  );
}
