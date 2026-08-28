import React, { useState } from 'react';
import { 
  Search, 
  Receipt, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  ExternalLink,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { VoteRecord } from '../../types';
import { store } from '../../lib/store';
import { Breadcrumb } from '../Breadcrumb';
import { ReceiptModal } from './ReceiptModal';

interface MyVotesLookupProps {
  onBackToContests: () => void;
  onNavigateToContests?: () => void;
  initialQuery?: string;
}

export const MyVotesLookup: React.FC<MyVotesLookupProps> = ({
  onBackToContests,
  onNavigateToContests,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<VoteRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<VoteRecord | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const matched = store.lookupVotesByPhoneOrReceipt(query);
    setResults(matched);
    setSearched(true);
  };

  const totalVotesCast = results.reduce((sum, r) => sum + r.voteCount, 0);

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', onClick: onBackToContests },
              ...(onNavigateToContests ? [{ label: 'Live Contests', onClick: onNavigateToContests }] : []),
              { label: 'Check My Votes' },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Check My Votes and Receipts
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Enter your Ghanaian mobile number or a 9-digit receipt code to view your verified vote records.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter mobile number (e.g. 0244123456) or STZ-GH-XXXXXX"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
            >
              Search Records
            </button>
          </form>

          <p className="text-[11px] text-gray-500 mt-2.5">
            Your phone number is checked securely against our official voting records.
          </p>
        </div>

        {/* Search Results Area */}
        {searched && (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-6 space-y-3">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No vote records found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  We could not find any votes linked to "{query}". Please check the phone number or receipt code and try again.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">
                    Found {results.length} Record{results.length > 1 ? 's' : ''} ({totalVotesCast} total votes)
                  </h3>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                    Verified on Ledger
                  </span>
                </div>

                <div className="space-y-3">
                  {results.map((record) => (
                    <div
                      key={record.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {record.nomineeName}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            record.voteType === 'free'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {record.voteCount} {record.voteCount === 1 ? 'Vote' : 'Votes'} ({record.voteType.toUpperCase()})
                          </span>
                        </div>

                        <p className="text-xs text-gray-500">
                          {record.contestTitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-1 font-mono">
                          <span>Code: <strong className="text-amber-700">{record.receiptCode}</strong></span>
                          <span>•</span>
                          <span>Voter: {record.voterPhoneMasked}</span>
                          <span>•</span>
                          <span>{new Date(record.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedReceipt(record)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
                      >
                        View Official Receipt
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Selected Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          contest={store.contests.find((c) => c.id === selectedReceipt.contestId) || store.contests[0]}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
};
