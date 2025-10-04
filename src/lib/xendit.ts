import { Xendit } from 'xendit-node';

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

export default xendit;


export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export const createInvoice = async (
  orderId: number,
  amount: number,
  description: string,
  customerEmail: string,
  items: InvoiceItem[],
  customerName?: string
) => {
  try {
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId: `order-${orderId}-${Date.now()}`,
        amount,
        description,
        invoiceDuration: 86400, // 24 hours
        customer: {
          email: customerEmail,
          givenNames: customerName || 'UniMerch Customer',
        },
        successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order=${orderId}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?order=${orderId}`,
        currency: 'IDR',
        items,
      },
    });

    return invoice;
  } catch (error) {
    console.error('Error creating Xendit invoice:', error);
    throw error;
  }
};

export const getInvoiceById = async (invoiceId: string) => {
  try {
    const invoice = await xendit.Invoice.getInvoiceById({
      invoiceId,
    });
    return invoice;
  } catch (error) {
    console.error('Error getting Xendit invoice:', error);
    throw error;
  }
};