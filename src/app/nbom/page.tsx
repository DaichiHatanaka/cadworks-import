import { redirect } from "next/navigation";
import NbomWorkspace from "./_components/NbomWorkspace";

export default async function NbomPage({
  searchParams,
}: {
  searchParams: Promise<{ jobNo?: string }>;
}) {
  const { jobNo } = await searchParams;

  if (!jobNo) {
    redirect("/");
  }

  return <NbomWorkspace jobNo={jobNo} />;
}
