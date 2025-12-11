export interface Item {
  code: string;
  name: string;
  unit: string;
  currentStock: number;
}

export interface PurchaseOrder {
  code: string;
  vendor: string;
  status: 'OPEN' | 'CLOSED';
}

export interface IncomingTransaction {
  id: string; // kode_transaksi
  poCode: string; // kode_po
  date: string; // tgl_terima
  itemCode: string; // kode_barang
  quantity: number; // stok_masuk
}

export enum ValidationStatus {
  IDLE = 'IDLE',
  VALID = 'VALID',
  INVALID = 'INVALID',
  LOADING = 'LOADING'
}