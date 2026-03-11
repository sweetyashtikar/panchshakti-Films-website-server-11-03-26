const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName:   { type: String, required: true, trim: true },
    middleName:  { type: String, trim: true, default: '' },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile:      { type: String, required: true, match: [/^\d{10}$/, 'Mobile number must be 10 digits'] },
    password:    { type: String, required: true, minlength: 8 },

    // Role: agency | model | client
    role: {
      type: String,
      enum: ['agency', 'model', 'client'],
      required: true,
    },

    isVerified:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Hash password before saving ─────────────────────────────
// ─── Hash password before saving ─────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});
// ─── Compare password method ──────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Hide password in JSON output ────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);