
interface TransactionExportData {
  id: string;
  customer_name: string;
  customer_mobile: string;
  items: any[];
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  created_by: string | null;
  branch_name: string;
}

export const exportTransactionsToCSV = (transactions: TransactionExportData[]) => {
  const headers = [
    'Transaction ID',
    'Date',
    'Customer Name',
    'Mobile',
    'Branch',
    'Total Amount',
    'Payment Method',
    'Status',
    'Items',
    'Created By'
  ];

  const csvData = transactions.map(transaction => {
    const itemsDescription = Array.isArray(transaction.items) 
      ? transaction.items.map(item => `${item.name} (${item.quantity})`).join('; ')
      : '';

    return [
      `#${transaction.id.slice(-8)}`,
      new Date(transaction.created_at).toLocaleDateString(),
      transaction.customer_name,
      transaction.customer_mobile,
      transaction.branch_name,
      `₹${Number(transaction.total).toFixed(2)}`,
      transaction.payment_method.toUpperCase(),
      transaction.status.toUpperCase(),
      itemsDescription,
      transaction.created_by || 'System'
    ];
  });

  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
