# Projet Data DDEFI 2025-2026
Projet Data dans le cadre du cours DDEFI

## Membres du groupe :
- Rocío STUARDO : [GitHub](rstuardoc) - [Kaggle](rociostuardo)
- Lucas VULCANO : [GitHub](LSVulcano) - [Kaggle](lucassobralvulcano)
- Yassine TSOILI : [GitHub](hazime-y) - [Kaggle](yassinetsoulihazime)
- Vicente ABURTO : [GitHub](VichoAburto) - [Kaggle](vichoaburto)


## Before developing

1. **Move in main branch**
```git checkout main```

2. **Pull from main branch**
```git pull ```

3. **Create branch (it copies main branch)**
```git checkout -b branch-name```


## After developing
1. **Check all changes**
```git status```

2. **Add all changes**
```git add .```

3. **Commit changes**
```git commit -m "IMP: message"```
_**VERY IMPORTANTE TO SET A DESCRIPTIVE AND CONCISE MESSAGE**_ (Imperative method: ADD: ... , FIX: ... , UPDATE: ... , REMOVE: ...)

4. **Push changes**
```git push -u origin branch-name```


## Run the project locally

### ML Service
1. **Move in ml_service folder**
```cd ml_service```
2. **Build the Docker container**
```docker build -t ml_service .```
3. **Run the Docker container**
```docker run -p 8001:8001 ml_service```

### Backend
1. **Move in backend folder**
```cd backend```
2. **Install dependencies**
```npm install```
3. **Run the server**
```npm run dev```

### Frontend
1. **Move in frontend folder**
```cd frontend```
2. **Install dependencies**
```npm install```
3. **Run the development server**
```npm run dev```