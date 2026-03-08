## File Structure

```
saraha-app/
├── .env
├── package.json
├── TODO.md
├── src/
│   ├── index.js (main entry)
│   ├── config/
│   │   ├── index.js
│   │   └── google.passport.js
│   ├── DB/
│   │   ├── connection.js
│   │   └── models/
│   │       ├── user/
│   │       │   └── user.model.js
│   │       └── message/
│   │           └── message.model.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── message.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── message.service.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── message.routes.js
│   ├── middlewares/
│   │   ├── isAuth.middleware.js
│   │   └── errorHandler.middleware.js
│   └── utils/
│       └── generateCode.js
```

