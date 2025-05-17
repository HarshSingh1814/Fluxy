import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [ 6, 'Email must be at least 6 characters long' ],
        maxLength: [ 50, 'Email must not be longer than 50 characters' ]
    },

    password: {
        type: String,
        select: false,
    }
})


userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}



userSchema.methods.isValidPassword = async function (password) {
    if (!password || !this.password) {
        console.error("Missing password or hash:", { password, hashed: this.password });
        throw new Error("data and hash arguments required for bcrypt.compare");
    }

    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function () {
    return jwt.sign(
        { email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}


const User = mongoose.model('user', userSchema);

export default User;


// import mongoose from "mongoose";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import validator from "validator";
// import crypto from "crypto";

// const userSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         trim: true,
//         lowercase: true,
//         validate: {
//             validator: validator.isEmail,
//             message: 'Please provide a valid email'
//         },
//         maxLength: [100, 'Email must not exceed 100 characters']
//     },
//     password: {
//         type: String,
//         select: false,
//         required: [true, 'Password is required'],
//         minLength: [8, 'Password must be at least 8 characters'],
//         maxLength: [128, 'Password must not exceed 128 characters'],
//         validate: {
//             validator: function(v) {
//                 return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
//             },
//             message: 'Password must contain at least one uppercase, one lowercase, one number and one special character'
//         }
//     },
//     name: {
//         type: String,
//         trim: true,
//         maxLength: [50, 'Name must not exceed 50 characters']
//     },
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'user'
//     },
//     isVerified: {
//         type: Boolean,
//         default: false
//     },
//     verificationToken: String,
//     verificationTokenExpires: Date,
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//     lastLogin: Date,
//     loginHistory: [{
//         ipAddress: String,
//         userAgent: String,
//         timestamp: {
//             type: Date,
//             default: Date.now
//         }
//     }],
//     active: {
//         type: Boolean,
//         default: true
//     }
// }, {
//     timestamps: true,
//     toJSON: {
//         virtuals: true,
//         transform: function(doc, ret) {
//             delete ret.password;
//             delete ret.__v;
//             return ret;
//         }
//     },
//     toObject: {
//         virtuals: true,
//         transform: function(doc, ret) {
//             delete ret.password;
//             delete ret.__v;
//             return ret;
//         }
//     }
// });

// // Indexes
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ isVerified: 1 });
// userSchema.index({ active: 1 });

// // Password hashing middleware
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
    
//     try {
//         this.password = await bcrypt.hash(this.password, 12);
//         next();
//     } catch (err) {
//         next(err);
//     }
// });

// // Password comparison method
// userSchema.methods.isValidPassword = async function(candidatePassword) {
//     if (!candidatePassword || !this.password) {
//         throw new Error('Password comparison requires both candidate and hashed password');
//     }
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// // JWT generation method
// userSchema.methods.generateAuthToken = function() {
//     return jwt.sign(
//         {
//             userId: this._id,
//             email: this.email,
//             role: this.role
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
//     );
// };

// // Account verification token
// userSchema.methods.createVerificationToken = function() {
//     const token = crypto.randomBytes(32).toString('hex');
//     this.verificationToken = crypto
//         .createHash('sha256')
//         .update(token)
//         .digest('hex');
//     this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//     return token;
// };

// // Password reset token
// userSchema.methods.createPasswordResetToken = function() {
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     this.passwordResetToken = crypto
//         .createHash('sha256')
//         .update(resetToken)
//         .digest('hex');
//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//     return resetToken;
// };

// // Track login activity
// userSchema.methods.recordLogin = function(ipAddress, userAgent) {
//     this.lastLogin = Date.now();
//     this.loginHistory.push({ ipAddress, userAgent });
//     // Keep only last 5 logins
//     if (this.loginHistory.length > 5) {
//         this.loginHistory.shift();
//     }
// };

// const User = mongoose.model('User', userSchema);

// export default User;
