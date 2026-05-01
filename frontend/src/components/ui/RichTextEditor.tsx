'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Describe the role, responsibilities, and requirements...',
  minHeight = '200px',
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        border: 'none',
        background: active ? '#EFF6FF' : 'transparent',
        color: active ? '#033BB0' : '#374151',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: active ? '700' : '400',
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{ border: '1px solid #D1D5DB', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '8px',
        borderBottom: '1px solid #E5E7EB',
        background: '#F9FAFB',
        flexWrap: 'wrap',
      }}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <u>U</u>
        </ToolbarButton>

        <div style={{ width: '1px', background: '#E5E7EB', margin: '0 4px' }} />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Subheading">
          H3
        </ToolbarButton>

        <div style={{ width: '1px', background: '#E5E7EB', margin: '0 4px' }} />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          1. List
        </ToolbarButton>

        <div style={{ width: '1px', background: '#E5E7EB', margin: '0 4px' }} />

        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          —
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        style={{ minHeight, padding: '12px', fontSize: '15px', lineHeight: '1.7', color: '#111827' }}
      />

      <style>{`
        .tiptap { outline: none; min-height: ${minHeight}; }
        .tiptap h2 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; color: #111827; }
        .tiptap h3 { font-size: 17px; font-weight: 600; margin: 12px 0 6px; color: #374151; }
        .tiptap ul, .tiptap ol { padding-left: 20px; margin: 8px 0; }
        .tiptap li { margin-bottom: 4px; }
        .tiptap p { margin: 0 0 8px; }
        .tiptap p.is-editor-empty:first-child::before {
          color: #9CA3AF; content: attr(data-placeholder); float: left; height: 0; pointer-events: none;
        }
        .tiptap hr { border: none; border-top: 1px solid #E5E7EB; margin: 16px 0; }
      `}</style>
    </div>
  )
}
