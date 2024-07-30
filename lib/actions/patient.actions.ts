import { ID, Query } from "node-appwrite"
import { users } from "../appwrite.config"
import { parseStringify } from "../utils";

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

        console.log({newUser})

        return parseStringify(newUser);

    } catch (error: any) {
        if(error && error?.code === 409 ) {
            //if the user already exists

            const documents = await users.list([
                Query.equal('email', [user.email])
            ])

            return documents?.users[0];
        }
    }
}