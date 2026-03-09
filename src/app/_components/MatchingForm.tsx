"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MatchingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobNo: "2024-001",
    caseNo: "A",
    constructionType: "新築",
    listTypes: "標準",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams({
      jobNo: formData.jobNo,
      caseNo: formData.caseNo,
      constructionType: formData.constructionType,
      listTypes: formData.listTypes,
    });

    router.push(`/matching?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="jobNo" className="block text-sm font-medium text-gray-700">
          工番 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="jobNo"
          name="jobNo"
          required
          value={formData.jobNo}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="caseNo" className="block text-sm font-medium text-gray-700">
          ケース <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="caseNo"
          name="caseNo"
          required
          value={formData.caseNo}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="constructionType" className="block text-sm font-medium text-gray-700">
          施工区分 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="constructionType"
          name="constructionType"
          required
          value={formData.constructionType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="listTypes" className="block text-sm font-medium text-gray-700">
          リストタイプ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="listTypes"
          name="listTypes"
          required
          value={formData.listTypes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      >
        マスター作成開始
      </button>
    </form>
  );
}
