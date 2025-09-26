import express from "express";

import { createUser, getUserByEmail } from "../db/user";
import { random, authentication } from "../helpers";

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.sendStatus(400);
        }
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.sendStatus(409);
        }
        const salt = random();
        const user = await createUser({
            username,
            email,
            authentication: { salt, password: authentication(salt, password) },
        });
        return res.status(201).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.sendStatus(400);
        }
        const user = await getUserByEmail(email).select("+authentication.salt +authentication.password");
        if (!user || !user.authentication) {
            return res.sendStatus(401);
        }
        const auth = user.authentication!;
        const expectedHash = authentication(auth.salt as string, password);
        if (auth.password !== expectedHash) {
            return res.sendStatus(401);
        }
        const salt = random();
        auth.sessionToken = authentication(salt, user._id.toString());
        await user.save();
        res.cookie(process.env.AUTH_TOKEN_NAME!, auth.sessionToken, { domain: "localhost", path: "/" });
        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
};