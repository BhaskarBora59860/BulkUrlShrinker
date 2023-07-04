const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true
  },
  
  
 
  clicks: {
    type: Number,
    default: 0
  },
  expirationDate:{
    type:Date,
    default: null,
  },
  
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

module.exports = ShortUrl;
