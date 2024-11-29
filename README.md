créer la bdd :


CREATE DATABASE todolist;
USE todolist;

-- Création de la table 'user'
CREATE TABLE user (
    idUser INT PRIMARY KEY AUTO_INCREMENT,
    nameUser VARCHAR(50),
    passwordUser VARCHAR(255)
);

-- Création de la table 'state'
CREATE TABLE state (
    idState INT PRIMARY KEY AUTO_INCREMENT,
    libelleState VARCHAR(50)
);

-- Création de la table 'task'
CREATE TABLE task (
    idTask INT PRIMARY KEY AUTO_INCREMENT,
    libelleTask TEXT,
    idState INT,
    CONSTRAINT fk_state FOREIGN KEY (idState) REFERENCES state (idState) ON DELETE CASCADE
);

-- Création de la table intermédiaire 'user_task'
CREATE TABLE user_task (
    idUser INT,
    idTask INT,
    CONSTRAINT fk_user FOREIGN KEY (idUser) REFERENCES user (idUser) ON DELETE CASCADE,
    CONSTRAINT fk_task FOREIGN KEY (idTask) REFERENCES task (idTask) ON DELETE CASCADE,
    PRIMARY KEY (idUser, idTask)
);
