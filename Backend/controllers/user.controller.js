
import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createUserController = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Consider throwing a custom validation error for the global handler
        return res.status(400).json({ errors: errors.array() });
    }

    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();

    // userService.createUser should ideally not return password,
    // but if it does, ensure it's handled or removed before sending.
    // For now, assuming user object from service is safe or handled there.
    // If user._doc exists and contains password, it should be removed.
    // const userResponse = { ...user._doc };
    // delete userResponse.password;
    // res.status(201).json({ user: userResponse, token });
    // For simplicity, if user object is a Mongoose document, .toObject() is safer
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;

    res.status(201).json({ user: userObject, token });
});

export const loginController = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        const err = new Error('Email and password are required');
        err.statusCode = 400;
        throw err;
    }

    const user = await userModel.findOne({ email }).select('+password');

    if (!user || !user.password) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const token = await user.generateJWT();
    // Similar to createUser, ensure password is not in the response.
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;

    res.status(200).json({ user: userObject, token });
});

export const profileController = catchAsync(async (req, res) => {
    // req.user is populated by authentication middleware.
    // Ensure it doesn't contain sensitive info like password.
    // Assuming req.user is safe to send as is.
    res.status(200).json({
        user: req.user
    });
});

export const logoutController = catchAsync(async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        const err = new Error('Token not provided');
        err.statusCode = 400;
        throw err;
    }

    // Note: redisClient.set is not awaited here. If it were async and could fail,
    // we'd need to await it and handle potential errors by throwing them.
    // For now, assuming it's a sync operation or its errors are not critical to this flow.
    // If redisClient.set can throw an error that should be caught by catchAsync,
    // it needs to be an awaited async operation.
    // Example: await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
    // Promisify redisClient.set or ensure redisClient itself supports promises for await to work as expected.
    // Assuming redisClient.set returns a promise or is used with a promisified version.
    await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

    res.status(200).json({
        message: 'Logged out successfully'
    });
});

export const getAllUsersController = catchAsync(async (req, res) => {
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    if (!loggedInUser) {
        const err = new Error('Logged-in user not found');
        err.statusCode = 404;
        throw err;
    }

    const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

    return res.status(200).json({ users: allUsers });
});
