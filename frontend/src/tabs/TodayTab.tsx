export function TodayTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Today</h2>
        <p className="text-gray-600">Your prioritized tasks for the day, ranked by urgency</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">TaskAgent Coming Soon</h3>
        <p className="text-gray-600 max-w-sm mx-auto mb-4">
          Your tasks will appear here once TaskAgent is connected to Google Calendar in phase 7.
        </p>
        <div className="inline-flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Phase 7</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">Requires OAuth</span>
        </div>
      </div>
    </div>
  );
}
