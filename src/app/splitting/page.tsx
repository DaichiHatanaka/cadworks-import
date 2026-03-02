import { notFound } from "next/navigation";
import { SplittingWorkspace } from "./_components/SplittingWorkspace";

interface PageProps {
  searchParams: Promise<{ jobNo?: string }>;
}

export default async function SplittingPage({ searchParams }: PageProps) {
  const { jobNo } = await searchParams;

  if (!jobNo || !jobNo.trim()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <SplittingWorkspace jobNo={jobNo.trim()} />
      </div>
    </div>
  );
}
