const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, unique: true, index: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] }
  },
  { timestamps: true }
);

productSchema.pre('validate', function () {
  if (!this.code) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    this.code = `PROD-${stamp}-${rand}`;
  }
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);