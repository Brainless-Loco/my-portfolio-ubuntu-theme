import { ChangeEvent, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { mergeAttributes, Node } from '@tiptap/core';
import { EditorContent, NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from 'lucide-react';
import { imageFileToDataUrl, imageUrlToDataUrl } from '../lib/imageDataUrl';
import { sanitizeRichText, toYouTubeEmbedUrl } from '../lib/richText';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function ResizableImageNode({ node, selected, updateAttributes }: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cleanupRef = useRef<() => void>(() => undefined);
  const width = Number(node.attrs.width);
  const align = node.attrs.align === 'left' || node.attrs.align === 'right' ? node.attrs.align : 'center';

  useEffect(() => () => cleanupRef.current(), []);

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    cleanupRef.current();

    const startX = event.clientX;
    const startWidth = imageRef.current?.getBoundingClientRect().width || width || 320;
    const onPointerMove = (moveEvent: PointerEvent) => {
      updateAttributes({ width: Math.max(80, Math.min(1600, Math.round(startWidth + moveEvent.clientX - startX))) });
    };
    const onPointerUp = () => cleanupRef.current();
    cleanupRef.current = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  return (
    <NodeViewWrapper className="rich-text-image-node" style={{ textAlign: align }} contentEditable={false}>
      <span className="rich-text-image-frame" style={{ width: width > 0 ? `${width}px` : undefined }}>
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ''}
          draggable={false}
          style={{ width: width > 0 ? `${width}px` : undefined }}
        />
        {selected && (
          <button
            type="button"
            className="rich-text-image-resize"
            aria-label="Resize image"
            title="Drag to resize"
            onPointerDown={startResize}
          />
        )}
      </span>
    </NodeViewWrapper>
  );
}

function YouTubeNode({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper className="rich-text-video-node" contentEditable={false}>
      <iframe
        src={node.attrs.src}
        title="YouTube video"
        className="rich-text-youtube"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </NodeViewWrapper>
  );
}

const AlignedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') ?? 'center',
        renderHTML: (attributes) => {
          const align = attributes.align === 'left' || attributes.align === 'right' ? attributes.align : 'center';
          const margin = align === 'center'
            ? 'margin-left:auto;margin-right:auto'
            : align === 'left' ? 'margin-right:auto' : 'margin-left:auto';
          return { 'data-align': align, style: `display:block;${margin}` };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode);
  },
});

