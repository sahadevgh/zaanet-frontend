"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import Head from "next/head";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const GITHUB_MARKDOWN_URL =
  "https://raw.githubusercontent.com/ZaaNet/zaanet-litepaper/main/Litepaper.md";

export default function Litepaper() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["litepaper-md"],
    queryFn: async () => {
      const res = await fetch(GITHUB_MARKDOWN_URL);
      if (!res.ok) throw new Error("Failed to fetch litepaper.");
      return res.text();
    },
    staleTime: 1000 * 60 * 10,
  });

  const filteredContent = searchTerm
    ? data
        ?.split("\n")
        .map((line) =>
          line.toLowerCase().includes(searchTerm.toLowerCase())
            ? line.replace(
                new RegExp(`(${searchTerm})`, "gi"),
                `<mark class="bg-zaanet-purple/20 text-zaanet-purple">$1</mark>`
              )
            : null
        )
        .filter(Boolean)
        .join("\n") || ""
    : data;

  return (
    <>
      <Head>
        <title>ZaaNet Litepaper</title>
        <meta
          name="description"
          content="Explore ZaaNet’s mission to decentralize internet access through peer-to-peer WiFi sharing."
        />
      </Head>
      <div className="mx-auto max-w-6xl py-12 px-4 sm:px-6">
        <Card>
          <CardContent className="p-6 bg-gradient-to-br from-white to-zaanet-purple-light">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 font-heading text-center text-gradient bg-gradient-to-r from-zaanet-purple to-zaanet-purple-dark bg-clip-text text-transparent">
              📄 ZaaNet Litepaper
            </h1>
            <div className="mb-8 flex items-center gap-2 max-w-md mx-auto">
              <Search className="text-zaanet-purple" size={20} />
              <Input
                type="text"
                placeholder="Search litepaper content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zaanet-purple"
                aria-label="Search litepaper content"
              />
            </div>
            {isLoading && (
              <div role="status" aria-label="Loading litepaper">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}
            {isError && (
              <div
                className="flex flex-col items-center text-destructive gap-4 py-8"
                role="alert"
              >
                <AlertCircle size={32} />
                <p>Could not load the litepaper. Please try again.</p>
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
              </div>
            )}
            {!isLoading && !isError && data && (
              <article className="prose max-w-none prose-zinc dark:prose-invert prose-headings:font-heading prose-h1:mt-8 prose-h2:mt-6 prose-h3:mt-4 prose-h1:text-3xl prose-h2:text-2xl prose-a:text-zaanet-purple font-sans text-gray-900">
             <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw, rehypeSanitize]}
  components={{
    h1: ({ ...props }) => (
      <h1 {...props} className="mt-10 mb-4 text-3xl font-bold text-zinc-900" />
    ),
    h2: ({ ...props }) => (
      <h2 {...props} className="mt-8 mb-3 text-2xl font-semibold text-zinc-800" />
    ),
    h3: ({ ...props }) => (
      <h3 {...props} className="mt-6 mb-2 text-xl font-semibold text-zinc-700" />
    ),
    p: ({ ...props }) => (
      <p {...props} className="mb-4 leading-relaxed text-gray-900" />
    ),
    li: ({ ...props }) => (
      <li {...props} className="mb-2 ml-4 list-disc" />
    ),
    a: ({ ...props }) => (
      <a {...props} className="text-zaanet-purple underline hover:text-zaanet-purple-dark" />
    ),
    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
      return !inline ? (
        <pre className="bg-gray-100 text-sm text-gray-800 p-4 rounded-md overflow-x-auto mb-4">
          <code {...props} className={className}>{children}</code>
        </pre>
      ) : (
        <code className="bg-gray-200 text-sm px-1 rounded">{children}</code>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border border-gray-200">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border px-4 py-2 bg-gray-100 text-left">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border px-4 py-2">{children}</td>
    ),
  }}
>
  {filteredContent || "No matching content found."}
</ReactMarkdown>

                {filteredContent?.trim() === "" && (
                  <p className="text-center text-muted-foreground">
                    No sections matched your search term.
                  </p>
                )}
              </article>
            )}
            <div className="mt-8 text-center">
              <Link href="/networks">
                <Button
                  variant="outline"
                  className="border-zaanet-purple text-zaanet-purple hover:bg-zaanet-purple hover:text-white"
                  aria-label="Browse available WiFi networks"
                >
                  Browse WiFi Networks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
