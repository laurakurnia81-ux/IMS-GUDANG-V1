import { Item, PurchaseOrder } from '../types';

// Mock Data for Items
const MOCK_ITEMS: Item[] = [
  { code: 'BRG-001', name: 'Laptop Gaming ASUS ROG', unit: 'Unit', currentStock: 10 },
  { code: 'BRG-002', name: 'Mouse Logitech Wireless', unit: 'Pcs', currentStock: 50 },
  { code: 'BRG-003', name: 'Monitor LG 24 Inch', unit: 'Unit', currentStock: 25 },
  { code: 'BRG-004', name: 'Keyboard Mechanical RGB', unit: 'Pcs', currentStock: 30 },
  { code: 'BRG-005', name: 'HDMI Cable 2m', unit: 'Pcs', currentStock: 100 },
];

// Mock Data for Purchase Orders
const MOCK_POS: PurchaseOrder[] = [
  { code: 'PO-20250601-045', vendor: 'PT. Teknologi Maju', status: 'OPEN' },
  { code: 'PO-20250601-046', vendor: 'CV. Sentosa Abadi', status: 'CLOSED' },
  { code: 'PO-20250602-010', vendor: 'Global Electronics Ltd', status: 'OPEN' },
];

// Simulate API delay
const DELAY = 300;

export const fetchItemByCode = async (code: string): Promise<Item | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = MOCK_ITEMS.find(i => i.code.toLowerCase() === code.toLowerCase());
      resolve(item || null);
    }, DELAY);
  });
};

export const fetchPOByCode = async (code: string): Promise<PurchaseOrder | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const po = MOCK_POS.find(p => p.code.toLowerCase() === code.toLowerCase());
      resolve(po || null);
    }, DELAY);
  });
};

export const saveTransaction = async (data: any): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Transaction Saved to DB:", data);
            resolve(true);
        }, 800);
    });
}