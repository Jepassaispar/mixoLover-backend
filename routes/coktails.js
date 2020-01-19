const express = require("express");
const cocktailModel = require("./../models/Cocktail");
const TagModel = require("./../models/Tag");
const userModel = require("./../models/User");
const router = express.Router();
const uploadCloud = require("./../config/cloudinary");

// Show Cocktails

// router.get("/", (req, res) => {
//   cocktailModel
//     .find({
//       $text: {
//         $search: `.*${req.query.query}.*`,
//         $caseSensitive: false
//       }
//     })
//     .populate("tag")
//     .then(dbRes => {
//       res.status(200).send(dbRes);
//     })
//     .catch(dbErr => {
//       console.log(dbErr);
//       res.status(500).send(dbErr);
//     });
// });

router.get("/", (req, res) => {
  // return res.send("yo");
  cocktailModel
    .find({
      $or: [
        { Name: { $regex: `.*${req.query.query}.*`, $options: "i" } },
        { Tags: { $regex: `.*${req.query.query}.*`, $options: "i" } },
        { Ingredients: { $regex: `.*${req.query.query}.*`, $options: "i" } }
      ]
    })
    .populate("tags")
    .then(dbRes => {
      let cocktailsWithFavorites = [];
      let isUser = false;
      let allCocktails = dbRes;
      let allCocktailsSorted = allCocktails.sort((a, b) => {
        return b.Like - a.Like;
      });
      // console.log(req.session);
      if (req.session.currentUser) {
        isUser = true;
        const userId = req.session.currentUser._id;
        userModel.findById(userId).then(dbRes2 => {
          const user = dbRes2;
          if (user) {
            cocktailsWithFavorites = allCocktailsSorted.filter(cocktail => {
              return user.favorites.includes(cocktail._id);
            });
          }
          res.send({ allCocktailsSorted, cocktailsWithFavorites, isUser });
        });
      } else {
        res.send({ allCocktailsSorted, cocktailsWithFavorites, isUser });
      }
    })
    .catch(dbErr => {
      res.status(500).send(dbErr);
    });
});

router.get("/userpro-cocktail/:id", (req, res) => {
  cocktailModel
    .find({
      UserProID: req.params.id
    })
    .then(dbRes => {
      res.status(200).send(dbRes);
    })
    .catch(dbErr => {
      res.status(500).send(dbErr);
    });
});

// router.get("/userFav", (req, res) => {
//   const userId = req.session.currentUser;
//   userModel
//     .findById(userId)
//     .then(dbRes => {
//       const user = dbRes;
//       cocktailModel.find().then(dbRes => {
//         const allCocktails = dbRes;
//         const coktailsWithFavorites = allCocktails.map(cocktail => {
//           const copy = cocktail.toJSON();
//           copy.isFavorite = user.Favorites && user.Favorites.includes(copy._id);
//           console.log(copy);
//           return copy;
//         });
//       });
//     })
//     .catch(dbErr => console.log(dbErr));
// });

// Show One Cocktail
router.get("/:id", (req, res) => {
  cocktailModel
    .findById(req.params.id)
    .populate("tags")
    .then(dbRes => {
      res.status(200).send(dbRes);
    })
    .catch(dbErr => {
      res.status(500).send(dbErr);
    });
});

//FindByUserId
router.get("/profile/edit-cocktail/:id", (req, res) => {
  cocktailModel
    .findById(req.params.id)
    .populate("tags")
    .then(dbRes => {
      let fullCocktail = dbRes;
      TagModel.find().then(dbRes2 => {
        const fullTags = dbRes2;
        res.status(200).send({ fullCocktail, fullTags });
      });
    })
    .catch(dbErr => {
      res.status(500).send(dbErr);
    });
});

// Create one Cocktail
router.post("/", uploadCloud.single("Image"), (req, res) => {
  // console.log("yo", req.session.currentUser);
  const newCocktail = { ...req.body, UserProID: req.session.currentUser };

  if (req.file) {
    newCocktail.Image = req.file.secure_url;
  }
  res.send("todo");

  cocktailModel
    .create(newCocktail)
    .then(dbRes => {
      // console.log(eq.session.currentUser);
      console.log("Cocktail successfully created");
      res.status(201).send(dbRes);
    })
    .catch(dbErr => {
      res.status(500).send(dbErr);
    });
  // res.send("Ok");
});

router.post("/postAllCocktails", (req, res) => {
  const allCocktails = [...req.body];
  cocktailModel
    .createMany(allCocktails)
    .then(dbRes => {
      console.log("all cocktails entered DB");
      res.status(201).send(dbRes);
    })
    .catch(dbErr => res.status(500).send(dbErr));
});

// // findbyId cocktail and update
router.patch(
  "/profile/edit-cocktail/:id",
  uploadCloud.single("Image"),
  (req, res) => {
    if (req.file) req.body.Image = req.file.secure_url;
    cocktailModel
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(dbRes => {
        res.status(200).send(dbRes);
      })
      .catch(dbErr => {
        res.status(500).send(dbErr);
      });
  }
);
// findbyId and update
// router.patch("/:id", (req, res) => {
//   cocktailModel
//     .findByIdAndUpdate(req.params.id, req.body)
//     .then(dbRes => {
//       res.status(200).send(dbRes);
//     })
//     .catch(dbErr => {
//       res.status(500).send(dbErr);
//     });
// });

// Delete cocktails
router.delete("/:id", (req, res) => {
  cocktailModel
    .findByIdAndDelete(req.params.id)
    .then(dbRes => {
      res.status(200).send(dbRes);
    })
    .catch(dbErr => {
      res.status(500).send(dbErr);
    });
});

// Like a cocktail
router.patch("/addLike/:id", (req, res) => {
  cocktailModel
    .findByIdAndUpdate(req.params.id, { $inc: { Like: +1 } }, { new: true })
    .then(dbRes => {
      // res.status(200).send(dbRes);
      userModel
        .findByIdAndUpdate(req.session.currentUser._id, {
          $addToSet: { favorites: req.params.id }
        })
        .then(dbRes2 => res.status(200).send(dbRes));
    })
    .catch(dbErr => res.status(500).send(dbErr));
});

// Remove like
router.patch("/removeLike/:id", (req, res) => {
  cocktailModel
    .findByIdAndUpdate(req.params.id, { $inc: { Like: -1 } }, { new: true })
    .then(dbRes => {
      res.status(200).send(dbRes);
      userModel
        .findByIdAndUpdate(req.session.currentUser._id, {
          $pull: { favorites: req.params.id }
        })
        .then(dbRes2 => res.status(200).send(dbRes));
    })
    .catch(dbErr => res.status(500).send(dbErr));
});

module.exports = router;
