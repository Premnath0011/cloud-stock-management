const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const SaleSchema = new mongoose.Schema({
  saleNumber: { type: String, unique: true },
  customerName: { type: String, trim: true, default: 'Walk-in Customer' },
  items: [SaleItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'other'], default: 'cash' },
  status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sfSynced: { type: Boolean, default: false },
  sfOpportunityId: { type: String, default: null }
}, { timestamps: true });

// Generate the next sale number from the highest existing number.
SaleSchema.pre('save', async function () {
  if (this.saleNumber) return;

  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `SALE-${year}${month}-`;

  const latestSale = await mongoose.model('Sale')
    .findOne({ saleNumber: new RegExp(`^${prefix}`) })
    .sort({ saleNumber: -1 })
    .select('saleNumber')
    .lean();

  const lastNumber = latestSale
    ? parseInt(latestSale.saleNumber.slice(prefix.length), 10)
    : 0;

  this.saleNumber = `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
});

module.exports = mongoose.model('Sale', SaleSchema);
