const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    included: {
        type: Boolean,
        default: true
    },
    icon: {
        type: String,
        default: 'bi-check-circle'
    }
});

const schema = new mongoose.Schema({
    planname: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    setprice: {
        currency: {
            type: String,
            enum: ["USD", "EUR", "GBP", "INR"],
            default: "USD",
            required: true,
        },
        currencyCode: {
            type: String,
            default: "USD",
            required: true
        },
        currencySymbol: {
            type: String,
            default: "$",
            required: true
        },      
        price: {
            type: Number,
            required: true,
            min: 0
        },
        originalPrice: {
            type: Number,
            min: 0
        },
        discount: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    durationUnit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years'],
        default: 'days'
    },
    totalsessions: {
        type: Number,
        required: true,
        min: 1
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: 150
    },
    features: [featureSchema],
    protocols: {
        type: [String],
        required: true,
    },
    category: {
        type: String,
        enum: ['basic', 'premium', 'enterprise', 'custom'],
        default: 'basic'
    },
    isactive: {
        type: Boolean,
        default: false,
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    maxParticipants: {
        type: Number,
        default: 1
    },
    includesRecording: {
        type: Boolean,
        default: false
    },
    includesSupport: {
        type: Boolean,
        default: false
    },
    supportHours: {
        type: String,
        default: '9 AM - 5 PM'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to format price as currency
schema.virtual('formattedPrice').get(function () {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.setprice.currency,
        minimumFractionDigits: 2,
    });
    return formatter.format(this.setprice.price);
});

// Virtual field for discounted price
schema.virtual('discountedPrice').get(function () {
    if (this.setprice.discount > 0) {
        return this.setprice.price * (1 - this.setprice.discount / 100);
    }
    return this.setprice.price;
});

// Virtual field for formatted discounted price
schema.virtual('formattedDiscountedPrice').get(function () {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.setprice.currency,
        minimumFractionDigits: 2,
    });
    return formatter.format(this.discountedPrice);
});

// Virtual field for duration display
schema.virtual('durationDisplay').get(function () {
    return `${this.duration} ${this.durationUnit}`;
});

// Index for better query performance
schema.index({ isactive: 1, sortOrder: 1 });
schema.index({ category: 1, isactive: 1 });
schema.index({ planname: 1 });

// Pre-save middleware to set defaults
schema.pre('save', function(next) {
    // Set currency defaults if not provided
    if (this.setprice.currency === 'USD') {
        if (!this.setprice.currencyCode) this.setprice.currencyCode = 'USD';
        if (!this.setprice.currencySymbol) this.setprice.currencySymbol = '$';
    }
    
    // Set original price if not set
    if (!this.setprice.originalPrice) {
        this.setprice.originalPrice = this.setprice.price;
    }
    
    next();
});

module.exports = mongoose.model("Plans", schema);
