const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  totalDutiesCount: {
    type: Number,
    default: 0
  },
  monthlyDuties: [{
    monthYear: {
      type: String, // Format: "MM-YYYY"
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ 'monthlyDuties.monthYear': 1 });

module.exports = mongoose.model('Employee', employeeSchema);