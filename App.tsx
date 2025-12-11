import React from 'react';
import { IncomingStockForm } from './components/IncomingStockForm';
import { LayoutDashboard, Settings, LogOut, PackageSearch } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation (Mock) */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 md:h-screen sticky top-0">
        <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">IMS</div>
                Gudang v1
            </h1>
        </div>
        <nav className="p-4 space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-lg">
                <PackageSearch className="w-5 h-5" />
                Barang Masuk
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                <Settings className="w-5 h-5" />
                Pengaturan
            </a>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors">
                <LogOut className="w-5 h-5" />
                Logout
            </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Operasional Gudang</h2>
                <p className="text-gray-500">Kelola penerimaan barang dari vendor</p>
            </div>
            <div className="hidden md:block">
                 <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    Shift Pagi: Admin Gudang
                 </span>
            </div>
        </header>

        <div className="max-w-4xl mx-auto">
            <IncomingStockForm />
        </div>
        
        <footer className="mt-12 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} IMS System Corp. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default App;