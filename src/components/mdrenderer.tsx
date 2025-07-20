'use client';

import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const MdRenderer = ({ content }: { content: string }) => {
    return (
        <article className="prose prose-invert rounded-lg w-[80%] max-w-none border dark:border-gray-700 p-7 m-auto border-gray-300">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[
                    rehypeHighlight,
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "wrap" }]
                ]}
                components={{
                    // Optional: customize rendering for checkboxes, tables, etc.
                    // Example: GitHub-style checkboxes
                    input: ({ node, ...props }) =>
                        props.type === "checkbox" ? (
                            <input {...props} disabled className="mr-2 accent-blue-500" />
                        ) : (
                            <input {...props} />
                        ),
                    // Optional: style tables
                    table: ({ node, ...props }) => (
                        <table className="border-collapse border border-border" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="border border-border bg-muted px-2 py-1" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="border border-border px-2 py-1" {...props} />
                    ),
                    h1: ({ node, ...props }) => (
                        <h1 className='text-5xl py-3 hover:underline' {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className='text-3xl py-3 hover:underline' {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className='text-2xl py-3 hover:underline' {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                        <hr className='py-2 mt-4' />
                    ),
                    code({
                        // node,
                        inline,
                        className,
                        children,
                        ...props
                    }: React.HTMLAttributes<HTMLElement> & { inline?: boolean; children?: React.ReactNode }) {
                        return inline ? (
                            <code className="bg-muted text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                        ) : (
                            <pre className="bg-muted rounded p-3 overflow-x-auto my-2">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        );
                    },
                }}
            >
                {content || "__No content provided__"}
            </ReactMarkdown>
        </article>

    )
}

export default MdRenderer;