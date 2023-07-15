const Book = require("../models/Book");
const fs = require("fs");

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getBestrating = (req, res, next) => {
  Book.find({})
    .sort({ averageRating: -1 })
    .limit(3)
    .then((bestRatedBooks) => {
      res.status(200).json(bestRatedBooks);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  // Recherche du livre en récupérant son id dans la requête
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.createBook = (req, res, next) => {
  // Récupération des informations dans la requête
  const bookObject = JSON.parse(req.body.book);
  // Suppression de l'id pour génération d'un nouvel id unique par MongoDB
  delete bookObject._id;
  // Suppression du userId pour associer le livre à l'userId authentifié
  delete bookObject._userId;

  // Création d'un nouvel objet Book à partir des données de la requête
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    // URL de l'image : protocole, hôte, nom du fichier
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  // Enregistrement dans la bdd
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.createRating = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Récupération du userId du user connecté
      const currentUserId = req.auth.userId;
      // Note déjà existante si le tableau ratings contient déjà cet userId
      const existingRating = book.ratings.find(
        (rating) => rating.userId === currentUserId
      );

      // Vérification d'une note déjà existante par le même user
      if (existingRating) {
        return res.status(400).json({ error: "Note déjà ajoutée auparavant." });
      } else {
        // Envoi de la note et du userId dans le tableau ratings
        book.ratings.push({
          userId: req.auth.userId,
          grade: req.body.rating,
        });
      }
      // Calcul d'une note moyenne à partir du tableau ratings
      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce(
        (sum, rating) => sum + rating.grade,
        0
      );
      const averageRating = Math.round(sumRatings / totalRatings);
      book.averageRating = averageRating;

      // Mise à jour de la note dans la bdd
      book
        .save()
        .then(() => {
          // Renvoi du livre mis à jour dans la réponse
          res.status(200).json(book);
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  // Vérification de l'upload d'une nouvelle image
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        // Ajout d'une nouvelle propriété imageUrl
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification du userId
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification du userId
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        // Extraction du nom de fichier à partir de l'URL
        const filename = book.imageUrl.split("/images/")[1];
        // Suppression de l'image
        fs.unlink(`images/${filename}`, () => {
          // Suppression du livre grâce à son id
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
