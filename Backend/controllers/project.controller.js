import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';


export const createProject = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;

        const newProject = await projectService.createProject({ name, userId });

        res.status(201).json(newProject);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }

}

export const getAllProject = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }


}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}


// ///new
import Project from '../models/project.model.js';

export const deleteProjectController = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Optional: Check if user is authorized to delete (e.g. is the creator)
        // if (project.owner.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ message: 'Unauthorized to delete this project' });
        // }

        await Project.findByIdAndDelete(projectId);

        return res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};


// import { validationResult } from 'express-validator';
// import * as projectService from '../services/project.service.js';
// import userModel from '../models/user.model.js';
// import Project from '../models/project.model.js';

// export const createProject = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const { name } = req.body;
//         const loggedInUser = await userModel.findById(req.user._id).select('_id');
        
//         if (!loggedInUser) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const newProject = await projectService.createProject({ 
//             name, 
//             userId: loggedInUser._id 
//         });

//         return res.status(201).json(newProject);
//     } catch (err) {
//         console.error('Create Project Error:', err);
//         return res.status(500).json({ 
//             error: err.message || 'Failed to create project' 
//         });
//     }
// };

// export const getAllProjects = async (req, res) => {
//     try {
//         const projects = await projectService.getAllProjectByUserId({
//             userId: req.user._id
//         });

//         return res.status(200).json({ projects });
//     } catch (err) {
//         console.error('Get All Projects Error:', err);
//         return res.status(500).json({ 
//             error: err.message || 'Failed to fetch projects' 
//         });
//     }
// };

// export const addUserToProject = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const { projectId, users } = req.body;
        
//         const project = await projectService.addUsersToProject({
//             projectId,
//             users,
//             userId: req.user._id
//         });

//         return res.status(200).json({ project });
//     } catch (err) {
//         console.error('Add User to Project Error:', err);
//         return res.status(400).json({ 
//             error: err.message || 'Failed to add users to project' 
//         });
//     }
// };

// export const getProjectById = async (req, res) => {
//     try {
//         const { projectId } = req.params;
//         const project = await projectService.getProjectById({ 
//             projectId,
//             userId: req.user._id 
//         });

//         if (!project) {
//             return res.status(404).json({ error: 'Project not found' });
//         }

//         return res.status(200).json({ project });
//     } catch (err) {
//         console.error('Get Project By ID Error:', err);
//         return res.status(500).json({ 
//             error: err.message || 'Failed to fetch project' 
//         });
//     }
// };

// export const updateFileTree = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const { projectId, fileTree } = req.body;
//         const project = await projectService.updateFileTree({
//             projectId,
//             fileTree,
//             userId: req.user._id
//         });

//         return res.status(200).json({ project });
//     } catch (err) {
//         console.error('Update File Tree Error:', err);
//         return res.status(400).json({ 
//             error: err.message || 'Failed to update file tree' 
//         });
//     }
// };

// export const deleteProject = async (req, res) => {
//     try {
//         const { projectId } = req.params;
        
//         const project = await Project.findOneAndDelete({
//             _id: projectId,
//             owner: req.user._id
//         });

//         if (!project) {
//             return res.status(404).json({ 
//                 message: 'Project not found or unauthorized' 
//             });
//         }

//         return res.status(200).json({ 
//             message: 'Project deleted successfully' 
//         });
//     } catch (err) {
//         console.error('Delete Project Error:', err);
//         return res.status(500).json({ 
//             message: 'Server error during project deletion' 
//         });
//     }
// };
