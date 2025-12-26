# FanzSSO - Centralized Single Sign-On Guide

**Last Updated:** December 23, 2024
**Category:** Authentication & Security
**Audience:** Administrators, Developers

---

## Overview

FanzSSO is the centralized authentication system for all Fanz platforms. It provides:

- **Single Sign-On (SSO)**: One account across all 16+ Fanz platforms
- **OAuth 2.0 / OpenID Connect**: Industry-standard authentication protocols
- **Social Login**: Google, Twitter/X, Discord integration
- **Age Verification**: Integrated VerifyMy age verification
- **Role-Based Access**: Admin, Moderator, Creator, Fan roles
- **Platform Access Control**: Control which platforms users can access

---

## Supported Platforms

| Platform | Domain | Client ID |
|----------|--------|-----------|
| BoyFanz | boy.fanz.website | `boyfanz` |
| GayFanz | gay.fanz.website | `gayfanz` |
| GirlFanz | girl.fanz.website | `girlfanz` |
| TransFanz | trans.fanz.website | `transfanz` |
| MILFFanz | milf.fanz.website | `milffanz` |
| CougarFanz | cougar.fanz.website | `cougarfanz` |
| BearFanz | bear.fanz.website | `bearfanz` |
| DaddyFanz | daddy.fanz.website | `daddyfanz` |
| PupFanz | pup.fanz.website | `pupfanz` |
| TabooFanz | taboo.fanz.website | `taboofanz` |
| FanzUncut | uncut.fanz.website | `fanzuncut` |
| FemmeFanz | femme.fanz.website | `femmefanz` |
| BroFanz | bro.fanz.website | `brofanz` |
| DLBroz | dlbroz.fanz.website | `dlbroz` |
| SouthernFanz | southern.fanz.website | `southernfanz` |
| Guyz | guyz.fanz.website | `guyz` |

---

## Authentication Flow

### User Login Flow

```
1. User clicks "Login" on any platform
2. Platform redirects to sso.fanz.website/authorize
3. User authenticates (email/password or social login)
4. SSO server validates credentials
5. SSO redirects back to platform with authorization code
6. Platform exchanges code for access token
7. User is logged in with session established
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sso/authorize` | GET | Get SSO authorization URL |
| `/api/auth/sso/callback` | GET | Handle SSO callback |
| `/api/auth/sso/social/:provider` | GET | Social login redirects |
| `/api/auth/sso/user` | GET | Get current authenticated user |
| `/api/auth/sso/logout` | POST | Logout from platform |
| `/api/auth/sso/refresh` | POST | Refresh access token |

---

## Environment Configuration

Each platform requires these environment variables in `.env`:

```bash
# FanzSSO Configuration
SSO_BASE_URL=https://sso.fanz.website
SSO_CLIENT_ID=<platform_id>
SSO_CLIENT_SECRET=<secure_secret>
SSO_CALLBACK_URL=https://<platform>.fanz.website/auth/sso/callback
SSO_SHARED_SECRET=${JWT_SECRET}
```

### Generating Secure Secrets

Generate a cryptographically secure secret:

```bash
openssl rand -base64 32 | tr -d '=' | tr '+/' '-_'
```

**Requirements:**
- Minimum 32 characters
- URL-safe characters only (A-Z, a-z, 0-9, -, _)
- Unique per platform
- Never commit to git
- Rotate every 90 days

---

## Security Best Practices

### Secret Management

1. **Never commit secrets to git**
   - Use `.gitignore` to exclude `.env` files
   - Store secrets in encrypted vault

2. **Encrypt secrets at rest**
   ```bash
   # Encrypt
   openssl enc -aes-256-cbc -salt -pbkdf2 -in secrets.txt -out secrets.enc

   # Decrypt (when needed)
   openssl enc -aes-256-cbc -d -pbkdf2 -in secrets.enc -out secrets.txt
   ```

3. **Limit access**
   - Only administrators should have access to secrets
   - Use file permissions: `chmod 600 secrets.txt`

4. **Rotate regularly**
   - Rotate secrets every 90 days
   - Immediately rotate if compromise suspected

### Token Security

- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Tokens are stored in HTTP-only cookies
- CSRF protection enabled on all SSO endpoints

---

## User Roles & Permissions

### Role Hierarchy

| Role | Access Level | Permissions |
|------|-------------|-------------|
| Super Admin | Full | All permissions, bypass charges |
| Admin | Platform | Manage users, content, settings |
| Moderator | Content | Review content, handle reports |
| Creator | Publishing | Upload content, manage profile |
| Fan | Consumer | View content, interact |

### Super Admin Accounts

Super admin emails are configured in each platform's `ssoRoutes.ts`:

```typescript
const SUPER_ADMIN_EMAILS = [
  "wyatt@wyattxxxcole.com",
  "wyatt@fanz.website",
];
```

Super admins have:
- Unrestricted platform access
- No charges for premium content
- All administrative permissions
- Bypass age verification (for admin purposes)

---

## Troubleshooting

### Common Issues

#### "Invalid state parameter"
- **Cause:** CSRF protection triggered, session expired
- **Solution:** Clear cookies and try logging in again

#### "No authorization code"
- **Cause:** User cancelled login or SSO server error
- **Solution:** Retry login, check SSO server status

#### "Token refresh failed"
- **Cause:** Refresh token expired or revoked
- **Solution:** User must log in again

#### "Platform access denied"
- **Cause:** User doesn't have access to this platform
- **Solution:** Check user's platformAccess in SSO admin

### Debug Mode

Enable debug logging in `.env`:

```bash
DEBUG=fanz:sso*
LOG_LEVEL=debug
```

Check logs for detailed authentication flow:

```bash
pm2 logs <platform_name> --lines 100 | grep "FanzSSO"
```

---

## SSO Server Administration

### Registering New Platforms

1. Log into sso.fanz.website admin panel
2. Navigate to OAuth Clients
3. Add new client:
   - Client ID: `<platform_id>`
   - Client Secret: `<generated_secret>`
   - Redirect URIs: `https://<platform>.fanz.website/auth/sso/callback`
   - Allowed scopes: `openid profile email`

### Managing Users

1. View all users: SSO Admin > Users
2. Edit user roles: Click user > Edit Roles
3. Manage platform access: Click user > Platform Access
4. Force logout: Click user > Revoke Sessions

### Audit Logs

All authentication events are logged:
- Login attempts (success/failure)
- Token generation/refresh
- Password changes
- Role modifications

Access logs: SSO Admin > Audit Logs

---

## Integration Code Reference

### Server-Side Setup

```typescript
// server/index.ts
import { setupFanzSSO } from "../../shared/auth/fanzSSOAuth";

setupFanzSSO(app, {
  platformId: 'boyfanz',
  platformName: 'BoyFanz',
  clientSecret: process.env.SSO_CLIENT_SECRET,
  onUserLogin: async (user, req) => {
    logger.info({ userId: user.id, email: user.email }, 'User logged in via FanzSSO');
  },
});
```

### Protected Routes

```typescript
import { requireSSOAuth, optionalSSOAuth } from "../../shared/auth/fanzSSOAuth";

// Require authentication
app.get('/api/profile', requireSSOAuth(config), (req, res) => {
  res.json({ user: req.ssoUser });
});

// Optional authentication
app.get('/api/public', optionalSSOAuth(config), (req, res) => {
  if (req.ssoUser) {
    // Authenticated user
  } else {
    // Anonymous user
  }
});
```

### Client-Side Login

```typescript
// Redirect to SSO login
const loginUrl = '/api/auth/sso/authorize';
window.location.href = loginUrl;

// Check authentication status
const response = await fetch('/api/auth/sso/user');
const { authenticated, user } = await response.json();
```

---

## Related Documentation

- [Age Verification Guide](./age-verification-guide.md)
- [Compliance Overview](./compliance-overview.md)
- [API Keys Setup](./api-keys-setup.md)
- [Moderator Handbook](./moderator-handbook.md)

---

## Support

For SSO issues:
- **Technical Support:** tech@fanz.website
- **Security Issues:** security@fanz.website
- **Documentation:** kb.fanz.website
