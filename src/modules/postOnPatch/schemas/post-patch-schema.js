const mongoose = require('mongoose');
const { Schema } = mongoose;

const postPatchSchema = new Schema({
	date: Date,
	threadId: String,
});

const PostPatch = mongoose.model('Patch-Posts', postPatchSchema);
module.exports = PostPatch;
