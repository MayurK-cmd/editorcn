import type { Metadata } from "next";

import { TemplateDemo } from "@/components/template-demo";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Template preview",
};

const PreviewPage = async ({
  params,
}: {
  params: Promise<{ name: string }>;
}) => {
  const { name } = await params;

  return (
    <main className="bg-background flex min-h-svh items-start justify-center p-4 sm:p-10">
      <div className="w-full max-w-5xl">
        <TemplateDemo name={name} />
      </div>
    </main>
  );
};

export default PreviewPage;
