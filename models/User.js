const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: String,
  name: String,
  email: String,
  password: String,
  photo: {
    type: String,
    default:
      "https://icon-library.net/images/default-profile-icon/default-profile-icon-24.jpg"
  },
  comments: [String],
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Cocktail"
    }
  ]
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
