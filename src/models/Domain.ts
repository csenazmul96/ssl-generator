import mongoose, { Schema, model, models } from 'mongoose';

const DomainSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    status: { type: String, default: 'pending' }, // pending, active, expired
    expiresAt: { type: Date },
}, { timestamps: true });

// Ensure unique domain per user or globally? Usually globally for SSL manager logic.
// But we can just use code check valid.
const Domain = models.Domain || model('Domain', DomainSchema);

export default Domain;
