"use server";

import { ID, Query } from "node-appwrite"
import { users } from "../appwrite.config"

export const createUser = async (user: CreateUserParams) => {
    //logic for creating a new authantication appwrite user

    try {
        const newUser =  await users.create(
            ID.unique(),
            user.email,
            user.phone,
            undefined,
            user.name
        );

        console.log(newUser)

        return newUser;

    } catch (error: any) {
        if(error && error?.code === 409 ) {
            //if the user already exists

            const documents = await users.list([
                Query.equal('email', [user.email])
            ])
            
            //new feature - dilantha
            if(documents.total > 0) {
                return documents?.users[0];
            }
            
        }

        console.error("an error occured when creating a new user: " ,error);
        throw error;
    }
}