const YouTubeEmbed = Node.create({
  name: 'youtubeEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => toYouTubeEmbedUrl(element.getAttribute('src') ?? ''),
        renderHTML: (attributes) => ({ src: toYouTubeEmbedUrl(attributes.src ?? '') }),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'iframe[src]',
      getAttrs: (element) => {
        const src = toYouTubeEmbedUrl((element as HTMLElement).getAttribute('src') ?? '');
        return src ? { src } : false;
      },
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes, {
      class: 'rich-text-youtube',
      title: 'YouTube video',
      loading: 'lazy',
      referrerpolicy: 'strict-origin-when-cross-origin',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: '',
    })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YouTubeNode);
  },
});

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs transition-colors hover:bg-white/10 disabled:opacity-40 ${active ? 'bg-orange-500/25 text-orange-200' : 'text-white/85'}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isEmbeddingImage, setIsEmbeddingImage] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      AlignedImage.configure({ allowBase64: true, inline: false, resize: false }),
      YouTubeEmbed,
      Placeholder.configure({ placeholder: 'Write something…' }),
    ],
    content: sanitizeRichText(value),
    onUpdate: ({ editor: currentEditor }) => onChange(sanitizeRichText(currentEditor.getHTML())),
    editorProps: {
      attributes: {
        'aria-label': 'Rich text',
        class: 'rich-text-prose',
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const cleanValue = sanitizeRichText(value);
    if (sanitizeRichText(editor.getHTML()) !== cleanValue) {
      editor.commands.setContent(cleanValue, { emitUpdate: false });
    }
    if (!sourceMode) setHtmlSource(cleanValue);
  }, [editor, sourceMode, value]);

  const insertLink = () => {
    if (!editor) return;
    setError('');
    const value = window.prompt('Enter a link URL (https://, http://, or mailto:):');
    if (!value) return;

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      setError('Enter a complete link URL.');
      return;
    }
    if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) {
      setError('Only http, https, and mailto links are allowed.');
      return;
    }

    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent({
        type: 'text',
        text: url.href,
        marks: [{ type: 'link', attrs: { href: url.href } }],
      }).run();
    } else {
      editor.chain().focus().setLink({ href: url.href }).run();
    }
  };

  const insertImageData = (src: string, alt: string) => {
    editor?.chain().focus().setImage({ src, alt }).run();
  };

  const insertImageUrl = async () => {
    if (!editor) return;
    setError('');
    const value = window.prompt('Enter an image URL (https:// or http://):');
    if (!value) return;
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      setError('Enter a complete image URL.');
      return;
    }
    if (!['https:', 'http:'].includes(url.protocol)) {
      setError('Only http and https image URLs are allowed.');
      return;
    }

    setIsEmbeddingImage(true);
    try {
      insertImageData(await imageUrlToDataUrl(url.href), 'Embedded image');
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'Unable to embed this image.');
    } finally {
      setIsEmbeddingImage(false);
    }
  };

  const insertImageFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file || !editor) return;

    setError('');
    setIsEmbeddingImage(true);
    try {
      insertImageData(await imageFileToDataUrl(file), file.name);
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'Unable to embed this image.');
    } finally {
      setIsEmbeddingImage(false);
    }
  };

  const changeAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return;
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { align: align === 'justify' ? 'center' : align }).run();
    } else {
      editor.chain().focus().setTextAlign(align).run();
    }
  };

  const insertYouTube = () => {
    if (!editor) return;
    setError('');
    const value = window.prompt('Enter a YouTube video URL or embed URL:');
    if (!value) return;
    const src = toYouTubeEmbedUrl(value);
    if (!src) {
      setError('Enter a valid YouTube video URL.');
      return;
    }
    editor.chain().focus().insertContent({ type: 'youtubeEmbed', attrs: { src } }).run();
  };

  const applyHtmlSource = () => {
    if (!editor) return;
    const clean = sanitizeRichText(htmlSource);
    editor.commands.setContent(clean, { emitUpdate: false });
    onChange(clean);
    setHtmlSource(clean);
    setSourceMode(false);
    setError(clean === htmlSource.trim() ? '' : 'Unsupported or unsafe HTML was removed.');
  };

  const currentAlignment = editor?.isActive('image')
    ? editor.getAttributes('image').align ?? 'center'
    : editor?.getAttributes('paragraph').textAlign ?? editor?.getAttributes('heading').textAlign ?? 'left';

  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-[#171317] text-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-2">
        {!sourceMode && <>
          <ToolbarButton label="Undo" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}><Undo2 size={15} /></ToolbarButton>
          <ToolbarButton label="Redo" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}><Redo2 size={15} /></ToolbarButton>
          <span className="mx-1 h-5 border-l border-white/15" />
          <select
            aria-label="Text style"
            value={editor?.isActive('heading', { level: 1 }) ? '1' : editor?.isActive('heading', { level: 2 }) ? '2' : editor?.isActive('heading', { level: 3 }) ? '3' : 'paragraph'}
            onChange={(event) => {
              const level = Number(event.target.value);
              if (!level) editor?.chain().focus().setParagraph().run();
              else editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
            }}
            className="h-8 rounded border border-white/10 bg-[#28212b] px-2 text-xs"
          >
            <option value="paragraph">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
          <select
            aria-label="Font size"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) editor?.chain().focus().setFontSize(event.target.value).run();
              else editor?.chain().focus().unsetFontSize().run();
            }}
            className="h-8 rounded border border-white/10 bg-[#28212b] px-2 text-xs"
          >
            <option value="">Font size</option>
            {['12px', '14px', '16px', '18px', '24px', '32px', '48px'].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <ToolbarButton label="Bold" active={Boolean(editor?.isActive('bold'))} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={15} /></ToolbarButton>
          <ToolbarButton label="Italic" active={Boolean(editor?.isActive('italic'))} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolbarButton>
          <ToolbarButton label="Underline" active={Boolean(editor?.isActive('underline'))} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} /></ToolbarButton>
          <ToolbarButton label="Strikethrough" active={Boolean(editor?.isActive('strike'))} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></ToolbarButton>
          <label title="Text color" className="flex h-8 cursor-pointer items-center gap-1 rounded px-2 text-xs hover:bg-white/10">
            <span>A</span>
            <input type="color" aria-label="Text color" onChange={(event) => editor?.chain().focus().setColor(event.target.value).run()} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" />
          </label>
          <label className="flex h-8 items-center gap-1 rounded px-1 text-xs text-white/75">
            <span>Align</span>
            <select aria-label="Image or text alignment" value={currentAlignment} onChange={(event) => changeAlignment(event.target.value as 'left' | 'center' | 'right' | 'justify')} className="h-8 rounded border border-white/10 bg-[#28212b] px-2 text-xs text-white">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              {!editor?.isActive('image') && <option value="justify">Justify</option>}
            </select>
          </label>
          <ToolbarButton label="Align left" onClick={() => changeAlignment('left')}><AlignLeft size={15} /></ToolbarButton>
          <ToolbarButton label="Align center" onClick={() => changeAlignment('center')}><AlignCenter size={15} /></ToolbarButton>
          <ToolbarButton label="Align right" onClick={() => changeAlignment('right')}><AlignRight size={15} /></ToolbarButton>
          <ToolbarButton label="Justify text" onClick={() => changeAlignment('justify')}><AlignJustify size={15} /></ToolbarButton>
          <ToolbarButton label="Bulleted list" active={Boolean(editor?.isActive('bulletList'))} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={15} /></ToolbarButton>
          <ToolbarButton label="Numbered list" active={Boolean(editor?.isActive('orderedList'))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></ToolbarButton>
          <ToolbarButton label="Block quote" active={Boolean(editor?.isActive('blockquote'))} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={15} /></ToolbarButton>
          <span className="mx-1 h-5 border-l border-white/15" />
          <ToolbarButton label="Insert link" onClick={insertLink}><Link2 size={15} /></ToolbarButton>
          <ToolbarButton label="Remove link" disabled={!editor?.isActive('link')} onClick={() => editor?.chain().focus().unsetLink().run()}><Unlink size={15} /></ToolbarButton>
          <ToolbarButton label="Embed image file" disabled={isEmbeddingImage} onClick={() => imageInputRef.current?.click()}><ImagePlus size={15} />{isEmbeddingImage ? 'Embedding…' : 'Image'}</ToolbarButton>
          <ToolbarButton label="Embed image from URL" disabled={isEmbeddingImage} onClick={insertImageUrl}><ImagePlus size={15} />URL</ToolbarButton>
          <ToolbarButton label="Insert YouTube video" onClick={insertYouTube}>YouTube</ToolbarButton>
          <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={insertImageFile} />
        </>}
        <ToolbarButton label={sourceMode ? 'Visual editor' : 'Edit HTML source'} active={sourceMode} onClick={() => {
          if (sourceMode) applyHtmlSource();
          else {
            setHtmlSource(editor?.getHTML() ?? sanitizeRichText(value));
            setSourceMode(true);
            setError('');
          }
        }}>
          {sourceMode ? 'Visual' : '</>'}
        </ToolbarButton>
      </div>
      {error && <p role="alert" className="border-b border-red-400/20 px-3 py-2 text-xs text-red-300">{error}</p>}
      {sourceMode ? (
        <div>
          <textarea
            aria-label="Rich text HTML source"
            spellCheck={false}
            value={htmlSource}
            onChange={(event) => setHtmlSource(event.target.value)}
            className="rich-text-html-source min-h-60 w-full resize-y bg-black/20 p-4 font-mono text-xs leading-relaxed text-white outline-none"
          />
          <div className="flex justify-end border-t border-white/10 p-2">
            <button type="button" onClick={applyHtmlSource} className="rounded bg-orange-600 px-3 py-1.5 text-xs font-medium hover:bg-orange-500">Apply HTML</button>
          </div>
        </div>
      ) : (
        <div className="rich-text-surface">
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
