const mongoose = require('mongoose');

const dutySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  shiftTime: {
    type: String,
    enum: ['6am-2pm', '2pm-10pm', '9am-6pm'],
    required: true
  },
  isScheduled: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
dutySchema.index({ employee: 1, date: 1 });
dutySchema.index({ date: 1, shiftTime: 1 });

module.exports = mongoose.model('Duty', dutySchema);