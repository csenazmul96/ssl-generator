import mongoose, { Schema, model, models } from 'mongoose';

const AcmeOrderSchema = new Schema({
    domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true, unique: true },

    orderUrl: String,
    accountKey: String, // Stored as Text/JSON
    accountUrl: String, // ACME account URL for reuse
    privateKey: String, // Stored as Text/JSON

    // Challenge details
    challengeType: String, // dns-01, http-01
    challengeUrl: String,
    challengeKey: String,
    challengeVal: String,
}, { timestamps: true });

const AcmeOrder = models.AcmeOrder || model('AcmeOrder', AcmeOrderSchema);

export default AcmeOrder;
