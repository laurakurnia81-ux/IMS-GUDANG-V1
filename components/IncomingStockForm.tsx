import React, { useState, useEffect, useCallback } from 'react';
import { Package, Calendar, FileText, Barcode, Hash, Save, XCircle, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { fetchItemByCode, fetchPOByCode, saveTransaction } from '../services/mockDatabase';
import { Item, PurchaseOrder, ValidationStatus } from '../types';

export const IncomingStockForm: React.FC = () => {
  // Form State
  const [transactionCode, setTransactionCode] = useState('');
  const [poCode, setPoCode] = useState('');
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split('T')[0]);
  const [itemCode, setItemCode] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');

  // Validation & Lookup State
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [foundPO, setFoundPO] = useState<PurchaseOrder | null>(null);
  const [itemStatus, setItemStatus] = useState<ValidationStatus>(ValidationStatus.IDLE);
  const [poStatus, setPoStatus] = useState<ValidationStatus>(ValidationStatus.IDLE);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Generate a random transaction ID on mount
  useEffect(() => {
    const randomId = `TM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
    setTransactionCode(randomId);
  }, []);

  // Real-time Item Lookup
  useEffect(() => {
    const lookupItem = async () => {
      if (!itemCode) {
        setFoundItem(null);
        setItemStatus(ValidationStatus.IDLE);
        return;
      }

      setItemStatus(ValidationStatus.LOADING);
      try {
        const item = await fetchItemByCode(itemCode);
        if (item) {
          setFoundItem(item);
          setItemStatus(ValidationStatus.VALID);
        } else {
          setFoundItem(null);
          setItemStatus(ValidationStatus.INVALID);
        }
      } catch (error) {
        setItemStatus(ValidationStatus.INVALID);
      }
    };

    const debounce = setTimeout(lookupItem, 500);
    return () => clearTimeout(debounce);
  }, [itemCode]);

  // Real-time PO Lookup
  useEffect(() => {
    const lookupPO = async () => {
      if (!poCode) {
        setFoundPO(null);
        setPoStatus(ValidationStatus.IDLE);
        return;
      }

      setPoStatus(ValidationStatus.LOADING);
      try {
        const po = await fetchPOByCode(poCode);
        if (po) {
          setFoundPO(po);
          setPoStatus(ValidationStatus.VALID);
        } else {
          setFoundPO(null);
          setPoStatus(ValidationStatus.INVALID);
        }
      } catch (error) {
        setPoStatus(ValidationStatus.INVALID);
      }
    };

    const debounce = setTimeout(lookupPO, 500);
    return () => clearTimeout(debounce);
  }, [poCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    // Final Validation
    if (!foundItem) {
      setSubmitMessage({ type: 'error', text: 'Kode Barang tidak valid atau tidak ditemukan.' });
      return;
    }
    if (!foundPO) {
      setSubmitMessage({ type: 'error', text: 'Kode PO tidak valid atau tidak ditemukan.' });
      return;
    }
    if (foundPO.status === 'CLOSED') {
      setSubmitMessage({ type: 'error', text: 'PO sudah ditutup (Closed). Tidak dapat menerima barang.' });
      return;
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
      setSubmitMessage({ type: 'error', text: 'Jumlah stok harus lebih dari 0.' });
      return;
    }

    setIsSubmitting(true);

    try {
        await saveTransaction({
            transactionCode,
            poCode,
            dateReceived,
            itemCode,
            quantity
        });
        
        setSubmitMessage({ type: 'success', text: 'Transaksi berhasil disimpan! Stok telah diperbarui.' });
        
        // Reset form partially
        const randomId = `TM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
        setTransactionCode(randomId);
        setItemCode('');
        setQuantity('');
        setPoCode(''); // Optional: clear PO or keep it for rapid entry
    } catch (err) {
        setSubmitMessage({ type: 'error', text: 'Gagal menyimpan transaksi.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan input data?')) {
        setItemCode('');
        setPoCode('');
        setQuantity('');
        setSubmitMessage(null);
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Transaksi Barang Masuk
        </h2>
        <p className="text-blue-100 text-sm mt-1 opacity-90">Formulir penerimaan stok gudang (IMS)</p>
      </div>

      <div className="p-8">
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {submitMessage.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <div>
              <p className="font-medium">{submitMessage.type === 'success' ? 'Sukses' : 'Error'}</p>
              <p className="text-sm">{submitMessage.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Transaction Code & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="kode_transaksi" className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Hash className="w-4 h-4 text-gray-400" />
                Kode Transaksi (PK)
              </label>
              <input
                type="text"
                id="kode_transaksi"
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-gray-600 cursor-not-allowed"
                readOnly
                placeholder="TM-YYYYMMDD-XXX"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tgl_terima" className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                Tanggal Terima
              </label>
              <input
                type="date"
                id="tgl_terima"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 2: PO Code (Validity Check) */}
          <div className="space-y-2 relative">
            <label htmlFor="kode_po" className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
              <FileText className="w-4 h-4 text-gray-400" />
              Kode Purchase Order (FK)
            </label>
            <div className="relative">
                <input
                    type="text"
                    id="kode_po"
                    value={poCode}
                    onChange={(e) => setPoCode(e.target.value)}
                    required
                    placeholder="Cth: PO-20250601-045"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all pr-10 ${
                        poStatus === ValidationStatus.INVALID ? 'border-red-300 focus:ring-red-200 bg-red-50' :
                        poStatus === ValidationStatus.VALID ? 'border-green-300 focus:ring-green-200 bg-green-50' :
                        'border-gray-300 focus:ring-blue-500'
                    }`}
                />
                <div className="absolute right-3 top-2.5">
                    {poStatus === ValidationStatus.LOADING && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
                    {poStatus === ValidationStatus.VALID && <CheckCircle className="text-green-600 w-5 h-5" />}
                    {poStatus === ValidationStatus.INVALID && <XCircle className="text-red-500 w-5 h-5" />}
                </div>
            </div>
            {/* Validity Feedback */}
            {poStatus === ValidationStatus.VALID && foundPO && (
                <p className="text-xs text-green-600">Valid: Vendor {foundPO.vendor} ({foundPO.status})</p>
            )}
            {poStatus === ValidationStatus.INVALID && poCode && (
                 <p className="text-xs text-red-500">PO tidak ditemukan dalam database.</p>
            )}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Row 3: Item Code (Lookup) */}
          <div className="space-y-2">
            <label htmlFor="kode_barang" className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
              <Barcode className="w-4 h-4 text-gray-400" />
              Kode Barang / SKU
            </label>
            <div className="relative">
                <input
                    type="text"
                    id="kode_barang"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    required
                    placeholder="Masukkan Kode (Cth: BRG-001)"
                    className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                        itemStatus === ValidationStatus.INVALID ? 'border-red-300 focus:ring-red-200' :
                        itemStatus === ValidationStatus.VALID ? 'border-green-300 focus:ring-green-200' :
                        'border-gray-300 focus:ring-blue-500'
                    }`}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-xs text-gray-500">Coba: BRG-001, BRG-002</p>
          </div>

          {/* Real-time Info Section */}
          <div className={`transition-all duration-300 rounded-lg border p-5 ${
              foundItem ? 'bg-blue-50 border-blue-200 opacity-100' : 'bg-gray-50 border-dashed border-gray-300 opacity-70'
          }`}>
             <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                Informasi Barang (Real-time Lookup)
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <span className="text-xs text-gray-500 block">Nama Barang</span>
                    <span className={`font-medium ${foundItem ? 'text-blue-900 text-lg' : 'text-gray-400 italic'}`}>
                        {foundItem ? foundItem.name : '[Menunggu Input Valid...]'}
                    </span>
                 </div>
                 <div>
                    <span className="text-xs text-gray-500 block">Satuan</span>
                    <span className={`font-medium ${foundItem ? 'text-blue-900' : 'text-gray-400 italic'}`}>
                        {foundItem ? foundItem.unit : '---'}
                    </span>
                 </div>
                 <div>
                    <span className="text-xs text-gray-500 block">Stok Saat Ini</span>
                    <span className={`font-medium ${foundItem ? 'text-blue-900' : 'text-gray-400 italic'}`}>
                        {foundItem ? foundItem.currentStock : '---'}
                    </span>
                 </div>
             </div>
          </div>

          {/* Row 4: Quantity */}
          <div className="space-y-2">
            <label htmlFor="stok_masuk" className="block text-sm font-semibold text-gray-700">
              Jumlah Stok yang Diterima
            </label>
            <div className="relative">
                <input
                    type="number"
                    id="stok_masuk"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.valueAsNumber)}
                    min="1"
                    required
                    disabled={!foundItem}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {foundItem && (
                    <span className="absolute right-4 top-2 text-gray-500 text-sm font-medium">{foundItem.unit}</span>
                )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
            <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 hover:text-red-600 transition-colors duration-200 border border-transparent hover:border-gray-200"
            >
                Batal
            </button>
            <button
                type="submit"
                disabled={isSubmitting || !foundItem || !foundPO || (foundPO && foundPO.status === 'CLOSED')}
                className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Menyimpan...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4" />
                        Simpan Transaksi
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};