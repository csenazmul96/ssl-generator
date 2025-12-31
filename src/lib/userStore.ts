import dbConnect from './db';
import User from '@/models/User';

export interface UserType {
    id: string;
    name?: string | null;
    email: string;
    password?: string | null;
    image?: string | null;
    provider: string;
}

// Helper to map _id to id
function mapUser(doc: any): UserType {
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
}

export async function getUsers(): Promise<UserType[]> {
    await dbConnect();
    const users = await User.find({});
    return users.map(mapUser);
}

export async function saveUser(userData: Partial<UserType>): Promise<UserType> {
    await dbConnect();

    if (userData.email) {
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
            throw new Error('User already exists');
        }
    }

    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        image: userData.image,
        provider: userData.provider || 'credentials'
    });

    return mapUser(newUser);
}

export async function findUserByEmail(email: string): Promise<UserType | null> {
    await dbConnect();
    const user = await User.findOne({ email });
    return user ? mapUser(user) : null;
}

export async function updateUser(email: string, data: Partial<UserType>): Promise<UserType> {
    await dbConnect();

    // Build update object conditionally
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;
    // Only update password if explicitly provided and not empty
    if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
    }

    const user = await User.findOneAndUpdate(
        { email },
        updateData,
        { new: true }
    );
    if (!user) throw new Error('User not found');
    return mapUser(user);
}
