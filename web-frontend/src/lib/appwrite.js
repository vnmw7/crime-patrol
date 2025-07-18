import { Account, Client, Databases } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);


export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query } from 'appwrite';
