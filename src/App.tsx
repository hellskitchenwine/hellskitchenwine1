// import { useState } from 'react';
// import { MessageSquare, Users, History, Settings as SettingsIcon, Database, FileText } from 'lucide-react';
// import { ImportCustomers } from './components/ImportCustomers';
// import { CustomerList } from './components/CustomerList';
// import { SendMessage } from './components/SendMessage';
// import { MessageHistory } from './components/MessageHistory';
// import { Settings } from './components/Settings';
// import { AllCustomers } from './components/AllCustomers';
// import { TermsAndConditions } from './components/TermsAndConditions';

// type Tab = 'customers' | 'all-customers' | 'history' | 'settings' | 'terms';

// function App() {
//   const [activeTab, setActiveTab] = useState<Tab>('customers');
//   const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   const handleImportComplete = () => {
//     setRefreshTrigger((prev) => prev + 1);
//   };

//   const handleSendComplete = () => {
//     setSelectedCustomerIds([]);
//     setRefreshTrigger((prev) => prev + 1);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <header className="mb-8 bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <MessageSquare className="w-10 h-10 text-blue-600" />
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900">
//                     Hell's Kitchen Wine & Spirits
//                   </h1>
//                   <p className="text-sm text-gray-600">
//                     SMS Loyalty Program Dashboard - 21+ Only
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <a
//                 href="https://hellskitchenwine.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-sm text-blue-600 hover:underline"
//               >
//                 Visit Website →
//               </a>
//             </div>
//           </div>
//         </header>

//         <div className="mb-6 border-b border-gray-200">
//           <nav className="flex gap-1">
//             <button
//               onClick={() => setActiveTab('customers')}
//               className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
//                 activeTab === 'customers'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <Users className="w-5 h-5" />
//               Send Messages
//             </button>
//             <button
//               onClick={() => setActiveTab('all-customers')}
//               className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
//                 activeTab === 'all-customers'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <Database className="w-5 h-5" />
//               All Customers
//             </button>
//             <button
//               onClick={() => setActiveTab('history')}
//               className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
//                 activeTab === 'history'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <History className="w-5 h-5" />
//               Message History
//             </button>
//             <button
//               onClick={() => setActiveTab('settings')}
//               className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
//                 activeTab === 'settings'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <SettingsIcon className="w-5 h-5" />
//               Settings
//             </button>
//             <button
//               onClick={() => setActiveTab('terms')}
//               className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
//                 activeTab === 'terms'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <FileText className="w-5 h-5" />
//               Terms & Conditions
//             </button>
//           </nav>
//         </div>

//         {activeTab === 'customers' && (
//           <div className="space-y-6">
//             <ImportCustomers onImportComplete={handleImportComplete} />

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2">
//                 <CustomerList
//                   onSelectionChange={setSelectedCustomerIds}
//                   refreshTrigger={refreshTrigger}
//                 />
//               </div>
//               <div>
//                 <SendMessage
//                   selectedCustomerIds={selectedCustomerIds}
//                   onSendComplete={handleSendComplete}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'all-customers' && (
//           <AllCustomers refreshTrigger={refreshTrigger} />
//         )}

//         {activeTab === 'history' && (
//           <MessageHistory refreshTrigger={refreshTrigger} />
//         )}

//         {activeTab === 'settings' && <Settings />}

//         {activeTab === 'terms' && <TermsAndConditions />}
//       </div>
//     </div>
//   );
// }

// export default App;

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  MessageSquare,
  Users,
  History,
  Settings as SettingsIcon,
  Database,
  FileText,
  LogOut,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { Login } from './components/Login';
import { ImportCustomers } from './components/ImportCustomers';
import { CustomerList } from './components/CustomerList';
import { SendMessage } from './components/SendMessage';
import { MessageHistory } from './components/MessageHistory';
import { Settings } from './components/Settings';
import { AllCustomers } from './components/AllCustomers';
import { TermsAndConditions } from './components/TermsAndConditions';

type Tab = 'customers' | 'all-customers' | 'history' | 'settings' | 'terms';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('customers');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleImportComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSendComplete = () => {
    setSelectedCustomerIds([]);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-10 h-10 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Hell&apos;s Kitchen Wine & Spirits
                  </h1>
                  <p className="text-sm text-gray-600">
                    SMS Loyalty Program Dashboard - 21+ Only
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://hellskitchenwine.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Visit Website →
              </a>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'customers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              Send Messages
            </button>
            <button
              onClick={() => setActiveTab('all-customers')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'all-customers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="w-5 h-5" />
              All Customers
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-5 h-5" />
              Message History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'terms'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              Terms & Conditions
            </button>
          </nav>
        </div>

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <ImportCustomers onImportComplete={handleImportComplete} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CustomerList
                  onSelectionChange={setSelectedCustomerIds}
                  refreshTrigger={refreshTrigger}
                />
              </div>
              <div>
                <SendMessage
                  selectedCustomerIds={selectedCustomerIds}
                  onSendComplete={handleSendComplete}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all-customers' && (
          <AllCustomers refreshTrigger={refreshTrigger} />
        )}

        {activeTab === 'history' && (
          <MessageHistory refreshTrigger={refreshTrigger} />
        )}

        {activeTab === 'settings' && <Settings />}

        {activeTab === 'terms' && <TermsAndConditions />}
      </div>
    </div>
  );
}

export default App;