# Sarahah Backend Completion TODO

## Plan Steps (In Order):

### 1. Install Dependencies ✅

- [x] `npm i joi multer ioredis nodemailer`
- [x] Update package.json scripts if needed (e.g., test).

### 2. Configuration Updates ✅

- [x] Create `src/config/redis.js`
- [x] Create `src/config/email.js` (nodemailer)
- [x] Update `src/config/index.js`
- [x] Update `.env.example` template (copy to .env and fill values).

### 3. OTP System ✅

- [x] Create `src/DB/models/otp/otp.model.js`
- [x] Create `src/services/otp.service.js`
- [x] Update auth.service/controller/routes for OTP flow (signup -> sendOTP, /verify-otp -> create user + login).

### 4. Validation ✅

- [x] Create `src/utils/validators.js` (Joi schemas)
- [x] Create `src/middlewares/validate.middleware.js`
- [x] Apply to auth/message routes (signup, verify-otp, sendMessage).

### 5. File Uploads ✅

- [x] Update User model (+profilePicture)
- [x] Create `src/middlewares/upload.middleware.js` (Multer)
- [x] Create profile upload route/service/controller (`PUT /api/profile/pic`).

### 6. Redis Caching & Token Revoke

- [ ] Integrate Redis in auth (blacklist refreshTokens, cache profiles/OTPs)
- [ ] Update isAuth/refreshToken checks.
- [ ] New /logout-all endpoint.

### 7. Final Polish & Tests

- [ ] Update errorHandler for better responses.
- [ ] Test all flows.
- [ ] attempt_completion.

**Progress: Step 5 Complete - Step 6 Redis & Revoke**
