export default function IneligiblePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-xl bg-white p-10 text-center shadow-xl">
        <h1 className="text-3xl font-semibold text-gray-900">Thank you for your interest</h1>
        <p className="mt-6 text-base leading-relaxed text-gray-700">
          Unfortunately, you are not eligible to participate in this research study at this time.
          Participation is limited to individuals who are at least 16 years of age. We appreciate
          your interest and understanding.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          If you have any questions about the study, please reach out to the research team using the
          contact information provided in your invitation materials.
        </p>
      </div>
    </main>
  );
}
