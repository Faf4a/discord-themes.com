import DOMPurify from "dompurify";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Bold, Code, Eye, Italic, Link, Strikethrough } from "lucide-react";
import { cn } from "@lib/utils";

interface MarkdownInputProps {
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    className?: string;
    lines?: number;
    disableToolbar?: boolean;
    defaultContent?: string;
}

export default function MarkdownInput({ className, onChange, onBlur, lines = 5, disableToolbar, defaultContent = "" }: MarkdownInputProps) {
    const [content, setContent] = useState(defaultContent);
    const [isPreview, setIsPreview] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const insertMarkdown = (type: string) => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;

        let insertion = "";
        switch (type) {
            case "bold":
                insertion = `**${text.slice(start, end) || "text"}**`;
                break;
            case "italic":
                insertion = `*${text.slice(start, end) || "text"}*`;
                break;
            case "strikethrough":
                insertion = `~~${text.slice(start, end) || "text"}~~`;
                break;
            case "code":
                insertion = `\`${text.slice(start, end) || "code"}\``;
                break;
            case "link":
                insertion = `[${text.slice(start, end) || "link"}](url)`;
                break;
        }

        const newText = text.slice(0, start) + insertion + text.slice(end);
        setContent(newText);
        onChange && onChange(newText);
    };

    useEffect(() => {
        if (textareaRef.current && overlayRef.current) {
            overlayRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, [content]);

    const highlightSyntax = (text: string) => {
        return text
            .replace(/(\*\*|__)(.*?)\1/g, '<span class="text-zinc-500">$1</span>$2<span class="text-zinc-500">$1</span>')
            .replace(/(\*|_)(.*?)\1/g, '<span class="text-zinc-500">$1</span>$2<span class="text-zinc-500">$1</span>')
            .replace(/~~(.*?)~~/g, '<span class="text-zinc-500">~~</span>$1<span class="text-zinc-500">~~</span>')
            .replace(/`([^`]+)`/g, '<span class="text-zinc-500">`</span>$1<span class="text-zinc-500">`</span>')
            .replace(/^(#+\s.*)/gm, '<span class="text-zinc-500">$1</span>')
            .replace(/^---$/gm, '<span class="text-zinc-500">---</span>')
            .replace(/^(>\s.*)/gm, '<span class="text-zinc-500">&gt; </span>$1')
            .replace(/(https?:\/\/[^\s)]+(?=\s|$|\)))/g, '<span class="text-blue-400">$1</span>')
            .replace(/\r?\n/g, "<br />");
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        onChange && onChange(e.target.value);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        onBlur && onBlur(content);
        if (!content) {
            setIsFocused(false);
        }
    };

    const showToolbar = (isFocused || content.length > 0) && !disableToolbar;

    return (
        <div className={cn("description w-full space-y-4 p-4", className)}>
            <div>
                <div className={cn("flex items-center gap-0.5 bg-zinc-900 p-2 rounded-t-md transition-all duration-200 transform", showToolbar ? "translate-y-0 opacity-100 mb-2" : "-translate-y-2 opacity-0 pointer-events-none")}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => insertMarkdown("bold")} disabled={isPreview}>
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => insertMarkdown("italic")} disabled={isPreview}>
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => insertMarkdown("strikethrough")} disabled={isPreview}>
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => insertMarkdown("code")} disabled={isPreview}>
                        <Code className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => insertMarkdown("link")} disabled={isPreview}>
                        <Link className="h-4 w-4" />
                    </Button>
                    <div className="flex-1" />
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-zinc-400 hover:text-zinc-100", isPreview && "text-zinc-100 bg-zinc-800")} onClick={() => setIsPreview(!isPreview)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
                <div className="relative">
                    <div className={cn("h-[200px] bg-zinc-900 transition-all duration-200", showToolbar ? "rounded-md" : "rounded-md")}>
                        {isPreview ? (
                            <div className="p-4 prose prose-invert max-w-none h-full overflow-auto">
                                <ReactMarkdown className="whitespace-pre-wrap" remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                            </div>
                        ) : (
                            <>
                                <Textarea
                                    ref={textareaRef}
                                    value={DOMPurify.sanitize(content)}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    onScroll={() => {
                                        if (overlayRef.current && textareaRef.current) {
                                            overlayRef.current.scrollTop = textareaRef.current.scrollTop;
                                        }
                                    }}
                                    rows={lines}
                                    placeholder="Supports markdown formatting..."
                                    className="h-full w-full bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none text-transparent caret-white p-4 absolute top-0 left-0 z-10"
                                    style={{
                                        fontFamily: "inherit",
                                        fontSize: "inherit",
                                        lineHeight: "inherit",
                                        color: "transparent",
                                        caretColor: "white"
                                    }}
                                />
                                <div
                                    ref={overlayRef}
                                    className="absolute inset-0 pointer-events-none p-4 whitespace-pre-wrap break-words text-zinc-300 overflow-hidden"
                                    style={{
                                        fontFamily: "inherit",
                                        fontSize: "inherit",
                                        lineHeight: "inherit"
                                    }}
                                    dangerouslySetInnerHTML={{ __html: highlightSyntax(DOMPurify.sanitize(content)) }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}