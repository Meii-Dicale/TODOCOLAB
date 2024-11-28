const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config(); 
const SECRET_KEY = process.env.SECRET_KEY ;


// vérifier la connexion et token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log(token);
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Stocke les données du token dans req.user
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token invalide' });
        console.error(err);
    }
};

// Créer un Utilisateur
router.post('/createUser', async (req, res) => {
    console.log(req.body);
    const {nameUser, passwordUser} = req.body;
    
    const securedPassword = await bcrypt.hash(passwordUser, 10)
    const verifyUser = "Select * FROM user WHERE nameUser = ?"
    const createUser = "INSERT INTO user ( nameUser, passwordUser ) VALUES (? , ?)"
    bdd.query(verifyUser, [nameUser], (error, result) => {
        if(error) throw error;
        if(result.length > 0){
            res.send('Nom déjà utilisé')
        } else {
    bdd.query(createUser,[nameUser, securedPassword], (error, result) => {
        if (error) throw error;
        res.send('utilisateur ajouté')
    } );
}
})
});

// créer un module de connexion


router.post('/loginUser', async (req, res) => {
    try {
        console.log(req.body);
        const { nameUser, passwordUser } = req.body;
        // Vérification si les champs sont remplis
        if (!nameUser || !passwordUser) {
            return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
        }
        const getUserQuery = "SELECT * FROM user WHERE nameUser = ?";
        bdd.query(getUserQuery, [nameUser], async (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Erreur interne du serveur" });
            }
            if (result.length === 0) {
                // Aucun utilisateur trouvé 
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            const user = result[0];
            const match = await bcrypt.compare(passwordUser, user.passwordUser);

            if (match) {
                // Connexion réussie

                // Créer un payload pour le JWT
                const payload = {
                    id: user.idUser
                };

                // Générer le JWT
                const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });

                // Répondre avec le token JWT
                return res.status(200).json({ message: "Connexion réussie", token });
                
            } else {
                // Mot de passe incorrect
                return res.status(401).json({ message: "Mot de passe incorrect" });
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
});
// Info perso 
router.post('/personnalInfo',  authenticateToken, (req, res) => {
    const {idUser} = req.body;
    const personnalInfo = "SELECT nameUser FROM user WHERE idUser = (?)"
    bdd.query(personnalInfo,[idUser], (error, result) => {
        if (error) throw error;
        res.send(result)
    } );
}
)

//Obtenir tout les user par tache
router.get('/AllUserByTasks', authenticateToken, (req, res) => {
    const {idTask} = req.body;
    console.log(idTask);
    const allUserByTasks = "SELECT u.nameUser FROM user u INNER JOIN user_task ut ON u.idUser = ut.idUser WHERE ut.idTask = (?)"
    bdd.query(allUserByTasks,[idTask], (error, result) => {
        if (error) throw error;
        res.send(result)
    } );
});





// Modifier un Utilisateur
router.post('/changePassword', authenticateToken, async (req, res) => {
    console.log(req.body);
    const {idUser, passwordUser} = req.body;
    const securedPassword = await bcrypt.hash(passwordUser, 10)
    const updateUser = "UPDATE user SET  passwordUser =? WHERE idUser =?"
    bdd.query(updateUser,[ securedPassword, idUser], (error, result) => {
        if (error) throw error;
        console.log('Utilisateur modifié')
        res.send('Utilisateur modifié')
    } );
});

// Supprimer un Utilisateur
router.post('/deleteUser', authenticateToken, (req, res) => {
    const {idUser} = req.body
    const deleteUser = "DELETE FROM user WHERE idUser =(?)"
    bdd.query(deleteUser, [idUser], (error, result) => {
        if (error) throw error;
        console.log('Utilisateur supprimé'+ idUser)
        res.send('Utilisateur supprimé')
    } );
});





module.exports = router;