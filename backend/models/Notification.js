import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['new_post', 'chat', 'report', 'trust'], default: 'new_post' },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: null },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
