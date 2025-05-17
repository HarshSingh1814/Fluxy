import mongoose from 'mongoose';


const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: [ true, 'Project name must be unique' ],
    },

    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    fileTree: {
        type: Object,
        default: {}
    },

})


const Project = mongoose.model('project', projectSchema)


export default Project;




// import mongoose from 'mongoose';

// const projectSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Project name is required'],
//         trim: true,
//         maxlength: [100, 'Project name cannot exceed 100 characters'],
//         validate: {
//             validator: function(v) {
//                 return /^[a-zA-Z0-9\s\-_]+$/.test(v);
//             },
//             message: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'
//         }
//     },
//     description: {
//         type: String,
//         trim: true,
//         maxlength: [500, 'Description cannot exceed 500 characters'],
//         default: ''
//     },
//     owner: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'user',
//         required: true
//     },
//     collaborators: [{
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'user',
//             required: true
//         },
//         role: {
//             type: String,
//             enum: ['admin', 'editor', 'viewer'],
//             default: 'editor'
//         },
//         joinedAt: {
//             type: Date,
//             default: Date.now
//         }
//     }],
//     fileTree: {
//         type: Object,
//         default: {
//             '/': {
//                 type: 'directory',
//                 children: {}
//             }
//         }
//     },
//     isPublic: {
//         type: Boolean,
//         default: false
//     },
//     tags: [{
//         type: String,
//         trim: true,
//         maxlength: [20, 'Tags cannot exceed 20 characters']
//     }],
//     lastModified: {
//         type: Date,
//         default: Date.now
//     }
// }, {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

// // Indexes for better query performance
// projectSchema.index({ name: 'text', description: 'text' });
// projectSchema.index({ owner: 1 });
// projectSchema.index({ 'collaborators.user': 1 });
// projectSchema.index({ isPublic: 1 });
// projectSchema.index({ tags: 1 });

// // Virtual for total collaborators count (owner + collaborators)
// projectSchema.virtual('totalCollaborators').get(function() {
//     return this.collaborators.length + 1; // +1 for owner
// });

// // Middleware to update lastModified timestamp
// projectSchema.pre('save', function(next) {
//     this.lastModified = Date.now();
//     next();
// });

// // Static method for finding user's accessible projects
// projectSchema.statics.findByUser = function(userId) {
//     return this.find({
//         $or: [
//             { owner: userId },
//             { 'collaborators.user': userId },
//             { isPublic: true }
//         ]
//     }).populate('owner collaborators.user');
// };

// // Static method for checking project access
// projectSchema.statics.hasAccess = async function(projectId, userId) {
//     const project = await this.findOne({
//         _id: projectId,
//         $or: [
//             { owner: userId },
//             { 'collaborators.user': userId },
//             { isPublic: true }
//         ]
//     });
//     return !!project;
// };

// const Project = mongoose.model('project', projectSchema);

// export default Project;