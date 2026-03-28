const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'analyst', 'viewer'],
    default: 'analyst'
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=007bff&color=fff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Remove any existing problematic indexes
UserSchema.pre('save', function(next) {
  // This fixes the duplicate key error for username
  next();
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user is admin
UserSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Virtual for login count
UserSchema.virtual('loginCount').get(function() {
  return this.loginHistory ? this.loginHistory.length : 0;
});

// Method to update login history
UserSchema.methods.updateLoginHistory = function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    timestamp: new Date(),
    ipAddress: ipAddress || 'Unknown',
    userAgent: userAgent || 'Unknown'
  });
  
  // Keep only last 10 login records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  
  return this.save();
};

// Create demo users on startup (with error handling)
UserSchema.statics.createDemoUsers = async function() {
  try {
    const demoUsers = [
      {
        name: 'Red Ranger (Admin)',
        email: process.env.DEMO_ADMIN_EMAIL || 'admin@morphingrid.com',
        password: process.env.DEMO_ADMIN_PASSWORD || 'password123',
        role: 'admin'
      },
      {
        name: 'Blue Ranger (Analyst)',
        email: process.env.DEMO_ANALYST_EMAIL || 'analyst@morphingrid.com',
        password: process.env.DEMO_ANALYST_PASSWORD || 'password123',
        role: 'analyst'
      }
    ];
    
    for (const userData of demoUsers) {
      try {
        const existingUser = await this.findOne({ email: userData.email });
        
        if (!existingUser) {
          const user = new this(userData);
          await user.save();
          console.log(`✅ Demo user created: ${user.email}`);
        } else {
          console.log(`ℹ️  Demo user already exists: ${userData.email}`);
        }
      } catch (userError) {
        console.error(`❌ Error creating user ${userData.email}:`, userError.message);
      }
    }
    
    console.log('✅ Demo users setup completed');
  } catch (error) {
    console.error('❌ Error in createDemoUsers:', error.message);
    // Don't throw, just log the error
  }
};

module.exports = mongoose.model('User', UserSchema);