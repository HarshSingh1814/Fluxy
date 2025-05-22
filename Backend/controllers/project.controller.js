import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult, check } from 'express-validator';
import catchAsync from '../utils/catchAsync.js';
import Project from '../models/project.model.js'; // Ensure Project is imported if used, or remove if not


export const createProject = catchAsync(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Sending a response directly in case of validation errors.
        // For consistency, you might want to throw an error that your global handler can catch.
        // For now, this remains as is, but consider standardizing.
        return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    if (!loggedInUser) {
        const err = new Error('User not found.');
        err.statusCode = 404;
        throw err;
    }
    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({ name, userId });

    res.status(201).json(newProject);

});

export const getAllProject = catchAsync(async (req, res) => {

    const loggedInUser = await userModel.findOne({
        email: req.user.email
    });

    if (!loggedInUser) {
        const err = new Error('User not found.');
        err.statusCode = 404;
        throw err;
    }

    const allUserProjects = await projectService.getAllProjectByUserId({
        userId: loggedInUser._id
    });

    return res.status(200).json({
        projects: allUserProjects
    });

});

export const addUserToProject = catchAsync(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, users } = req.body;

    const loggedInUser = await userModel.findOne({
        email: req.user.email
    });

    if (!loggedInUser) {
        const err = new Error('User not found.');
        err.statusCode = 404;
        throw err;
    }

    const project = await projectService.addUsersToProject({
        projectId,
        users,
        userId: loggedInUser._id
    });

    return res.status(200).json({
        project,
    });

});

export const getProjectById = catchAsync(async (req, res) => {

    // Manually apply validation checks for projectId
    await check('projectId').isMongoId().withMessage('Invalid Project ID format').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;

    const project = await projectService.getProjectById({ projectId });

    if (!project) {
        const err = new Error('Project not found.');
        err.statusCode = 404;
        throw err;
    }

    return res.status(200).json({
        project
    });

});

export const updateFileTree = catchAsync(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, fileTree } = req.body;

    const project = await projectService.updateFileTree({
        projectId,
        fileTree
    });

    if (!project) {
        const err = new Error('Failed to update file tree or project not found.');
        err.statusCode = 400; // Or 404 if project not found is more specific
        throw err;
    }

    return res.status(200).json({
        project
    });

});

export const deleteProjectController = catchAsync(async (req, res) => {
    // Manually apply validation checks for projectId
    await check('projectId').isMongoId().withMessage('Invalid Project ID format').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        const err = new Error('Project not found');
        err.statusCode = 404;
        throw err;
    }

    // Optional: Check if user is authorized to delete (e.g. is the creator)
    // This logic needs to be adapted if req.user._id is not directly available
    // or if ownership/authorization is determined differently.
    // For example, if using email to find user:
    // const loggedInUser = await userModel.findOne({ email: req.user.email });
    // if (!loggedInUser || project.owner.toString() !== loggedInUser._id.toString()) {
    //     const err = new Error('Unauthorized to delete this project');
    //     err.statusCode = 403;
    //     throw err;
    // }

    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({ message: 'Project deleted successfully' });
});
