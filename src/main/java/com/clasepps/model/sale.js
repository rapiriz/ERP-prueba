const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    product:   { type: String, required: true, trim: true },
    quantity:  { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal:  { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'La venta debe estar asociada a un cliente'],
    },
    items: {
      type: [saleItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'La venta debe tener al menos un ítem',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['efectivo', 'debito', 'credito', 'transferencia'],
      required: [true, 'El método de pago es obligatorio'],
    },
    status: {
      type: String,
      enum: ['pendiente', 'completada', 'cancelada', 'reembolsada'],
      default: 'completada',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Antes de guardar, calcular totales automáticamente
saleSchema.pre('save', function (next) {
  this.total = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  this.finalTotal = this.total - this.discount;
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
