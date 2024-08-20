"use server";

import { ID, Query } from "node-appwrite"
import { storage, users, NEXT_PUBLIC_BUCKET_ID, databases, NEXT_PUBLIC_ENDPOINT, PROJECT_ID, PATIENT_COLLECTION_ID, DATABASE_ID} from "../appwrite.config"
import { parseStringify } from "../utils";

import { InputFile } from "node-appwrite/file";

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

export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId);

        return parseStringify(user);
    } catch (error) {
        console.log(error)
    }
}
    
export const registerPatient = async ({identificationDocument, ...patient}: RegisterUserParams) => {
    try {
        let file; 

        if(identificationDocument) {
            const inputFile = InputFile.fromBuffer(
                identificationDocument?.get('blobFile') as Blob,
                identificationDocument?.get('fileName') as string,
            ) 

            file = await storage.createFile(NEXT_PUBLIC_BUCKET_ID!, ID.unique(), inputFile);

        }

        console.log({
            identificationDocumentId: file?.$id || null,
            identificationDocumentUrl: `${NEXT_PUBLIC_ENDPOINT}/storage/buckets/${NEXT_PUBLIC_BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        })

        console.log({gender: patient.gender})    

        const newPatient = await databases.createDocument(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            ID.unique(),
            {
                identificationDocumentId: file?.$id || null,
                identificationDocumentUrl: `${NEXT_PUBLIC_ENDPOINT}/storage/buckets/${NEXT_PUBLIC_BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
                ...patient
            }
        )

        return parseStringify(newPatient);
    } catch (error) {
        console.log(error);
    }
} 

export const getPatient = async (userId: string) => {
    try {
        const patients = await databases.listDocuments(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            [ Query.equal('userId', userId) ]
        );

        return parseStringify(patients.documents[0]);
    } catch (error) {
        console.log(error)
    }
}