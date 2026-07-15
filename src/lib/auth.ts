import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { lastLoginMethod, username } from 'better-auth/plugins';
import { prisma } from '../../prisma/seed/client';
import { i18n } from '@better-auth/i18n';

let authInstance: ReturnType<typeof createAuth> | null = null;

export const getAuthInstance = () => {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
};

export const createAuth = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  return betterAuth({
    advanced: {
      defaultCookieAttributes: isDev
        ? {
            secure: false,
            sameSite: 'lax',
            httpOnly: true,
          }
        : {
            secure: true,
            sameSite: 'none',
            httpOnly: true,
          },
    },
    appName: process.env.APP_NAME,
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    user: {
      additionalFields: {
        role: {
          type: 'string',
          input: false,
        },
        status: {
          type: 'boolean',
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      revokeSessionsOnPasswordReset: true,
    },
    plugins: [
      i18n({
        translations: {
          fr: {
            USER_NOT_FOUND: 'Utilisateur non trouvé',
            INVALID_EMAIL_OR_PASSWORD: 'Email ou mot de passe invalide',
            INVALID_PASSWORD: 'Mot de passe invalide',
            CHALLENGE_NOT_FOUND: "La demande d'authentification est introuvable ou a expiré.",
            YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY:
              "Vous n'êtes pas autorisé à enregistrer cette clé de sécurité.",
            FAILED_TO_VERIFY_REGISTRATION:
              "Impossible de vérifier l'enregistrement de la clé de sécurité.",
            PASSKEY_NOT_FOUND: 'Clé de sécurité introuvable.',
            AUTHENTICATION_FAILED: "L'authentification avec la clé de sécurité a échoué.",
            UNABLE_TO_CREATE_SESSION: 'Impossible de créer la session utilisateur.',
            FAILED_TO_UPDATE_PASSKEY: 'Impossible de mettre à jour la clé de sécurité.',
            PREVIOUSLY_REGISTERED: 'Cette clé de sécurité est déjà enregistrée.',
            REGISTRATION_CANCELLED: "L'enregistrement de la clé de sécurité a été annulé.",
            AUTH_CANCELLED: "L'authentification a été annulée.",
            UNKNOWN_ERROR: 'Une erreur inconnue est survenue.',
            SESSION_REQUIRED: 'Vous devez être connecté pour effectuer cette action.',
            RESOLVE_USER_REQUIRED: "Impossible d'identifier l'utilisateur associé à cette clé.",
            RESOLVED_USER_INVALID: "L'utilisateur associé à cette clé de sécurité est invalide.",
            OTP_NOT_ENABLED: "L'authentification par code OTP n'est pas activée.",
            OTP_HAS_EXPIRED: 'Le code OTP a expiré. Veuillez demander un nouveau code.',
            TOTP_NOT_ENABLED: "L'authentification TOTP n'est pas activée.",
            TWO_FACTOR_NOT_ENABLED: "L'authentification à deux facteurs n'est pas activée.",
            BACKUP_CODES_NOT_ENABLED: 'Les codes de secours ne sont pas activés.',
            INVALID_BACKUP_CODE: 'Le code de secours est invalide.',
            INVALID_CODE: 'Le code saisi est invalide.',
            TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE:
              'Trop de tentatives échouées. Veuillez demander un nouveau code.',
            INVALID_TWO_FACTOR_COOKIE:
              'La session de vérification à deux facteurs est invalide ou expirée.',
          },
        },
      }),
      username(),
      lastLoginMethod({
        storeInDatabase: true,
      }),
    ],
    trustedOrigins: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : [],
  });
};
