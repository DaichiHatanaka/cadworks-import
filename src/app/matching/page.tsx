import { z } from "zod";
import { notFound } from "next/navigation";
import { MatchingWorkspace } from "./_components/MatchingWorkspace";

// URL パラメータのスキーマ
const searchParamsSchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
  caseNo: z.string().min(1, "ケースは必須です"),
  constructionType: z.string().min(1, "施工区分は必須です"),
  listTypes: z.string().min(1, "リストタイプは必須です"),
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MatchingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // パラメータのバリデーション
  const parsed = searchParamsSchema.safeParse({
    jobNo: params.jobNo,
    caseNo: params.caseNo,
    constructionType: params.constructionType,
    listTypes: params.listTypes,
  });

  if (!parsed.success) {
    // バリデーションエラー時は404を返す
    notFound();
  }

  const { jobNo, caseNo, constructionType, listTypes } = parsed.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <MatchingWorkspace
        jobNo={jobNo}
        caseNo={caseNo}
        constructionType={constructionType}
        listTypes={listTypes}
      />
    </div>
  );
}
