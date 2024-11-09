import clientPromise from "@utils/db";

export const isAuthed = async (token: string) => {
    if (!token) return false;
    const user = await getUser(token);

    if (!user) {
        return false;
    } else {
        return user;
    }
};

export const getUser = async (token: string) => {
    if (!token) return null;

    const client = await clientPromise;
    const users = client.db("themesDatabase").collection("users");
    const entry = await users.findOne({ "user.key": token });

    return entry?.user;
};
