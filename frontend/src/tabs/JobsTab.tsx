export function JobsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Jobs</h2>
        <p className="text-gray-600">Roles matched and tailored for your background</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15a23.931 23.931 0 00-9-1.977m18-4.668v6m0 0a23.05 23.05 0 01-18 8.835m18-8.835a23.049 23.049 0 00-18 8.835m0-6v6m0 0a23.931 23.931 0 0018 1.977" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">JobAgent Coming Soon</h3>
        <p className="text-gray-600 max-w-sm mx-auto mb-4">
          Job matches will appear here once JobAgent scrapes postings from Greenhouse and Lever in phase 11.
        </p>
        <div className="inline-flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Phase 11</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Human-gated</span>
        </div>
      </div>
    </div>
  );
}
