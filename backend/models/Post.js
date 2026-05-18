import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Jobs', 'Rentals', 'Events', 'Alerts'] 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] required for GeoJSON
      required: true
    }
  },
  radius: { 
    type: Number, // Stored in meters (e.g., 500, 1000, 2000)
    required: true 
  },
  contact: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending' 
  },
  isSuspicious: { type: Boolean, default: false },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries (finding nearby posts)
postSchema.index({ location: '2dsphere' });

const Post = mongoose.model('Post', postSchema);
export default Post;
