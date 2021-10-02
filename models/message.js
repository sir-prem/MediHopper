const mongoose = require("mongoose"),
{ Schema } = require("mongoose");

const messageSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    fromUsername: {
        type: String,
        required: true
    },
    toUsername: {
        type: String,
        required: true
    }
}, 
{ timestamps: true });

messageSchema.methods.getDay = function() {
    return this.createdAt;
};

module.exports = mongoose.model("Message", messageSchema);