import { ResumeVersionForm } from '../ResumeVersionForm';
import { ResumeVersionList } from '../ResumeVersionList';
import { SearchBar } from '../SearchBar';
import { useResumeVersions } from '../useResumeVersions';
import { Card } from '../components/Card';

export function ResumeTab() {
  const { versions, reload, search, remove } = useResumeVersions();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Versions</h2>
        <p className="text-gray-600">Manage and compare your resume versions</p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Save a new version</h3>
        <ResumeVersionForm onSaved={reload} />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search versions</h3>
        <SearchBar placeholder="Search by label..." onSearch={search} />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Versions</h3>
        {versions.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resume versions yet</h3>
              <p className="text-gray-600">Save your first version above to start tracking your resume iterations.</p>
            </div>
          </Card>
        ) : (
          <ResumeVersionList versions={versions} onDelete={remove} />
        )}
      </section>
    </div>
  );
}
