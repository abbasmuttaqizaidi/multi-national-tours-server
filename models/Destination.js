import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema({
  day: Number,
  title: String,
  description: String,
});

const destinationSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  currency: { type: String, default: "₹" },
  duration: String,
  durationDays: Number,
  location: String,
  category: String,
  recommendation_tag: String,
  amenities: [String],
  gallery: [String],
  itinerary: [itinerarySchema],
  included: [String],
  excluded: [String],
  showInRecommendations: { type: Boolean, default: false },
  isPopularDestination: { type: Boolean, default: false },
  heroImage: String,
  nextJourneyScheduled: String,
  hasDiscount: { type: Boolean, default: false },
  discount: {
    percent: String,
    label: String,
    revisedPrice: Number,
    discountType: String,
  },
});

export default mongoose.model("Destination", destinationSchema);
