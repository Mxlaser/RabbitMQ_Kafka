# 🐇 RabbitMQ_Kafka — Système de Calcul Distribué

Projet d’implémentation d’un système de calcul distribué pour l’Institut de Physique Nucléaire, basé sur **RabbitMQ** et **Node.js**, avec **workers spécialisés** pour chaque opération mathématique.

---

## 🔧 Fonctionnement

Ce projet simule un environnement distribué où :
- Un **producteur (client)** envoie des opérations de calcul via RabbitMQ
- Des **workers spécialisés** traitent ces opérations (`add`, `sub`, `mul`, `div`)
- Un **consumer** récupère les résultats
- L’utilisateur peut également saisir des opérations **manuellement**
- Un message `"op": "all"` permet de faire travailler **tous les workers**

---

## 🗂️ Arborescence du projet

```
RabbitMQ_Kafka/
├── producer.js
├── consumer.js
├── manual_producer.js
├── config.js
├── docker-compose.yml
├── /workers/
│   ├── worker_add.js
│   ├── worker_sub.js
│   ├── worker_mul.js
│   └── worker_div.js
├── /utils/
│   └── math.js
├── README.md
└── rapport.md
```

---

## 📦 Installation

### Prérequis :
- Node.js v18+
- RabbitMQ (via Docker ou installé localement)
- Docker (optionnel mais recommandé pour RabbitMQ)

### Installer les dépendances :
```bash
npm install
```

---

## 🚀 Lancer RabbitMQ avec Docker

Tu peux lancer RabbitMQ **sans l’installer manuellement** grâce à :

```bash
docker-compose up -d
```

- Interface d’administration : http://localhost:15672  
  *(login: `guest`, password: `guest`)*

---

## ▶️ Lancer le système complet

Ouvre plusieurs terminaux et exécute les commandes suivantes :

### Lancer les 4 workers :
```bash
node workers/worker_add.js
node workers/worker_sub.js
node workers/worker_mul.js
node workers/worker_div.js
```

### Lancer le client producteur automatique :
```bash
node producer.js
```

### Lancer le consommateur de résultats :
```bash
node consumer.js
```

---

## ✍️ Envoi manuel d’opérations

Tu peux aussi saisir les opérations à la main avec un CLI :

```bash
node manual_producer.js
```

**Exemple de saisie** :
```
Opération (add, sub, mul, div, all) : add
Nombre 1 : 6
Nombre 2 : 4
```

---

## 📨 Exemple de message JSON envoyé

```json
{
  "n1": 6,
  "n2": 4,
  "op": "add",
  "requestId": "e45f1d62-..."
}
```

---

## 📥 Exemple de résultat reçu

```json
{
  "n1": 6,
  "n2": 4,
  "op": "add",
  "result": 10,
  "requestId": "e45f1d62-..."
}
```

---

## 📌 À savoir

- Le système supporte l’opération `"all"` qui envoie le message à **tous les workers**
- Un `requestId` unique est attaché à chaque message pour suivi
- Les workers attendent **5 à 15 secondes** aléatoirement pour simuler des calculs lourds

---

## 🧪 Arrêter tous les services Docker

```bash
docker-compose down
```

---

## 📄 Licence

Projet académique. Usage libre dans un contexte d’apprentissage.
