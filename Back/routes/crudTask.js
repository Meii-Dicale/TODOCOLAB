// |       1 = A faire  ||  2 = En cours  || 3 = Terminé

const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config(); 
const SECRET_KEY = process.env.SECRET_KEY ;

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
// Créer une tâche 

router.post('/createTask', authenticateToken, (req, res) => {
    const { idUser, libelleTask } = req.body;

    const createTask = "INSERT INTO task (libelleTask, idState) VALUES (?, 1)"; // créer la tache
    const associateTask = "INSERT INTO user_task (idUser, idTask) VALUES (?, ?)"; // ajouter la tache dans la table d'association 

    // Insérer la tâche dans la table `task`
    bdd.query(createTask, [libelleTask], (error, result) => {
        if (error) throw error;
        console.log(result)
        

        const idTask = result.insertId; // Récupérer l'ID de la tâche créée

        console.log(`Tâche ajoutée avec idTask: ${idTask}`);

         // Associer la tâche à l'utilisateur dans la table `user_task`
        bdd.query(associateTask, [idUser, idTask], (error) => {
            if (error) throw error;

        console.log('Association tâche-utilisateur ajoutée');
           res.status(200).json({ message: 'Tâche créée et associée à l’utilisateur' });
        });
    });
});


// supprimer une tâche

router.get('/deleteTask/:id',authenticateToken, (req, res) => {
    const idTask = req.params.id;
    console.log(idTask);
    const deleteTask = "DELETE FROM task WHERE idTask =(?)"
    bdd.query(deleteTask, [idTask], (error, result) => {
        if (error) throw error;
        console.log('Tâche supprimée')
        res.status(200).json({ message: 'Tâche supprimée' });
    } );
});

// Modifier une tâche

router.post('/updateTask/:id', authenticateToken,(req, res) => {
    const {libelleTask } = req.body;
    const idTask = req.params.id;
    const updateTask = "UPDATE task SET libelleTask =? WHERE idTask =?"
    bdd.query(updateTask,[libelleTask, idTask], (error, result) => {
        if (error) throw error;
        console.log('Tâche modifiée')
        res.status(200).json({ message: 'Tâche modifiée' });
    } );
});

// Modifier état de la tâche 

router.post('/updateStateTask/:id',authenticateToken, (req, res) => {
    const {idState } = req.body;
    const idTask = req.params.id;
    const updateStateTask = "UPDATE task SET idState =? WHERE idTask =?"
    bdd.query(updateStateTask,[idState, idTask], (error, result) => {
        if (error) throw error;
        console.log('Etat de la tâche modifié')
        res.status(200).json({ message: 'Etat de la tâche modifié' });
    } );
});

router.post('/allTasks', authenticateToken, (req, res) => {
    const { idUser } = req.body;
    console.log(idUser);

    // Vérifier que l'idUser est fourni
    if (!idUser) {
        return res.status(400).json({ error: 'idUser est requis' });
    }

    // SQL avec jointure entre user_task et task
    const allTasks = `
        SELECT t.* 
        FROM task AS t
        JOIN user_task AS ut ON t.idTask = ut.idTask
        WHERE ut.idUser = ?
    `;

    // Exécuter la requête
    bdd.query(allTasks, [idUser], (error, result) => {
        if (error) {
            console.error("Erreur lors de la récupération des tâches :", error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
        }

        // Si aucune tâche n'est trouvée
        if (result.length === 0) {
            return res.status(404).json({ message: 'Aucune tâche trouvée pour cet utilisateur' });
        }

        // Renvoyer les tâches trouvées
        res.status(200).json(result);
    });
});

// Ajouter un utilisateur sur la tâche 

router.post('/addUserToTask', authenticateToken, (req, res) => {
    const { nameUser, idTask } = req.body;
    const searchUser = " select idUser from user where nameUser = ?"
    bdd.query(searchUser, [nameUser], (error, result) => {
        if (error) throw error;
        if(result.length === 0){
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const idUserToAdd = result[0].idUser;
        const addUserToTask = "INSERT INTO user_task (idUser, idTask) VALUES (?,?)";
        bdd.query(addUserToTask, [idUserToAdd, idTask], (res, error) => {
            if (error) throw error;

            console.log('Utilisateur ajouté à la tâche');
            res.status(200).json({ message: 'Utilisateur ajouté à la tâche' });
        });
    });
});

// Supprimer un utilisateur sur la tâche

router.post('/deleteUserFromTask', authenticateToken, (req, res) => {
    const { nameUser, idTask } = req.body;
    const searchUser = " select idUser from user where nameUser =?"
    bdd.query(searchUser, [nameUser], (error, result) => {
        if (error) throw error;
        if(result.length === 0){
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const idUserToDelete = result[0].idUser;
        const deleteUserFromTask = "DELETE FROM user_task WHERE idUser =? AND idTask =?"
        bdd.query(deleteUserFromTask, [idUserToDelete, idTask], (error) => {
            if (error) throw error;

            console.log('Utilisateur supprimé de la tâche');

    res.status(200).json({ message: 'Utilisateur supprimé de la tâche' });
        })})});


// Récupérer tout les utilisateurs lié à la tâche

router.post('/allUsersFromTask', authenticateToken, (req, res) => {
    const { idTask } = req.body;

    // Vérifier que l'idTask est fourni
    if (!idTask) {
        return res.status(400).json({ error: 'idTask est requis' });
    }

    // SQL avec jointure entre user_task et user
    const allUsersFromTask = `
        SELECT u.* 
        FROM user AS u
        JOIN user_task AS ut ON u.idUser = ut.idUser
        WHERE ut.idTask =?
    `;

    // Exécuter la requête
    bdd.query(allUsersFromTask, [idTask], (error, result) => {
        if (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
        }})})

module.exports = router;