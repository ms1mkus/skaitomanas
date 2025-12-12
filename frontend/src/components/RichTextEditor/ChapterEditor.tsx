import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Group, Badge, Box } from '@mantine/core';
import './ChapterEditor.css';

interface ChapterEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function ChapterEditor({ content, onChange, placeholder }: ChapterEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        href: {
                            default: null,
                            parseHTML: (element) => element.getAttribute('href'),
                            renderHTML: (attributes) => {
                                let href = attributes.href;
                                if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
                                    href = 'https://' + href;
                                }
                                return { href };
                            },
                        },
                    };
                },
            }).configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: placeholder || 'Pradėkite rašyti savo istoriją...' }),
        ],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const fixedHtml = html.replace(/href="(?!https?:\/\/|mailto:)([^"]+)"/g, 'href="https://$1"');
            onChange(fixedHtml);
        },
    });

    const getText = () => {
        if (!editor) return '';
        return editor.getText();
    };

    const wordCount = getText().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = getText().length;
    const pageCount = Math.ceil(wordCount / 250);

    return (
        <div className="chapter-editor-wrapper">
            <RichTextEditor editor={editor} className="chapter-editor">
                <RichTextEditor.Toolbar sticky stickyOffset={0} className="chapter-toolbar">
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Hr />
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignJustify />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Highlight />
                        <RichTextEditor.ClearFormatting />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Undo />
                        <RichTextEditor.Redo />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                <Box className="chapter-content-wrapper" p="xl">
                    <RichTextEditor.Content className="chapter-content" />
                </Box>
            </RichTextEditor>

            <Group justify="space-between" mt="sm" px="xs">
                <Group gap="xs">
                    <Badge variant="dot" color="gray" size="lg">
                        {charCount} simbolių
                    </Badge>
                    <Badge variant="dot" color="gray" size="lg">
                        {wordCount} žodžių
                    </Badge>
                </Group>
                <Badge variant="filled" color="blue" size="lg">
                    ~{pageCount} {pageCount === 1 ? 'puslapis' : pageCount < 10 ? 'puslapiai' : 'puslapių'}
                </Badge>
            </Group>
        </div>
    );
}
